import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, change this to your local machine's IP (e.g., http://192.168.1.x:8000)
// Use 127.0.0.1 for iOS simulator or 10.0.2.2 for Android emulator if localhost fails.
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'archetype_auth_token';

// ── Types ─────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  is_guest: boolean;
  auth_provider?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
  is_new?: boolean;
}

export interface OceanScores {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
}

export interface ProfileResponse {
  user_id: string;
  username?: string;
  quiz_version?: string;
  primary_archetype?: string;
  secondary_archetype?: string;
  is_public: boolean;
  scores?: OceanScores;
  z_scores?: OceanScores;
  scoring_version?: string;
  archetype_version?: string;
  compatibility?: number;
}

export interface PostResponse {
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
}

export interface FeedItem extends PostResponse {
  rank_score: number;
}

export interface FeedPage {
  items: FeedItem[];
  pagination: { limit: number; offset: number; returned: number };
}

export interface QuizQuestion {
  id: number;
  text: string;
  dimension: 'O' | 'C' | 'E' | 'A' | 'N';
  reversed: boolean;
}

export interface QuizData {
  version: string;
  questions: QuizQuestion[];
}

export type FeedMode = 'default' | 'similar' | 'opposing';

// ── Client Setup ──────────────────────────────────────────────

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors for global error handling
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const data = error.response?.data as any;
    const message = data?.detail || error.message || 'Unknown network error';

    if (error.response?.status === 401) {
      console.warn('Unauthorized - clearing token');
      await AsyncStorage.removeItem(TOKEN_KEY);
      delete client.defaults.headers.common['Authorization'];
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }

    // Wrap the error message for easier UI consumption
    error.message = message;
    return Promise.reject(error);
  }
);

// Set JWT token for all future requests and persist it
export async function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    delete client.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

// Load token from storage on app start
export async function bootstrapAuth() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  }
  return null;
}

// ── Auth / User ───────────────────────────────────────────────

export async function createUser(username: string, email: string, password: string): Promise<UserResponse> {
  const res = await client.post('/users/', { username, email, password });
  return res.data;
}

export async function login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  
  const res = await client.post('/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  if (res.data.access_token) {
    await setAuthToken(res.data.access_token);
  }
  return res.data;
}

// ── Social Auth ──────────────────────────────────────────────

export async function loginWithApple(identityToken: string): Promise<AuthResponse> {
  const res = await client.post('/api/auth/apple', { identity_token: identityToken });
  if (res.data.token) await setAuthToken(res.data.token);
  return res.data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await client.post('/api/auth/google', { id_token: idToken });
  if (res.data.token) await setAuthToken(res.data.token);
  return res.data;
}

export async function sendPhoneOtp(phone: string): Promise<{ message: string; dev_code?: string }> {
  const res = await client.post('/api/auth/phone/send-otp', { phone });
  return res.data;
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<AuthResponse> {
  const res = await client.post('/api/auth/phone/verify', { phone, code });
  if (res.data.token) await setAuthToken(res.data.token);
  return res.data;
}

export async function migrateGuest(
  guestUserId: string,
  authProvider: string,
  authToken?: string,
  phone?: string,
  code?: string,
): Promise<AuthResponse> {
  const res = await client.post('/api/auth/migrate-guest', {
    guest_user_id: guestUserId,
    auth_provider: authProvider,
    auth_token: authToken,
    phone,
    code,
  });
  if (res.data.token) await setAuthToken(res.data.token);
  return res.data;
}

// ── Rooms ────────────────────────────────────────────────────

export async function getRooms() {
  const res = await client.get('/api/rooms');
  return res.data;
}

export async function getRoomPosts(roomId: string, limit = 20, offset = 0) {
  const res = await client.get(`/api/rooms/${roomId}/posts`, { params: { limit, offset } });
  return res.data;
}

export async function createRoomPost(roomId: string, title: string, body: string) {
  const res = await client.post(`/api/rooms/${roomId}/posts`, { title, body });
  return res.data;
}

export async function joinRoom(roomId: string) {
  const res = await client.post(`/api/rooms/${roomId}/join`);
  return res.data;
}

export async function getUserRooms(userId: string) {
  const res = await client.get(`/api/users/${userId}/rooms`);
  return res.data;
}

// ── Test Submission ───────────────────────────────────────────

export async function submitTest(
  userId: string,
  answers: Record<number, number>,
  version: string = 'ipip-15-v1'
): Promise<ProfileResponse> {
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

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const res = await client.get(`/profile/${userId}`);
  return res.data;
}

export async function getUserProfile(targetUserId: string, myUserId: string): Promise<ProfileResponse> {
  const res = await client.get(`/profile/${targetUserId}`, {
    params: { viewer_id: myUserId },
  });
  return res.data;
}

export async function updateProfileVisibility(userId: string, isPublic: boolean): Promise<ProfileResponse> {
  const res = await client.patch(`/profile/${userId}`, {
    is_public: isPublic,
  });
  return res.data;
}

export async function clearProfileScores(userId: string): Promise<void> {
  await client.delete(`/profile/${userId}/scores`);
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await client.delete(`/users/${userId}`);
}

// ── Quiz ──────────────────────────────────────────────────────

export async function getQuiz(version: string): Promise<QuizData> {
  const res = await client.get(`/quiz/version/${version}`);
  return res.data;
}

// ── Feed ──────────────────────────────────────────────────────

export async function getFeed(
  userId: string,
  mode: FeedMode = 'default',
  limit: number = 20,
  offset: number = 0
): Promise<FeedPage> {
  const res = await client.get('/feed/', {
    params: { user_id: userId, mode, limit, offset },
  });
  return res.data;
}

// ── Posts ─────────────────────────────────────────────────────

export async function createPost(
  userId: string,
  title: string,
  body: string,
  topicId?: string
): Promise<PostResponse> {
  const res = await client.post('/posts/', {
    user_id: userId,
    title,
    body,
    topic_id: topicId ?? null,
  });
  return res.data;
}

export default client;
