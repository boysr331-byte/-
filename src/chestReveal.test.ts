import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cleanTierLabel,
  computeRevealedSummary,
  formatDropLabel,
  getChestRevealStepDelayMs,
  getChestStageForPhase,
  type ChestDrop,
  type ItemDisplayMeta,
} from './chestReveal.ts';

const SAMPLE_ITEMS: Record<string, ItemDisplayMeta> = {
  nutrient_2: {
    id: 'nutrient_2',
    name: '改良營養劑',
    icon: '⚗️',
    tierLabel: '第 2 檔 · 改良',
  },
  spore_3: {
    id: 'spore_3',
    name: '大黴菌胞子',
    icon: '🟢',
    tierLabel: '胞子 · 6 小時',
  },
};

test('computeRevealedSummary accumulates NP and items one by one', () => {
  const drops: ChestDrop[] = [
    { kind: 'np', tier: 1, amount: 75, isHighPool: false },
    { kind: 'item', itemId: 'nutrient_2', tier: 2, count: 1, isHighPool: true },
    { kind: 'np', tier: 3, amount: 420, isHighPool: true },
    { kind: 'item', itemId: 'nutrient_2', tier: 2, count: 2, isHighPool: false },
  ];

  const s0 = computeRevealedSummary(drops, 0);
  assert.equal(s0.revealedDrops.length, 0);
  assert.equal(s0.runningNp, 0);
  assert.deepEqual(s0.runningItemTotals, {});
  assert.equal(s0.allRevealed, false);

  const s1 = computeRevealedSummary(drops, 1);
  assert.equal(s1.revealedDrops.length, 1);
  assert.equal(s1.runningNp, 75);
  assert.deepEqual(s1.runningItemTotals, {});
  assert.equal(s1.allRevealed, false);

  const s2 = computeRevealedSummary(drops, 2);
  assert.equal(s2.revealedDrops.length, 2);
  assert.equal(s2.runningNp, 75);
  assert.deepEqual(s2.runningItemTotals, { nutrient_2: 1 });
  assert.equal(s2.allRevealed, false);

  const s4 = computeRevealedSummary(drops, 10);
  assert.equal(s4.revealedDrops.length, 4);
  assert.equal(s4.runningNp, 495);
  assert.deepEqual(s4.runningItemTotals, { nutrient_2: 3 });
  assert.equal(s4.allRevealed, true);
});

test('formatDropLabel removes all tier-number and high-tier hints', () => {
  const npHigh = formatDropLabel(
    { kind: 'np', tier: 4, amount: 1850, isHighPool: true },
    SAMPLE_ITEMS,
  );
  assert.equal(npHigh.label, '💰 NP 獎勵');
  assert.equal(npHigh.valueText, '+1,850 NP');
  assert.equal(/檔|高檔/.test(npHigh.label), false);

  const itemHigh = formatDropLabel(
    { kind: 'item', itemId: 'nutrient_2', tier: 2, count: 1, isHighPool: true },
    SAMPLE_ITEMS,
  );
  assert.equal(itemHigh.label, '⚗️ 改良營養劑');
  assert.equal(itemHigh.valueText, '×1');
  assert.equal(/檔|高檔/.test(itemHigh.label), false);

  const spore = formatDropLabel(
    { kind: 'item', itemId: 'spore_3', tier: 3, count: 1, isHighPool: true },
    SAMPLE_ITEMS,
  );
  assert.equal(spore.label, '🟢 大黴菌胞子');
  assert.equal(/檔|高檔/.test(spore.label), false);
});

test('cleanTierLabel strips 第 X 檔 prefix while keeping descriptive labels', () => {
  assert.equal(cleanTierLabel('第 1 檔 · 基本'), '基本');
  assert.equal(cleanTierLabel('第 4 檔 · 終極'), '終極');
  assert.equal(cleanTierLabel('胞子 · 6 小時'), '胞子 · 6 小時');
  assert.equal(cleanTierLabel(undefined), '');
});

test('getChestRevealStepDelayMs scales cleanly and honors reduced motion', () => {
  assert.equal(getChestRevealStepDelayMs(5, true), 0);
  assert.equal(getChestRevealStepDelayMs(0, false), 0);
  assert.ok(getChestRevealStepDelayMs(4, false) >= 300);
  assert.ok(getChestRevealStepDelayMs(12, false) < getChestRevealStepDelayMs(4, false));
});

test('getChestStageForPhase maps modal phases to SVG chest stages', () => {
  assert.equal(getChestStageForPhase('shaking'), 'shaking');
  assert.equal(getChestStageForPhase('opening'), 'opening');
  assert.equal(getChestStageForPhase('revealing'), 'opened');
  assert.equal(getChestStageForPhase('done'), 'opened');
});
