// 12 Archetype definitions from PRD
// Mapped via Top-2 Z-Score of Big Five dimensions

export interface Archetype {
  id: string;
  nameZh: string;
  nameEn: string;
  shortLabel: string; // e.g. "O+E" for badge display
  description: string;
  traits: { high?: string[]; low?: string[] };
  color: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  explorer_creator: {
    id: 'explorer_creator',
    nameZh: '探索型创作者',
    nameEn: 'Explorer Creator',
    shortLabel: 'O/E',
    description:
      'Your world is an endless brainstorm. As a natural creator, you turn wild imagination into reality.',
    traits: { high: ['O', 'E'] },
    color: '#FF3B30',
  },
  speculative_researcher: {
    id: 'speculative_researcher',
    nameZh: '思辨型研究者',
    nameEn: 'Speculative Researcher',
    shortLabel: 'O/C',
    description:
      'You pursue truth through rigorous logic. You peel back layers to reveal the deepest insights.',
    traits: { high: ['O', 'C'] },
    color: '#5856D6',
  },
  sensitive_empath: {
    id: 'sensitive_empath',
    nameZh: '敏感型共情者',
    nameEn: 'Sensitive Empath',
    shortLabel: 'A/N',
    description:
      'Your heart captures emotional frequencies others miss. You bring rare softness to a rational world.',
    traits: { high: ['A', 'N'] },
    color: '#FF9500',
  },
  blunt_challenger: {
    id: 'blunt_challenger',
    nameZh: '直率型挑战者',
    nameEn: 'Blunt Challenger',
    shortLabel: 'E/a',
    description:
      'You refuse mediocrity. Your sharp edge is the strongest catalyst for breaking echo chambers.',
    traits: { high: ['E'], low: ['A'] },
    color: '#FF2D55',
  },
  romantic_idealist: {
    id: 'romantic_idealist',
    nameZh: '浪漫型理想者',
    nameEn: 'Romantic Idealist',
    shortLabel: 'O/c',
    description:
      'You live in a poetic universe of your own making. You remind everyone to stop and admire the view.',
    traits: { high: ['O'], low: ['C'] },
    color: '#AF52DE',
  },
  disciplined_achiever: {
    id: 'disciplined_achiever',
    nameZh: '自律型成就者',
    nameEn: 'Disciplined Achiever',
    shortLabel: 'C/E',
    description:
      'Goal-locked and relentless. You decompose chaos into executable steps and inspire others to level up.',
    traits: { high: ['C', 'E'] },
    color: '#34C759',
  },
  steady_executor: {
    id: 'steady_executor',
    nameZh: '稳健型执行者',
    nameEn: 'Steady Executor',
    shortLabel: 'C/e',
    description:
      'The silent bedrock. Your meticulous precision produces flawless systems, even through tedious debugging.',
    traits: { high: ['C'], low: ['E'] },
    color: '#007AFF',
  },
  gentle_coordinator: {
    id: 'gentle_coordinator',
    nameZh: '温和型协调者',
    nameEn: 'Gentle Coordinator',
    shortLabel: 'A/n',
    description:
      'You bridge isolated islands. Your empathetic, rational voice turns flame wars back to productive discourse.',
    traits: { high: ['A'], low: ['N'] },
    color: '#5AC8FA',
  },
  adventurous_doer: {
    id: 'adventurous_doer',
    nameZh: '冒险型实干者',
    nameEn: 'Adventurous Doer',
    shortLabel: 'E/O',
    description:
      'Paper plans bore you. With one spark of an idea, you are already building. Your energy is contagious.',
    traits: { high: ['E', 'O'] },
    color: '#FF9500',
  },
  independent_observer: {
    id: 'independent_observer',
    nameZh: '独立型观察者',
    nameEn: 'Independent Observer',
    shortLabel: 'O/e/a',
    description:
      'From the edge of the crowd, your clear gaze sees what others cannot. Every output: precise and profound.',
    traits: { high: ['O'], low: ['E', 'A'] },
    color: '#8E8D93',
  },
  stable_guardian: {
    id: 'stable_guardian',
    nameZh: '安稳型守护者',
    nameEn: 'Stable Guardian',
    shortLabel: 'C/A',
    description:
      'The anchor in the storm. You guard order, tradition, and human connection with quiet devotion.',
    traits: { high: ['C', 'A'], low: ['O'] },
    color: '#30B0C7',
  },
  balanced_breaker: {
    id: 'balanced_breaker',
    nameZh: '均衡型破壁人',
    nameEn: 'Balanced Breaker',
    shortLabel: '=',
    description:
      'The hexagonal warrior. Perfectly balanced across all dimensions, you move fluidly between any tribe.',
    traits: {},
    color: '#FFD60A',
  },
};

export function getArchetype(id: string): Archetype | undefined {
  return ARCHETYPES[id];
}

export function getArchetypeByName(name: string): Archetype | undefined {
  return Object.values(ARCHETYPES).find(
    (a) => a.nameEn === name || a.nameZh === name
  );
}
