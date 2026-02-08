const API_BASE = '/api';

/**
 * Fetch factories list with optional filters
 */
export async function fetchFactories({ genre, status, sort, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (genre) params.set('genre', genre);
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));

  const res = await fetch(`${API_BASE}/factories?${params}`);
  if (!res.ok) throw new Error('Failed to fetch factories');
  return res.json();
}

/**
 * Fetch single factory by ID
 */
export async function fetchFactory(id) {
  const res = await fetch(`${API_BASE}/factories/${id}`);
  if (!res.ok) throw new Error('Failed to fetch factory');
  return res.json();
}

/**
 * Fetch featured factory for current month
 */
export async function fetchFeatured({ genre } = {}) {
  const params = new URLSearchParams();
  if (genre) params.set('genre', genre);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/featured${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch featured');
  return res.json();
}

/**
 * Fetch owner picks
 */
export async function fetchOwnerPicks({ genre } = {}) {
  const params = new URLSearchParams();
  if (genre) params.set('genre', genre);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/owner-picks${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch owner picks');
  return res.json();
}

/**
 * Fetch all genres
 */
export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}
