import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHEST_SPORE_DROPS_UPDATED,
  COMPANION_BENCHMARK_SECONDS,
  SPORE_CONFIG_OVERRIDES,
  TREE_HOLLOW_PROBS,
  getCompanionBringBackRates,
  getHighestChestQuality,
  rollCompanionBringBacks,
  rollCompanionChest,
  rollTreeHollowChest,
  rollTreeHollowChests,
  type CompanionPartnerInput,
} from './specialDrops';

test('spore configs give 2x-3x total bonus on base spore_1 and scale strictly upward', () => {
  const s1 = SPORE_CONFIG_OVERRIDES.spore_1;
  assert.equal(s1.baseBonusPct, 100);
  assert.equal(s1.maxBonusPct, 200);

  const tiers = ['spore_1', 'spore_2', 'spore_3', 'spore_4', 'spore_5'];
  for (let i = 1; i < tiers.length; i++) {
    const prev = SPORE_CONFIG_OVERRIDES[tiers[i - 1]];
    const curr = SPORE_CONFIG_OVERRIDES[tiers[i]];
    assert.ok(curr.baseBonusPct > prev.baseBonusPct);
    assert.ok(curr.maxBonusPct > prev.maxBonusPct);
  }
});

test('chest spore drop probabilities are slightly lowered from original totals', () => {
  const sumProb = (arr: Array<{ prob: number }>) => arr.reduce((a, b) => a + b.prob, 0);
  assert.ok(sumProb(CHEST_SPORE_DROPS_UPDATED.common) < 8.5);
  assert.ok(sumProb(CHEST_SPORE_DROPS_UPDATED.rare) < 7.5);
  assert.ok(sumProb(CHEST_SPORE_DROPS_UPDATED.gold) < 6.3);
});

test('tree hollow chest discovery sums to 1% with rarer rare/gold probabilities', () => {
  const total =
    TREE_HOLLOW_PROBS.common + TREE_HOLLOW_PROBS.rare + TREE_HOLLOW_PROBS.gold;
  assert.ok(Math.abs(total - 0.01) < 1e-12);
  assert.ok(TREE_HOLLOW_PROBS.gold < TREE_HOLLOW_PROBS.rare);
  assert.ok(TREE_HOLLOW_PROBS.rare < TREE_HOLLOW_PROBS.common);

  assert.equal(rollTreeHollowChest(() => 0.0001), 'gold');
  assert.equal(rollTreeHollowChest(() => 0.0005), 'rare');
  assert.equal(rollTreeHollowChest(() => 0.00249), 'rare');
  assert.equal(rollTreeHollowChest(() => 0.0025), 'common');
  assert.equal(rollTreeHollowChest(() => 0.00999), 'common');
  assert.equal(rollTreeHollowChest(() => 0.01), null);
  assert.equal(rollTreeHollowChest(() => 0.5), null);
});

test('rollTreeHollowChests rolls independently per pull and selects highest quality', () => {
  const vals = [0.0001, 0.5, 0.005, 0.001, 0.99];
  let idx = 0;
  const chests = rollTreeHollowChests(5, () => vals[idx++]);
  assert.deepEqual(chests, ['gold', 'common', 'rare']);
  assert.equal(getHighestChestQuality(chests), 'gold');
  assert.equal(getHighestChestQuality(['common', 'rare']), 'rare');
});

test('companion bring-back rates match SSR Lv1 (10% common) and SSR Lv6 (2% gold) at 3h', () => {
  const ssrLv1 = getCompanionBringBackRates('SSR', 1, COMPANION_BENCHMARK_SECONDS);
  assert.ok(Math.abs(ssrLv1.common - 0.1) < 1e-12);
  assert.equal(ssrLv1.rare, 0);
  assert.equal(ssrLv1.gold, 0);

  const ssrLv6 = getCompanionBringBackRates('SSR', 6, COMPANION_BENCHMARK_SECONDS);
  assert.ok(Math.abs(ssrLv6.gold - 0.02) < 1e-12);
  assert.ok(ssrLv6.rare > 0 && ssrLv6.common > 0);
});

test('low bond levels and low rarities never bring back higher-tier chests', () => {
  for (const rarity of ['N', 'R', 'SR', 'SSR'] as const) {
    const lv1 = getCompanionBringBackRates(rarity, 1, COMPANION_BENCHMARK_SECONDS);
    const lv2 = getCompanionBringBackRates(rarity, 2, COMPANION_BENCHMARK_SECONDS);
    assert.equal(lv1.rare, 0);
    assert.equal(lv1.gold, 0);
    assert.equal(lv2.rare, 0);
    assert.equal(lv2.gold, 0);
  }
  assert.equal(getCompanionBringBackRates('N', 3, COMPANION_BENCHMARK_SECONDS).gold, 0);
  assert.equal(getCompanionBringBackRates('R', 4, COMPANION_BENCHMARK_SECONDS).gold, 0);
  assert.equal(getCompanionBringBackRates('SSR', 4, COMPANION_BENCHMARK_SECONDS).gold, 0);
  assert.equal(getCompanionBringBackRates('SSR', 6, 30).common, 0);
});

test('rollCompanionBringBacks evaluates each partner independently', () => {
  const partners: CompanionPartnerInput[] = [
    {
      speciesId: 'p1',
      name: '菇一',
      rarity: 'SSR',
      icon: '🍄',
      isRareVariant: false,
      variantLabel: '原色',
      bondLevel: 6,
    },
    {
      speciesId: 'p2',
      name: '菇二',
      rarity: 'N',
      icon: '🍄',
      isRareVariant: false,
      variantLabel: '原色',
      bondLevel: 1,
    },
  ];
  assert.equal(rollCompanionChest('SSR', 6, 10800, () => 0.015), 'gold');
  assert.equal(rollCompanionChest('SSR', 6, 10800, () => 0.05), 'rare');
  assert.equal(rollCompanionChest('SSR', 6, 10800, () => 0.15), 'common');
  assert.equal(rollCompanionChest('SSR', 6, 10800, () => 0.5), null);

  const rngSeq = [0.015, 0.9];
  let idx = 0;
  const gifts = rollCompanionBringBacks(partners, 10800, () => rngSeq[idx++], 12345);
  assert.equal(gifts.length, 1);
  assert.equal(gifts[0].speciesId, 'p1');
  assert.equal(gifts[0].chestType, 'gold');
});
