/**
 * localStorage に保存されていた工房をデータベースのいいねに移行する
 * 一度だけ実行され、完了後は localStorage から削除される
 */
export async function migrateLocalStorageSaves() {
  const SAVED_KEY = 'saved_factories';

  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    if (saved.length === 0) {
      console.log('No saved factories to migrate');
      return;
    }

    console.log(`Migrating ${saved.length} saved factories to likes...`);

    // 各工房に対してバッチでいいねを追加
    const results = await Promise.allSettled(
      saved.map(factoryId =>
        fetch(`/api/factories/${factoryId}/like`, { method: 'POST' })
          .then(res => res.json())
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Migration complete: ${succeeded} succeeded, ${failed} failed`);

    // 成功したらlocalStorageをクリア
    if (succeeded > 0) {
      localStorage.removeItem(SAVED_KEY);
      console.log('LocalStorage cleared');
    }

    return { succeeded, failed, total: saved.length };
  } catch (err) {
    console.error('Migration failed:', err);
    return { succeeded: 0, failed: 0, total: 0, error: err.message };
  }
}
