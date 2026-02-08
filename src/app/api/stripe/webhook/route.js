import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Webhook用のSupabaseクライアント（サービスロールキー使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session) {
  const { user_id, factory_id, plan_id } = session.metadata;

  if (!user_id || !plan_id) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Stripeのサブスクリプション情報を取得
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

  // 購読レコードを作成
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id,
      factory_id: factory_id || null,
      plan_id: parseInt(plan_id),
      status: 'active',
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create subscription:', error);
    return;
  }

  // 工房の優先表示フラグを更新
  if (factory_id) {
    await supabaseAdmin
      .from('factories')
      .update({
        subscription_id: subscription.id,
        is_priority: true,
        priority_until: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', factory_id);
  }

  // プレミアムプランの場合、Webサイト申込レコードを作成
  const { data: plan } = await supabaseAdmin
    .from('subscription_plans')
    .select('is_premium')
    .eq('id', parseInt(plan_id))
    .single();

  if (plan?.is_premium && factory_id) {
    await supabaseAdmin
      .from('website_requests')
      .insert({
        subscription_id: subscription.id,
        factory_id,
        status: 'pending',
      });
  }
}

async function handleInvoicePaid(invoice) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 購読情報を更新
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  // 工房の優先表示期限を更新
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('factory_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub?.factory_id) {
    await supabaseAdmin
      .from('factories')
      .update({
        is_priority: true,
        priority_until: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', sub.factory_id);
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handleSubscriptionUpdated(subscription) {
  const status = subscription.status === 'active' ? 'active'
    : subscription.status === 'past_due' ? 'past_due'
    : subscription.status === 'canceled' ? 'canceled'
    : 'expired';

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
  // 購読をキャンセル状態に更新
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('factory_id')
    .single();

  // 工房の優先表示を解除
  if (sub?.factory_id) {
    await supabaseAdmin
      .from('factories')
      .update({
        is_priority: false,
        priority_until: null,
        subscription_id: null,
      })
      .eq('id', sub.factory_id);
  }
}
