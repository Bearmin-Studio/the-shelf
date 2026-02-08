import { createClient } from '@/lib/supabase/server';
import { stripe, PLAN_PRICE_IDS } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planSlug, factoryId } = await request.json();

    if (!planSlug || !['priority', 'premium'].includes(planSlug)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // ユーザー情報を取得
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single();

    // Stripe Customer を取得または作成
    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        name: userData?.name || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Supabaseに保存
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // プラン情報を取得
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const priceId = PLAN_PRICE_IDS[planSlug];

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
    }

    // Checkout Session を作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        factory_id: factoryId || '',
        plan_id: plan.id.toString(),
        plan_slug: planSlug,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          factory_id: factoryId || '',
          plan_id: plan.id.toString(),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
