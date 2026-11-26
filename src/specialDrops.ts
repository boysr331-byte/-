import type { ChestType } from './chestReveal';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export interface SporeConfigPatch {
  baseBonusPct: number;
  maxBonusPct: number;
  description: string;
}

/**
 * 胞子伴讀加成調整：
 * 基礎胞子 (spore_1) 提供 +100% ~ +200%（總倍率 2× ~ 3×）加成，
 * 其他階級依序向上提升。
 */
export const SPORE_CONFIG_OVERRIDES: Record<string, SporeConfigPatch> = {
  spore_1: {
    baseBonusPct: 100,
    maxBonusPct: 200,
    description:
      '使用後進入菇菇伴讀（持續 2 小時），期間伴讀享 +100%～+200%（2～3 倍）NP 與經驗加成，讀越久越高。',
  },
  spore_2: {
    baseBonusPct: 160,
    maxBonusPct: 280,
    description:
      '使用後進入菇菇伴讀（持續 4 小時），期間伴讀享 +160%～+280%（2.6～3.8 倍）NP 與經驗加成，讀越久越高。',
  },
  spore_3: {
    baseBonusPct: 240,
    maxBonusPct: 400,
    description:
      '使用後進入菇菇伴讀（持續 6 小時），期間伴讀享 +240%～+400%（3.4～5 倍）NP 與經驗加成，讀越久越高。',
  },
  spore_4: {
    baseBonusPct: 340,
    maxBonusPct: 550,
    description:
      '使用後進入菇菇伴讀（持續 8 小時），期間伴讀享 +340%～+550%（4.4～6.5 倍）NP 與經驗加成，讀越久越高。',
  },
  spore_5: {
    baseBonusPct: 480,
    maxBonusPct: 750,
    description:
      '使用後進入菇菇伴讀（持續 10 小時），期間伴讀享 +480%～+750%（5.8～8.5 倍）NP 與經驗加成，讀越久越高。',
  },
};

export interface SporeDropEntry {
  itemId: string;
  prob: number;
}

/**
 * 寶箱高階格胞子掉落機率（配合胞子大幅強化，稍微調降掉落機率）
 */
export const CHEST_SPORE_DROPS_UPDATED: Record<ChestType, SporeDropEntry[]> = {
  common: [
    { itemId: 'spore_1', prob: 4 },
    { itemId: 'spore_2', prob: 1.5 },
  ],
  rare: [
    { itemId: 'spore_2', prob: 2.5 },
    { itemId: 'spore_3', prob: 1.5 },
    { itemId: 'spore_4', prob: 0.6 },
  ],
  gold: [
    { itemId: 'spore_3', prob: 2.2 },
    { itemId: 'spore_4', prob: 1.2 },
    { itemId: 'spore_5', prob: 0.5 },
  ],
};

/**
 * 原木栽培抽卡樹洞探索機率（每次抽獎合計 1%）：
 * - 普通寶箱：0.75%
 * - 稀有寶箱：0.20%
 * - 高級寶箱：0.05%
 */
export const TREE_HOLLOW_PROBS = {
  common: 0.0075,
  rare: 0.002,
  gold: 0.0005,
} as const;

export function rollTreeHollowChest(rng: () => number = Math.random): ChestType | null {
  const r = rng();
  if (r < TREE_HOLLOW_PROBS.gold) {
    return 'gold';
  }
  if (r < TREE_HOLLOW_PROBS.gold + TREE_HOLLOW_PROBS.rare) {
    return 'rare';
  }
  if (r < TREE_HOLLOW_PROBS.gold + TREE_HOLLOW_PROBS.rare + TREE_HOLLOW_PROBS.common) {
    return 'common';
  }
  return null;
}

export function rollTreeHollowChests(
  pullCount: number,
  rng: () => number = Math.random,
): ChestType[] {
  const count = Math.max(0, Math.floor(pullCount));
  const found: ChestType[] = [];
  for (let i = 0; i < count; i++) {
    const chest = rollTreeHollowChest(rng);
    if (chest) {
      found.push(chest);
    }
  }
  return found;
}

const CHEST_RANK: Record<ChestType, number> = {
  common: 1,
  rare: 2,
  gold: 3,
};

export function getHighestChestQuality(chests: ChestType[]): ChestType {
  let best: ChestType = 'common';
  for (const c of chests) {
    if (CHEST_RANK[c] > CHEST_RANK[best]) {
      best = c;
    }
  }
  return best;
}

export interface BringBackRates {
  common: number;
  rare: number;
  gold: number;
}

/**
 * 讀書滿 3 小時 (10,800 秒) 時，各稀有度與好感等級的單隻菇菇獨立帶回寶箱機率：
 * - 低等菇菇不帶回高階寶箱：
 *   - Lv.1 ~ Lv.2：僅能帶回普通寶箱
 *   - Lv.3 ~ Lv.4：可帶回普通、稀有寶箱（不可帶回高級寶箱）
 *   - Lv.5 ~ Lv.6（僅 SR/SSR 可達）：可帶回普通、稀有、高級寶箱
 * - 基準校準：
 *   - SSR Lv.1 讀書 3 小時：10% 普通寶箱
 *   - SSR Lv.6 讀書 3 小時：2% 高級寶箱
 */
export const COMPANION_BRING_BACK_TABLE_3H: Record<Rarity, Record<number, BringBackRates>> = {
  N: {
    1: { common: 0.03, rare: 0, gold: 0 },
    2: { common: 0.05, rare: 0, gold: 0 },
    3: { common: 0.07, rare: 0.01, gold: 0 },
  },
  R: {
    1: { common: 0.05, rare: 0, gold: 0 },
    2: { common: 0.07, rare: 0, gold: 0 },
    3: { common: 0.09, rare: 0.02, gold: 0 },
    4: { common: 0.11, rare: 0.035, gold: 0 },
  },
  SR: {
    1: { common: 0.075, rare: 0, gold: 0 },
    2: { common: 0.095, rare: 0, gold: 0 },
    3: { common: 0.11, rare: 0.03, gold: 0 },
    4: { common: 0.12, rare: 0.045, gold: 0 },
    5: { common: 0.13, rare: 0.06, gold: 0.01 },
  },
  SSR: {
    1: { common: 0.1, rare: 0, gold: 0 },
    2: { common: 0.12, rare: 0, gold: 0 },
    3: { common: 0.13, rare: 0.04, gold: 0 },
    4: { common: 0.14, rare: 0.06, gold: 0 },
    5: { common: 0.14, rare: 0.075, gold: 0.012 },
    6: { common: 0.14, rare: 0.08, gold: 0.02 },
  },
};

export const COMPANION_BENCHMARK_SECONDS = 10800; // 3 hours
export const COMPANION_MIN_SECONDS_FOR_GIFT = 60; // 1 minute minimum session

export function getCompanionBringBackRates(
  rarity: Rarity,
  bondLevel: number,
  studySeconds: number,
): BringBackRates {
  if (!Number.isFinite(studySeconds) || studySeconds < COMPANION_MIN_SECONDS_FOR_GIFT) {
    return { common: 0, rare: 0, gold: 0 };
  }
  const table = COMPANION_BRING_BACK_TABLE_3H[rarity] || COMPANION_BRING_BACK_TABLE_3H.N;
  const maxLvl = Math.max(...Object.keys(table).map(Number));
  const clampedLvl = Math.min(maxLvl, Math.max(1, Math.floor(bondLevel)));
  const base = table[clampedLvl] || { common: 0, rare: 0, gold: 0 };
  const timeScale = Math.min(1.5, studySeconds / COMPANION_BENCHMARK_SECONDS);
  return {
    common: base.common * timeScale,
    rare: base.rare * timeScale,
    gold: base.gold * timeScale,
  };
}

export interface CompanionPartnerInput {
  speciesId: string;
  name: string;
  rarity: Rarity;
  icon: string;
  isRareVariant: boolean;
  variantLabel: string;
  bondLevel: number;
}

export interface CompanionGiftDrop extends CompanionPartnerInput {
  id: string;
  chestType: ChestType;
}

export function rollCompanionChest(
  rarity: Rarity,
  bondLevel: number,
  studySeconds: number,
  rng: () => number = Math.random,
): ChestType | null {
  const rates = getCompanionBringBackRates(rarity, bondLevel, studySeconds);
  const total = rates.gold + rates.rare + rates.common;
  if (total <= 0) {
    return null;
  }
  const r = rng();
  if (r < rates.gold) {
    return 'gold';
  }
  if (r < rates.gold + rates.rare) {
    return 'rare';
  }
  if (r < total) {
    return 'common';
  }
  return null;
}

export function rollCompanionBringBacks(
  partners: CompanionPartnerInput[],
  studySeconds: number,
  rng: () => number = Math.random,
  now: number = Date.now(),
): CompanionGiftDrop[] {
  const gifts: CompanionGiftDrop[] = [];
  partners.forEach((p, idx) => {
    const chestType = rollCompanionChest(p.rarity, p.bondLevel, studySeconds, rng);
    if (chestType) {
      gifts.push({
        ...p,
        id: `gift_${now}_${idx}_${p.speciesId}`,
        chestType,
      });
    }
  });
  return gifts;
}
