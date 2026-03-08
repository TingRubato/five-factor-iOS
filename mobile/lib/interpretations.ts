import { Dim, Tier } from './cinematic-utils';

interface ProseBlock {
  title: { en: string; zh: string };
  body: { en: string; zh: string };
}

// ── Dimension interpretations (5 dims × 3 tiers = 15 blocks) ────
const DIM_PROSE: Record<Dim, Record<Tier, ProseBlock>> = {
  O: {
    high: {
      title: { en: 'The Endless Horizon', zh: '无尽的地平线' },
      body: {
        en: 'You live with your windows open. New ideas don\'t knock on your door — they find it already ajar. Where others see risk in the unfamiliar, you see an invitation that\'s already been accepted.',
        zh: '你的世界从不设限。新的想法不需要敲门——因为门从未关上。别人眼中的未知，在你看来，是一封早已被接受的邀请。',
      },
    },
    mid: {
      title: { en: 'The Selective Wanderer', zh: '选择性的漫游者' },
      body: {
        en: 'You know when to explore and when to stay. Your curiosity is strategic — you open doors with intention, not impulse. This balance lets you grow without losing your footing.',
        zh: '你知道何时探索，何时驻留。你的好奇心带着策略——你有意识地打开每扇门，而非凭冲动。这种平衡让你成长而不失根基。',
      },
    },
    low: {
      title: { en: 'The Deep Root', zh: '深沉的根系' },
      body: {
        en: 'While others scatter toward novelty, you draw power from depth. You don\'t need the new when you haven\'t finished mastering the present. Your constancy is a rare kind of courage.',
        zh: '当别人追逐新奇时，你从深度中汲取力量。你不需要新事物，因为你还在精通当下。你的恒心，是一种稀有的勇气。',
      },
    },
  },
  C: {
    high: {
      title: { en: 'The Architect of Days', zh: '日子的建筑师' },
      body: {
        en: 'Your life has structure that others envy and can\'t replicate. Every hour has a purpose, every detail a place. You don\'t just plan — you build cathedrals out of ordinary time.',
        zh: '你的生活有着别人羡慕却无法复制的结构。每一小时都有意义，每一细节都有归处。你不只是在计划——你在用平凡的时间建造大教堂。',
      },
    },
    mid: {
      title: { en: 'The Flexible Framework', zh: '弹性的框架' },
      body: {
        en: 'You hold structure lightly. Organized enough to deliver, flexible enough to pivot. You understand that the best plans are the ones that survive first contact with reality.',
        zh: '你轻握结构。足够有条理去交付，足够灵活去转向。你明白，最好的计划是那些能经受住现实考验的。',
      },
    },
    low: {
      title: { en: 'The River', zh: '河流' },
      body: {
        en: 'You move like water — finding the path, not forcing it. Rigidity feels like a cage to you. Your gift is responding to the moment with an honesty that structured minds can\'t access.',
        zh: '你像水一样流动——寻找道路，而非强迫。僵化对你来说是牢笼。你的天赋是以一种严谨头脑无法触及的真诚回应当下。',
      },
    },
  },
  E: {
    high: {
      title: { en: 'The Living Spark', zh: '活跃的火花' },
      body: {
        en: 'A room changes when you enter it. Your energy is a current that others plug into. You don\'t just participate in life — you conduct it, and people lean in when you speak.',
        zh: '当你走进房间时，气氛就变了。你的能量是一股电流，别人会不自觉地接通。你不只是参与生活——你指挥它，人们在你说话时会倾身向前。',
      },
    },
    mid: {
      title: { en: 'The Calibrated Presence', zh: '校准的存在' },
      body: {
        en: 'You know when to step forward and when to step back. Your social energy is a dial, not a switch. This lets you be the life of the room or the quiet observer — always by choice.',
        zh: '你知道何时前进，何时后退。你的社交能量是旋钮，而非开关。这让你既能成为全场焦点，也能做安静的观察者——始终出于选择。',
      },
    },
    low: {
      title: { en: 'The Inner Kingdom', zh: '内在的王国' },
      body: {
        en: 'Your richest conversations happen inside your own mind. Solitude isn\'t loneliness for you — it\'s where your best thinking lives. You recharge in silence, and that silence has weight.',
        zh: '你最丰富的对话发生在自己的脑海中。独处对你来说不是孤独——那是你最好的思考所在之地。你在沉默中充电，而那沉默自有分量。',
      },
    },
  },
  A: {
    high: {
      title: { en: 'The Open Palm', zh: '张开的手掌' },
      body: {
        en: 'You feel what others feel before they can name it. Your warmth isn\'t performance — it\'s reflex. In a world that rewards sharp elbows, your softness is a radical act of strength.',
        zh: '你在别人还未说出口之前就感受到了他们的感受。你的温暖不是表演——是本能。在一个奖励尖锐的世界里，你的柔软是一种激进的力量。',
      },
    },
    mid: {
      title: { en: 'The Measured Heart', zh: '有度的心' },
      body: {
        en: 'Your empathy comes with boundaries. You care deeply but not blindly. You can hold space for someone\'s pain without drowning in it — a balance many spend lifetimes seeking.',
        zh: '你的共情自带边界。你深深关心但不盲目。你能为他人的痛苦留出空间而不被淹没——这种平衡，许多人终其一生都在寻找。',
      },
    },
    low: {
      title: { en: 'The Clear Mirror', zh: '清澈的镜子' },
      body: {
        en: 'You see people as they are, not as they wish to be seen. Your honesty cuts through social performance. Some call it blunt — you call it respect. Truth is your form of caring.',
        zh: '你看到人们的真实面貌，而非他们希望被看到的样子。你的诚实穿透社交表演。有人说你直率——你称之为尊重。真相是你关心的方式。',
      },
    },
  },
  N: {
    high: {
      title: { en: 'The Seismograph', zh: '地震仪' },
      body: {
        en: 'You register tremors that others walk right over. This sensitivity is not fragility — it\'s a high-resolution instrument. You feel more because you are tuned to frequencies the world ignores.',
        zh: '你感知到别人直接略过的震颤。这种敏感不是脆弱——而是一件高分辨率的仪器。你感受更多，因为你调谐到了世界忽略的频率。',
      },
    },
    mid: {
      title: { en: 'The Aware Voyager', zh: '觉知的航行者' },
      body: {
        en: 'You feel the weather changing inside you, but you don\'t let it steer the ship. Your emotional awareness gives you data that calm people simply miss. You navigate with eyes wide open.',
        zh: '你感知到内心的天气变化，但不让它掌舵。你的情绪觉知给你提供了平静的人会错过的数据。你睁大眼睛航行。',
      },
    },
    low: {
      title: { en: 'The Still Lake', zh: '静湖' },
      body: {
        en: 'Storms pass above you, not through you. This stillness isn\'t numbness — it\'s the kind of calm that lets others exhale when they\'re near you. You are the steady hand in every room.',
        zh: '风暴从你上方掠过，而非穿过你。这种宁静不是麻木——而是一种让别人在你身边可以松一口气的平静。你是每个房间里那只稳定的手。',
      },
    },
  },
};

// ── Dimension pair interpretations (10 pairs) ───────────────────
const PAIR_PROSE: Record<string, ProseBlock> = {
  A_O: {
    title: { en: 'The Compassionate Explorer', zh: '有温度的探索者' },
    body: {
      en: 'Your Openness pulls you toward the unknown, while your Agreeableness ensures you bring everyone along. You don\'t just discover new worlds — you make them welcoming.',
      zh: '开放性拉着你走向未知，而宜人性确保你带上每一个人。你不只是发现新世界——你让它们变得温暖。',
    },
  },
  C_O: {
    title: { en: 'The Visionary Architect', zh: '远见的建筑师' },
    body: {
      en: 'Your Openness dreams in blueprints that don\'t exist yet, while your Conscientiousness builds them into reality. You are the rare mind that both imagines and delivers.',
      zh: '开放性让你在尚不存在的蓝图中做梦，而尽责性将它们建造成现实。你是那种既能想象又能交付的稀有头脑。',
    },
  },
  E_O: {
    title: { en: 'The Magnetic Pioneer', zh: '有磁性的先锋' },
    body: {
      en: 'Your Openness spots the frontier, and your Extraversion rallies people to march toward it. Ideas don\'t stay in your head — they become movements.',
      zh: '开放性让你发现前沿，外向性让你召集人们向它进发。想法不会留在你脑中——它们会变成运动。',
    },
  },
  C_E: {
    title: { en: 'The Relentless Engine', zh: '不知疲倦的引擎' },
    body: {
      en: 'Your Extraversion provides the fuel, your Conscientiousness the engine. Together they make you unstoppable — you don\'t just start things, you finish them with style.',
      zh: '外向性提供燃料，尽责性提供引擎。两者结合让你势不可挡——你不只是开始，你以风格完成。',
    },
  },
  A_E: {
    title: { en: 'The Warm Catalyst', zh: '温暖的催化剂' },
    body: {
      en: 'Your Extraversion draws people in, and your Agreeableness keeps them close. You create spaces where others feel brave enough to be themselves.',
      zh: '外向性吸引人们靠近，宜人性让他们留下。你创造了让别人敢于做自己的空间。',
    },
  },
  E_N: {
    title: { en: 'The Passionate Flame', zh: '热情的火焰' },
    body: {
      en: 'Your Extraversion pushes you into the arena, while your Neuroticism makes every moment vivid. You live at high volume — both the joys and the aches hit harder for you.',
      zh: '外向性把你推入竞技场，而神经质让每一刻都鲜明。你以高音量生活——快乐和痛苦对你来说都更强烈。',
    },
  },
  A_C: {
    title: { en: 'The Devoted Builder', zh: '忠诚的建造者' },
    body: {
      en: 'Your Conscientiousness builds the structure, your Agreeableness fills it with people. You create systems that serve humans, not the other way around.',
      zh: '尽责性建造结构，宜人性将人们填入其中。你创造服务于人的系统，而非相反。',
    },
  },
  C_N: {
    title: { en: 'The Vigilant Perfectionist', zh: '警觉的完美主义者' },
    body: {
      en: 'Your Conscientiousness demands excellence, your Neuroticism keeps scanning for threats. Together they make you impossibly thorough — nothing slips past your double watch.',
      zh: '尽责性要求卓越，神经质不断扫描威胁。两者结合让你细致到不可思议——没有什么能逃过你的双重守望。',
    },
  },
  A_N: {
    title: { en: 'The Tender Antenna', zh: '柔软的天线' },
    body: {
      en: 'Your Agreeableness opens your heart, and your Neuroticism amplifies every signal. You absorb the emotional weather of every room — a gift that asks a lot of its keeper.',
      zh: '宜人性打开你的心，神经质放大每一个信号。你吸收每个房间的情绪天气——一份对守护者要求很高的天赋。',
    },
  },
  N_O: {
    title: { en: 'The Turbulent Dreamer', zh: '激荡的梦想家' },
    body: {
      en: 'Your Openness flings open every door, and your Neuroticism feels the draft. You live in a world of intense possibility — electric, overwhelming, and deeply alive.',
      zh: '开放性推开每一扇门，神经质感受到每一阵风。你生活在一个充满强烈可能性的世界——电流般、压倒性的、深深鲜活的。',
    },
  },
};

// ── Closing affirmation (Act 7) ─────────────────────────────────
const CLOSING: ProseBlock = {
  title: { en: 'A Lens, Not a Label', zh: '是镜头，不是标签' },
  body: {
    en: 'This is your lens, not your limit. Your archetype is where you begin — not where you end. The map has been drawn. Now the territory is yours to explore.',
    zh: '这是你的镜头，不是你的边界。你的原型是你的起点——而非终点。地图已经绘就，现在领地由你去探索。',
  },
};

// ── Balanced Breaker special (replaces Acts 1-3) ────────────────
const BALANCED: ProseBlock = {
  title: { en: 'The Equilibrium', zh: '均衡' },
  body: {
    en: 'Where others spike and dip, you hold steady across every dimension. This isn\'t average — it\'s rare. You are the hexagonal warrior, moving fluidly between any tribe, belonging everywhere and nowhere at once.',
    zh: '当别人起伏跌宕时，你在每个维度上保持稳定。这不是平庸——这很稀有。你是六边形战士，在任何部落之间自如穿行，同时属于所有地方，又不属于任何地方。',
  },
};

// ── Public API ──────────────────────────────────────────────────

export function getDimProse(dim: Dim, tier: Tier): ProseBlock {
  return DIM_PROSE[dim][tier];
}

export function getPairProse(d1: Dim, d2: Dim): ProseBlock {
  const key = [d1, d2].sort().join('_');
  return PAIR_PROSE[key] ?? {
    title: { en: 'The Unique Blend', zh: '独特的融合' },
    body: {
      en: 'Your two strongest dimensions create a combination that defies simple labels. This tension is your creative engine.',
      zh: '你最强的两个维度创造了一种超越简单标签的组合。这种张力是你的创造引擎。',
    },
  };
}

export function getClosingProse(): ProseBlock {
  return CLOSING;
}

export function getBalancedProse(): ProseBlock {
  return BALANCED;
}
