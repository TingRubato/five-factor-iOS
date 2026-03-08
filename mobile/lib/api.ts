import axios from 'axios';

// In development, change this to your local machine's IP
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Set JWT token for all future requests
export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
}

// ── Auth / User ───────────────────────────────────────────────
export async function createUser(username: string, email: string, password: string) {
  const res = await client.post('/users/', { username, email, password });
  return res.data;
}

export async function login(username: string, password: string) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  
  const res = await client.post('/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  if (res.data.access_token) {
    setAuthToken(res.data.access_token);
  }
  return res.data;
}

// ── Test Submission ───────────────────────────────────────────
export async function submitTest(
  userId: string,
  answers: Record<number, number>,
  version: string = 'ipip-15-v1'
) {
  // Convert numeric keys to strings to match the backend Dict[str, int] type
  const stringKeyedAnswers: Record<string, number> = {};
  for (const [key, val] of Object.entries(answers)) {
    stringKeyedAnswers[String(key)] = val;
  }

  const res = await client.post(`/test/submit/${userId}`, {
    answers: stringKeyedAnswers,
    version,
  });
  return res.data;
}

// ── Profile ───────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const res = await client.get(`/profile/${userId}`);
  return res.data;
}

export async function getUserProfile(targetUserId: string, myUserId: string) {
  const res = await client.get(`/profile/${targetUserId}`, {
    params: { viewer_id: myUserId },
  });
  return res.data;
}

// ── Feed ──────────────────────────────────────────────────────

export interface FeedItem {
  id: string;
  author_id: string;
  topic_id: string | null;
  title: string;
  body: string;
  snapshot_archetype: string | null;
  snapshot_o: number | null;
  snapshot_c: number | null;
  snapshot_e: number | null;
  snapshot_a: number | null;
  snapshot_n: number | null;
  upvotes: number;
  created_at: string;
  rank_score: number;
}

export interface FeedPage {
  items: FeedItem[];
  pagination: { limit: number; offset: number; returned: number };
}

export async function getFeed(
  userId: string,
  mode: string = 'default',
  limit: number = 20,
  offset: number = 0
): Promise<FeedPage> {
  const res = await client.get('/feed/', {
    params: { user_id: userId, mode, limit, offset },
  });
  return res.data as FeedPage;
}

// ── Posts ─────────────────────────────────────────────────────
export async function createPost(
  userId: string,
  title: string,
  body: string,
  topicId?: string
) {
  const res = await client.post('/posts/', {
    user_id: userId,
    title,
    body,
    topic_id: topicId ?? null,
  });
  return res.data;
}

export default client;
