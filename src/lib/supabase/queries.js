// 工房データ取得の共通SELECTフィールド（全APIルートで統一）
export const FACTORY_SELECT_FIELDS = `
  id,
  name,
  creator_name,
  tagline,
  story,
  status,
  work_types,
  color,
  accent,
  sns_links,
  cover_image,
  view_count,
  like_count,
  created_at,
  is_priority,
  priority_until,
  genre_id,
  genre_ids,
  genre:genres(id, name, slug),
  gallery:works(id, title, description, image_url, external_url, order_num),
  user:users(avatar_url)
`;

// featured_factories / owner_picks 内のネストされた工房クエリ用
export const FACTORY_NESTED_SELECT = `
  id,
  name,
  creator_name,
  tagline,
  story,
  status,
  work_types,
  color,
  accent,
  sns_links,
  cover_image,
  view_count,
  like_count,
  created_at,
  is_priority,
  priority_until,
  genre_id,
  genre_ids,
  genre:genres(id, name, slug),
  gallery:works(id, title, description, image_url, external_url, order_num),
  user:users(avatar_url)
`;
