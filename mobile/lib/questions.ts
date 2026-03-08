// IPIP Big Five items for progressive profiling
// Phase 1: 15 questions (3 per dimension) — ~2 min icebreaker
// Phase 2: 35 questions (7 per dimension) — deep unlock
// Total: 50 items (10 per dimension) for full-precision scoring

export interface Question {
  id: number;
  text: string;
  textZh: string;
  dimension: 'O' | 'C' | 'E' | 'A' | 'N';
  reversed: boolean;
}

// ── Phase 1: Mini-IPIP Icebreaker (15 items) ──────────────────
export const PHASE1_QUESTIONS: Question[] = [
  // Openness (O)
  { id: 1, text: 'I have a vivid imagination.', textZh: '我有丰富的想象力。', dimension: 'O', reversed: false },
  { id: 2, text: 'I am not interested in abstract ideas.', textZh: '我对抽象的想法不感兴趣。', dimension: 'O', reversed: true },
  { id: 3, text: 'I enjoy hearing new ideas.', textZh: '我喜欢听到新的想法。', dimension: 'O', reversed: false },

  // Conscientiousness (C)
  { id: 4, text: 'I get chores done right away.', textZh: '我会立刻完成日常任务。', dimension: 'C', reversed: false },
  { id: 5, text: 'I often forget to put things back in their proper place.', textZh: '我经常忘记把东西放回原位。', dimension: 'C', reversed: true },
  { id: 6, text: 'I like order.', textZh: '我喜欢有条理。', dimension: 'C', reversed: false },

  // Extraversion (E)
  { id: 7, text: 'I am the life of the party.', textZh: '我是聚会的中心人物。', dimension: 'E', reversed: false },
  { id: 8, text: 'I don\'t talk a lot.', textZh: '我话不多。', dimension: 'E', reversed: true },
  { id: 9, text: 'I feel comfortable around people.', textZh: '我在人群中感到自在。', dimension: 'E', reversed: false },

  // Agreeableness (A)
  { id: 10, text: 'I sympathize with others\' feelings.', textZh: '我能体谅他人的感受。', dimension: 'A', reversed: false },
  { id: 11, text: 'I am not really interested in others.', textZh: '我对其他人并不真的感兴趣。', dimension: 'A', reversed: true },
  { id: 12, text: 'I take time out for others.', textZh: '我愿意花时间帮助他人。', dimension: 'A', reversed: false },

  // Neuroticism (N)
  { id: 13, text: 'I have frequent mood swings.', textZh: '我经常情绪波动。', dimension: 'N', reversed: false },
  { id: 14, text: 'I seldom feel blue.', textZh: '我很少感到沮丧。', dimension: 'N', reversed: true },
  { id: 15, text: 'I get stressed out easily.', textZh: '我容易感到紧张。', dimension: 'N', reversed: false },
];

// ── Phase 2: Deep Unlock (35 additional items) ────────────────
export const PHASE2_QUESTIONS: Question[] = [
  // Openness (O) — 7 more
  { id: 16, text: 'I am full of ideas.', textZh: '我充满各种想法。', dimension: 'O', reversed: false },
  { id: 17, text: 'I avoid difficult reading material.', textZh: '我回避有难度的阅读材料。', dimension: 'O', reversed: true },
  { id: 18, text: 'I carry the conversation to a higher level.', textZh: '我能将对话引向更深的层次。', dimension: 'O', reversed: false },
  { id: 19, text: 'I do not like art.', textZh: '我不喜欢艺术。', dimension: 'O', reversed: true },
  { id: 20, text: 'I tend to vote for liberal political candidates.', textZh: '我倾向于支持开放进步的观点。', dimension: 'O', reversed: false },
  { id: 21, text: 'I am not interested in theoretical discussions.', textZh: '我对理论性讨论不感兴趣。', dimension: 'O', reversed: true },
  { id: 22, text: 'I enjoy wild flights of fantasy.', textZh: '我喜欢天马行空的幻想。', dimension: 'O', reversed: false },

  // Conscientiousness (C) — 7 more
  { id: 23, text: 'I am always prepared.', textZh: '我总是做好准备。', dimension: 'C', reversed: false },
  { id: 24, text: 'I leave my belongings around.', textZh: '我经常把东西乱放。', dimension: 'C', reversed: true },
  { id: 25, text: 'I pay attention to details.', textZh: '我注重细节。', dimension: 'C', reversed: false },
  { id: 26, text: 'I make a mess of things.', textZh: '我经常把事情搞砸。', dimension: 'C', reversed: true },
  { id: 27, text: 'I follow a schedule.', textZh: '我遵循计划和日程。', dimension: 'C', reversed: false },
  { id: 28, text: 'I shirk my duties.', textZh: '我会逃避自己的责任。', dimension: 'C', reversed: true },
  { id: 29, text: 'I carry out my plans.', textZh: '我会执行自己的计划。', dimension: 'C', reversed: false },

  // Extraversion (E) — 7 more
  { id: 30, text: 'I start conversations.', textZh: '我主动发起对话。', dimension: 'E', reversed: false },
  { id: 31, text: 'I keep in the background.', textZh: '我喜欢待在幕后。', dimension: 'E', reversed: true },
  { id: 32, text: 'I talk to a lot of different people at parties.', textZh: '我在聚会上和很多不同的人交谈。', dimension: 'E', reversed: false },
  { id: 33, text: 'I have little to say.', textZh: '我没什么话好说。', dimension: 'E', reversed: true },
  { id: 34, text: 'I don\'t mind being the center of attention.', textZh: '我不介意成为关注的焦点。', dimension: 'E', reversed: false },
  { id: 35, text: 'I am quiet around strangers.', textZh: '我在陌生人面前很安静。', dimension: 'E', reversed: true },
  { id: 36, text: 'I make friends easily.', textZh: '我很容易交到朋友。', dimension: 'E', reversed: false },

  // Agreeableness (A) — 7 more
  { id: 37, text: 'I feel others\' emotions.', textZh: '我能感受到他人的情绪。', dimension: 'A', reversed: false },
  { id: 38, text: 'I am not interested in other people\'s problems.', textZh: '我对别人的问题不感兴趣。', dimension: 'A', reversed: true },
  { id: 39, text: 'I make people feel at ease.', textZh: '我能让人感到轻松自在。', dimension: 'A', reversed: false },
  { id: 40, text: 'I insult people.', textZh: '我会冒犯别人。', dimension: 'A', reversed: true },
  { id: 41, text: 'I have a soft heart.', textZh: '我心肠很软。', dimension: 'A', reversed: false },
  { id: 42, text: 'I am indifferent to the feelings of others.', textZh: '我对他人的感受漠不关心。', dimension: 'A', reversed: true },
  { id: 43, text: 'I inquire about others\' well-being.', textZh: '我会关心他人的状况。', dimension: 'A', reversed: false },

  // Neuroticism (N) — 7 more
  { id: 44, text: 'I get irritated easily.', textZh: '我容易烦躁。', dimension: 'N', reversed: false },
  { id: 45, text: 'I am relaxed most of the time.', textZh: '我大多数时候很放松。', dimension: 'N', reversed: true },
  { id: 46, text: 'I worry about things.', textZh: '我总是担心事情。', dimension: 'N', reversed: false },
  { id: 47, text: 'I rarely get irritated.', textZh: '我很少感到烦躁。', dimension: 'N', reversed: true },
  { id: 48, text: 'I often feel blue.', textZh: '我经常感到忧郁。', dimension: 'N', reversed: false },
  { id: 49, text: 'I am not easily bothered by things.', textZh: '我不太容易被事情困扰。', dimension: 'N', reversed: true },
  { id: 50, text: 'I panic easily.', textZh: '我容易恐慌。', dimension: 'N', reversed: false },
];

export const ALL_QUESTIONS = [...PHASE1_QUESTIONS, ...PHASE2_QUESTIONS];

// Scoring: each answer is 1-5 Likert scale
// Reversed items: actual_score = 6 - raw_answer
export type BigFiveScores = { O: number; C: number; E: number; A: number; N: number };

export function scoreAnswers(
  answers: Record<number, number>,
  questions: Question[]
): BigFiveScores {
  const sums: BigFiveScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts: BigFiveScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const val = q.reversed ? 6 - raw : raw;
    sums[q.dimension] += val;
    counts[q.dimension] += 1;
  }

  // Normalize to 0-100 scale
  const scores: BigFiveScores = { O: 50, C: 50, E: 50, A: 50, N: 50 };
  for (const dim of ['O', 'C', 'E', 'A', 'N'] as const) {
    if (counts[dim] > 0) {
      // Mean of items on 1-5 scale → convert to 0-100
      const mean = sums[dim] / counts[dim];
      scores[dim] = Math.round(((mean - 1) / 4) * 100);
    }
    // else: already defaulted to 50 (midpoint)
  }
  return scores;
}
