'use client';
import { useState, useEffect } from 'react';
import { fetchGenres } from '@/lib/api/factories';
import ImageUpload from './ImageUpload';
import { useAuth } from '@/hooks/useAuth';

// デフォルトカラー
const DEFAULT_COLOR = '#6366f1';
const DEFAULT_ACCENT = '#818cf8';

// SVG Icons
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

export default function FactoryFormModal({ onClose, onSuccess, factory }) {
  const isEditMode = !!factory;
  const { user } = useAuth();
  const [genres, setGenres] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const totalSteps = 3; // 常に3ステップ（ギャラリーを含む）

  const [formData, setFormData] = useState({
    name: '',
    creator_name: '',
    tagline: '',
    story: '',
    genre_ids: [],
    work_types: [],
    sns_links: [],
    cover_image: '',
    status: 'available',
  });

  // ギャラリー（作品集）
  const [gallery, setGallery] = useState([]);
  const [pendingWorks, setPendingWorks] = useState([]); // 新規作成時の一時保存用
  const [newWork, setNewWork] = useState({ title: '', description: '', image_url: '', external_url: '' });
  const [isAddingWork, setIsAddingWork] = useState(false);

  const [workInput, setWorkInput] = useState('');
  const [snsInput, setSnsInput] = useState({ platform: '', url: '' });

  // ユーザーアバター
  const [userAvatar, setUserAvatar] = useState('');

  // Load genres
  useEffect(() => {
    fetchGenres().then(res => {
      if (res.data) setGenres(res.data);
    });
  }, []);

  // Initialize form data in edit mode
  useEffect(() => {
    if (factory && genres.length > 0) {
      // 単一ジャンルまたは複数ジャンルに対応
      let genreIds = [];
      if (factory.genre_ids && Array.isArray(factory.genre_ids)) {
        genreIds = factory.genre_ids.map(id => id.toString());
      } else if (factory.genre) {
        const genreObj = genres.find(g => g.name === factory.genre || g.slug === factory.genre);
        if (genreObj?.id) genreIds = [genreObj.id.toString()];
      }

      setFormData({
        name: factory.name || '',
        creator_name: factory.creator || '',
        tagline: factory.tagline || '',
        story: factory.story || '',
        genre_ids: genreIds,
        work_types: factory.works || [],
        sns_links: factory.sns || [],
        cover_image: factory.coverImage || '',
        status: factory.status || 'available',
      });
      // ギャラリーを初期化
      if (factory.gallery) {
        setGallery(factory.gallery);
      }
    }
  }, [factory, genres]);

  // ユーザーアバターを取得（編集モードのみ）
  useEffect(() => {
    if (isEditMode) {
      fetch('/api/user/avatar')
        .then(res => res.json())
        .then(data => {
          if (data.data?.avatar_url) {
            setUserAvatar(data.data.avatar_url);
          }
        })
        .catch(err => console.error('Failed to fetch user avatar:', err));
    }
  }, [isEditMode]);

  // ユーザーアバターを更新
  const handleAvatarChange = async (url) => {
    setUserAvatar(url);
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to update avatar:', data.error);
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

  // 作品を追加
  const handleAddGalleryWork = async () => {
    if (!newWork.title.trim()) return;

    if (isEditMode) {
      // 編集モード: APIで直接追加
      setIsAddingWork(true);
      try {
        const res = await fetch('/api/my-factory/works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWork),
        });
        const data = await res.json();
        if (res.ok && data.data) {
          setGallery(prev => [...prev, data.data]);
          setNewWork({ title: '', description: '', image_url: '', external_url: '' });
        } else {
          setError(data.error || '作品の追加に失敗しました');
        }
      } catch (err) {
        setError('作品の追加に失敗しました');
      } finally {
        setIsAddingWork(false);
      }
    } else {
      // 新規作成モード: ローカルに一時保存
      const tempWork = {
        ...newWork,
        id: `temp-${Date.now()}`, // 一時ID
      };
      setPendingWorks(prev => [...prev, tempWork]);
      setNewWork({ title: '', description: '', image_url: '', external_url: '' });
    }
  };

  // 作品を削除
  const handleDeleteGalleryWork = async (workId) => {
    // 一時作品（新規作成モード）
    if (typeof workId === 'string' && workId.startsWith('temp-')) {
      setPendingWorks(prev => prev.filter(w => w.id !== workId));
      return;
    }

    // 既存作品（編集モード）
    try {
      const res = await fetch(`/api/my-factory/works?id=${workId}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(prev => prev.filter(w => w.id !== workId));
      }
    } catch (err) {
      console.error('Failed to delete work:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddWork = () => {
    if (workInput.trim() && formData.work_types.length < 5) {
      setFormData(prev => ({
        ...prev,
        work_types: [...prev.work_types, workInput.trim()]
      }));
      setWorkInput('');
    }
  };

  const handleRemoveWork = (index) => {
    setFormData(prev => ({
      ...prev,
      work_types: prev.work_types.filter((_, i) => i !== index)
    }));
  };

  const handleAddSns = () => {
    if (snsInput.platform && snsInput.url && formData.sns_links.length < 5) {
      setFormData(prev => ({
        ...prev,
        sns_links: [...prev.sns_links, { platform: snsInput.platform, url: snsInput.url }]
      }));
      setSnsInput({ platform: '', url: '' });
    }
  };

  const handleRemoveSns = (index) => {
    setFormData(prev => ({
      ...prev,
      sns_links: prev.sns_links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ログイン状態チェック
    if (!user) {
      setError('ログインが必要です。ログインしてから再度お試しください。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditMode ? '/api/my-factory' : '/api/factories';
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        genre_ids: formData.genre_ids.map(id => parseInt(id)),
      };

      console.log('🔐 ユーザー:', user?.id);
      console.log('🚀 送信データ:', payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('📥 レスポンス:', data);

      if (!res.ok) {
        throw new Error(data.error || (isEditMode ? '更新に失敗しました' : '登録に失敗しました'));
      }

      // 新規作成時に一時保存した作品を登録
      if (!isEditMode && pendingWorks.length > 0) {
        for (const work of pendingWorks) {
          const { id, ...workData } = work; // 一時IDを除外
          await fetch('/api/my-factory/works', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workData),
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 工房を削除
  const handleDelete = async () => {
    if (!confirm('本当に工房を削除しますか？この操作は取り消せません。')) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/my-factory', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '削除に失敗しました');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const canProceed = step === 1
    ? formData.name && formData.tagline && formData.genre_ids.length > 0
    : step === 2
      ? formData.work_types.length > 0
      : true; // step 3 (gallery) は任意

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[640px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.35s ease' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-8 pb-0 sm:pb-0">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon />
          </button>
          <h2 className="text-[20px] sm:text-[24px] font-bold mb-1.5 sm:mb-2" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
            {isEditMode ? '工房を編集' : '工房を出す'}
          </h2>
          <p className="text-[13px] sm:text-sm text-[var(--text-tertiary)] mb-4 sm:mb-5">
            {isEditMode ? '工房の情報を更新します' : 'あなたの挑戦を棚に並べよう'}
          </p>

          {/* Progress */}
          <div className="flex gap-2 mb-4 sm:mb-5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-[var(--accent)]' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-8 pb-4 sm:pb-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  工房名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: ピクセルアトリエ"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
                  maxLength={30}
                />
              </div>

              {isEditMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      クリエイター名
                    </label>
                    <input
                      type="text"
                      name="creator_name"
                      value={formData.creator_name}
                      onChange={handleChange}
                      placeholder="例: 山田太郎"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      プロフィールアイコン
                    </label>
                    <ImageUpload
                      value={userAvatar}
                      onChange={handleAvatarChange}
                      type="avatar"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  キャッチコピー <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="例: あなたの世界観をドット絵で表現します"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  ジャンル（複数選択可） <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map(g => {
                    const isSelected = formData.genre_ids.includes(g.id.toString());
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const genreId = g.id.toString();
                            const isCurrentlySelected = prev.genre_ids.includes(genreId);
                            return {
                              ...prev,
                              genre_ids: isCurrentlySelected
                                ? prev.genre_ids.filter(id => id !== genreId)
                                : [...prev.genre_ids, genreId]
                            };
                          });
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
                {formData.genre_ids.length === 0 && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    1つ以上選択してください
                  </p>
                )}
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    ステータス
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'available', label: '受付中' },
                      { value: 'busy', label: '多忙' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${formData.status === opt.value
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  制作ストーリー
                </label>
                <textarea
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  placeholder="あなたが制作を始めたきっかけや想いを書いてください"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm resize-none"
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  カバー画像
                </label>
                <ImageUpload
                  value={formData.cover_image}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
                  type="cover"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  依頼可能な制作（最大5つ） <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={workInput}
                    onChange={e => setWorkInput(e.target.value)}
                    placeholder="例: キャラクターデザイン"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWork();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddWork}
                    disabled={!workInput.trim() || formData.work_types.length >= 5}
                    className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    追加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.work_types.map((w, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] border border-[var(--border)]"
                    >
                      {w}
                      <button
                        type="button"
                        onClick={() => handleRemoveWork(i)}
                        className="text-[var(--text-tertiary)] hover:text-red-500 text-lg leading-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                {formData.work_types.length === 0 && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    1つ以上追加してください
                  </p>
                )}
              </div>

              {/* SNS */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  SNSリンク（最大5つ）
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex gap-2 sm:contents">
                    <select
                      value={snsInput.platform}
                      onChange={e => setSnsInput(prev => ({ ...prev, platform: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-white flex-1 sm:flex-none"
                    >
                      <option value="">選択</option>
                      <option value="Twitter">Twitter/X</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Pixiv">Pixiv</option>
                      <option value="Website">Website</option>
                      <option value="Other">その他</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSns}
                      disabled={!snsInput.platform || !snsInput.url || formData.sns_links.length >= 5}
                      className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap sm:order-last"
                    >
                      追加
                    </button>
                  </div>
                  <input
                    type="url"
                    value={snsInput.url}
                    onChange={e => setSnsInput(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm min-w-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sns_links.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] border border-[var(--border)]"
                    >
                      {typeof s === 'string' ? s : s.platform}
                      <button
                        type="button"
                        onClick={() => handleRemoveSns(i)}
                        className="text-[var(--text-tertiary)] hover:text-red-500 text-lg leading-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  作品ギャラリー
                </label>
                <p className="text-xs text-[var(--text-tertiary)] mb-3">
                  作品画像を追加して、あなたの実績をアピールしましょう（任意）
                </p>

                {/* 作品一覧（編集モード: gallery, 新規作成モード: pendingWorks） */}
                {(isEditMode ? gallery : pendingWorks).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(isEditMode ? gallery : pendingWorks).map(work => (
                      <div key={work.id} className="relative group border border-[var(--border)] rounded-xl overflow-hidden">
                        {work.image_url ? (
                          <img src={work.image_url} alt={work.title} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 bg-[var(--bg-secondary)] flex items-center justify-center">
                            <span className="text-2xl font-bold opacity-20">{work.title[0]}</span>
                          </div>
                        )}
                        <div className="p-2">
                          <div className="text-xs font-medium truncate">{work.title}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryWork(work.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 新規作品追加フォーム */}
                <div className="border border-dashed border-[var(--border)] rounded-xl p-4">
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={newWork.title}
                        onChange={e => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="作品タイトル"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        value={newWork.image_url}
                        onChange={(url) => setNewWork(prev => ({ ...prev, image_url: url }))}
                        type="work"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={newWork.external_url}
                        onChange={e => setNewWork(prev => ({ ...prev, external_url: e.target.value }))}
                        placeholder="作品URL（任意）例: https://example.com/work"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGalleryWork}
                      disabled={!newWork.title.trim() || isAddingWork}
                      className="w-full py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PlusIcon />
                      {isAddingWork ? 'アップロード中...' : 'アップロード'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-8 pt-0 sm:pt-0">
          {/* Delete button - edit mode only */}
          {isEditMode && step === 1 && (
            <div className="mb-4 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '工房を削除'}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-all"
              >
                戻る
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="flex-1 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-all"
              >
                次へ
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-all"
              >
                {isSubmitting ? (isEditMode ? '更新中...' : '登録中...') : (isEditMode ? '工房を更新' : '工房を登録')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
