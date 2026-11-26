export type ChestType = 'common' | 'rare' | 'gold';

export type ChestAnimStage = 'closed' | 'shaking' | 'opening' | 'opened';

export type ChestRevealPhase = 'shaking' | 'opening' | 'revealing' | 'done';

export interface ChestNpDrop {
  kind: 'np';
  tier?: number;
  amount: number;
  isHighPool?: boolean;
}

export interface ChestItemDrop {
  kind: 'item';
  itemId: string;
  tier?: number;
  count: number;
  isHighPool?: boolean;
}

export type ChestDrop = ChestNpDrop | ChestItemDrop;

export interface ChestOpenResult {
  chestType: ChestType;
  openedCount: number;
  drops: ChestDrop[];
  totalNp: number;
  itemTotals: Record<string, number>;
}

export interface ItemDisplayMeta {
  id: string;
  name: string;
  icon: string;
  tierLabel?: string;
  cardClass?: string;
}

export interface ChestMeta {
  type: ChestType;
  name: string;
  icon?: string;
  tierLabel?: string;
  summary?: string;
}

export const CHEST_SHAKE_MS = 560;
export const CHEST_OPEN_MS = 380;

/**
 * Computes the per-item pop-out interval so small chests feel lively and
 * multi-chest drops stay brisk without dragging.
 */
export function getChestRevealStepDelayMs(totalDrops: number, reducedMotion: boolean): number {
  if (reducedMotion || totalDrops <= 0) {
    return 0;
  }
  if (totalDrops <= 5) {
    return 360;
  }
  if (totalDrops <= 10) {
    return 260;
  }
  return 180;
}

export interface RevealedSummary {
  revealedDrops: ChestDrop[];
  runningNp: number;
  runningItemTotals: Record<string, number>;
  allRevealed: boolean;
}

/**
 * Slices revealed drops up to `revealedCount` and accumulates running NP and
 * item totals purely for sequential UI reveal.
 */
export function computeRevealedSummary(
  drops: ChestDrop[],
  revealedCount: number,
): RevealedSummary {
  const clamped = Math.max(0, Math.min(drops.length, Math.floor(revealedCount)));
  const revealedDrops = drops.slice(0, clamped);
  let runningNp = 0;
  const runningItemTotals: Record<string, number> = {};

  for (const drop of revealedDrops) {
    if (drop.kind === 'np') {
      runningNp += drop.amount;
    } else {
      runningItemTotals[drop.itemId] = (runningItemTotals[drop.itemId] || 0) + drop.count;
    }
  }

  return {
    revealedDrops,
    runningNp,
    runningItemTotals,
    allRevealed: clamped >= drops.length,
  };
}

/**
 * Strips any legacy "第 X 檔 · " tier prefix from item sub-labels.
 */
export function cleanTierLabel(tierLabel?: string): string {
  if (!tierLabel) {
    return '';
  }
  return tierLabel.replace(/^第\s*\d+\s*檔\s*[·・]?\s*/u, '').trim();
}

/**
 * Formats a chest drop row without any tier-number or high-tier hints.
 */
export function formatDropLabel(
  drop: ChestDrop,
  itemsMap: Record<string, ItemDisplayMeta>,
): { label: string; valueText: string } {
  if (drop.kind === 'np') {
    return {
      label: '💰 NP 獎勵',
      valueText: `+${drop.amount.toLocaleString()} NP`,
    };
  }
  const meta = itemsMap[drop.itemId];
  const label = meta ? `${meta.icon} ${meta.name}` : drop.itemId;
  return {
    label,
    valueText: `×${drop.count}`,
  };
}

/**
 * Maps the modal reveal phase to the SVG chest visual stage.
 */
export function getChestStageForPhase(phase: ChestRevealPhase): ChestAnimStage {
  if (phase === 'shaking') {
    return 'shaking';
  }
  if (phase === 'opening') {
    return 'opening';
  }
  return 'opened';
}
