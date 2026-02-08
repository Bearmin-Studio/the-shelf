// データを正規化（DB形式を統一フォーマットに変換）
export function normalizeFactory(f, genresMap = {}) {
  if (!f) return null;

  // genre_idsをジャンル名の配列に変換
  let genreNames = [];
  if (Array.isArray(f.genre_ids) && f.genre_ids.length > 0) {
    genreNames = f.genre_ids.map(id => {
      const genre = genresMap[id];
      return genre?.name || `ジャンル${id}`;
    });
  }

  return {
    id: f.id,
    name: f.name,
    creator: f.creator_name || f.creator,
    creatorAvatar: f.user?.avatar_url || f.creatorAvatar || null,
    tagline: f.tagline,
    story: f.story,
    genre: f.genre?.name || f.genre,
    genre_id: f.genre_id,
    genre_ids: f.genre_ids || [],
    genreNames: genreNames.length > 0 ? genreNames : [f.genre?.name || f.genre], // ジャンル名の配列
    status: f.status,
    color: f.color,
    accent: f.accent,
    works: f.work_types || f.works || [],
    gallery: f.gallery || [],  // 作品ギャラリー（画像付き）
    sns: Array.isArray(f.sns_links)
      ? f.sns_links
      : f.sns || [],
    coverImage: f.cover_image || null,
    viewCount: f.view_count || 0,
    likeCount: f.like_count || 0,
    is_priority: f.is_priority || false,
    priority_until: f.priority_until || null,
  };
}

// ジャンル配列からID->オブジェクトのマップを作成
export function buildGenresMap(genres) {
  if (!Array.isArray(genres)) return {};
  return genres.reduce((acc, genre) => {
    acc[genre.id] = genre;
    return acc;
  }, {});
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
