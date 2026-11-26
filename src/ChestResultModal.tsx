import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedChest } from './AnimatedChest';
import {
  CHEST_OPEN_MS,
  CHEST_SHAKE_MS,
  cleanTierLabel,
  computeRevealedSummary,
  formatDropLabel,
  getChestRevealStepDelayMs,
  getChestStageForPhase,
  type ChestDrop,
  type ChestMeta,
  type ChestOpenResult,
  type ChestRevealPhase,
  type ChestType,
  type ItemDisplayMeta,
} from './chestReveal';

export interface SoundEffectsLike {
  playCoin?: (enabled: boolean) => void;
  playPop?: (enabled: boolean, rarity?: string) => void;
  playRevealTease?: (enabled: boolean, rarity?: string) => void;
  playReveal?: (enabled: boolean, rarity?: string) => void;
}

export interface ChestResultModalProps {
  result: ChestOpenResult | null;
  onClose: () => void;
  chestsMap: Record<ChestType, ChestMeta>;
  itemsMap: Record<string, ItemDisplayMeta>;
  ConfettiCanvas?: React.ForwardRefExoticComponent<
    React.RefAttributes<{ burst: (xPct?: number, yPct?: number) => void }>
  >;
  soundEnabled?: boolean;
  soundFx?: SoundEffectsLike;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function playChestDropFeedback(
  drop: ChestDrop,
  soundEnabled: boolean,
  soundFx?: SoundEffectsLike,
) {
  if (!soundEnabled || !soundFx) {
    return;
  }
  if (drop.kind === 'np') {
    soundFx.playCoin?.(true);
  } else {
    soundFx.playPop?.(true, drop.itemId.startsWith('spore_') ? 'SR' : 'R');
  }
}

export function ChestResultModal({
  result,
  onClose,
  chestsMap,
  itemsMap,
  ConfettiCanvas,
  soundEnabled = false,
  soundFx,
}: ChestResultModalProps) {
  const [phase, setPhase] = useState<ChestRevealPhase>('shaking');
  const [revealedCount, setRevealedCount] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(true);
  const confettiRef = useRef<{ burst: (xPct?: number, yPct?: number) => void } | null>(null);
  const dropsScrollRef = useRef<HTMLDivElement | null>(null);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const startAnimationSequence = useCallback(
    (res: ChestOpenResult) => {
      clearAllTimers();
      const reduced = prefersReducedMotion();
      const drops = res.drops;

      if (reduced || drops.length === 0) {
        setPhase('done');
        setRevealedCount(drops.length);
        if (drops.length > 0) {
          soundFx?.playCoin?.(soundEnabled);
        }
        return;
      }

      setPhase('shaking');
      setRevealedCount(0);

      const teaseRarity = res.chestType === 'gold' ? 'SSR' : res.chestType === 'rare' ? 'SR' : 'R';
      soundFx?.playRevealTease?.(soundEnabled, teaseRarity);

      const openTimer = window.setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }
        setPhase('opening');
        confettiRef.current?.burst(50, 28);
        soundFx?.playReveal?.(soundEnabled, res.chestType === 'gold' ? 'SR' : 'R');
      }, CHEST_SHAKE_MS);
      timersRef.current.push(openTimer);

      const stepMs = getChestRevealStepDelayMs(drops.length, false);
      const revealStartAt = CHEST_SHAKE_MS + CHEST_OPEN_MS;

      drops.forEach((drop, idx) => {
        const t = window.setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }
          setPhase(idx + 1 >= drops.length ? 'done' : 'revealing');
          setRevealedCount(idx + 1);
          playChestDropFeedback(drop, soundEnabled, soundFx);
        }, revealStartAt + idx * stepMs);
        timersRef.current.push(t);
      });
    },
    [clearAllTimers, soundEnabled, soundFx],
  );

  useEffect(() => {
    if (!result) {
      clearAllTimers();
      setPhase('shaking');
      setRevealedCount(0);
      return;
    }
    startAnimationSequence(result);
    return () => {
      clearAllTimers();
    };
  }, [result, replayCount, startAnimationSequence, clearAllTimers]);

  useEffect(() => {
    const el = dropsScrollRef.current;
    if (el && revealedCount > 0) {
      el.scrollTop = el.scrollHeight;
    }
  }, [revealedCount]);

  const handleSkipAll = useCallback(() => {
    if (!result) {
      return;
    }
    clearAllTimers();
    setPhase('done');
    setRevealedCount(result.drops.length);
    confettiRef.current?.burst(50, 28);
    soundFx?.playCoin?.(soundEnabled);
  }, [result, clearAllTimers, soundEnabled, soundFx]);

  const handleReplay = useCallback(() => {
    setReplayCount((c) => c + 1);
  }, []);

  const summary = useMemo(() => {
    if (!result) {
      return computeRevealedSummary([], 0);
    }
    return computeRevealedSummary(result.drops, revealedCount);
  }, [result, revealedCount]);

  if (!result) {
    return null;
  }

  const chestMeta = chestsMap[result.chestType];
  const chestStage = getChestStageForPhase(phase);
  const isAnimating = phase !== 'done';
  const itemEntries = Object.entries(summary.runningItemTotals);

  return (
    <div
      className="fixed inset-0 z-[96] bg-black/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="寶箱開啟結果"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {ConfettiCanvas ? (
        <div className="fixed inset-0 pointer-events-none z-20" aria-hidden="true">
          <ConfettiCanvas ref={confettiRef} />
        </div>
      ) : null}

      <div className="wood-panel rounded-2xl p-5 sm:p-6 space-y-4 w-full max-w-md max-h-[88vh] flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e6d5b8] pb-3">
          <div className="min-w-0">
            <h3 className="text-base font-black text-[#3a2514] truncate">
              開啟 {chestMeta.name}
              {result.openedCount > 1 ? ` ×${result.openedCount}` : ''}
            </h3>
            <p className="text-xs text-[#6b421c] mt-0.5">
              {phase === 'shaking'
                ? '寶箱震動蓄力中…'
                : phase === 'opening'
                  ? '寶箱開啟中！'
                  : phase === 'revealing'
                    ? '獎勵正在依序跳出…'
                    : '已獲得以下獎勵並自動存入'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isAnimating ? (
              <button
                type="button"
                onClick={handleSkipAll}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-xs font-black text-[#3a2008] whitespace-nowrap transition-colors"
              >
                ⏩ 全部顯示
              </button>
            ) : result.drops.length > 0 ? (
              <button
                type="button"
                onClick={handleReplay}
                className="px-2.5 py-1 rounded-lg bg-[#f3e5c8] hover:bg-amber-200 border border-[#d4b88c] text-xs font-bold text-[#4a3525] whitespace-nowrap transition-colors"
              >
                🔄 重播動畫
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-[#f3e5c8] hover:bg-[#ead4ae] text-xs font-bold text-[#4a3525] whitespace-nowrap transition-colors"
            >
              關閉
            </button>
          </div>
        </div>

        {/* Animated Chest Stage */}
        <div
          data-testid="chest-animation-stage"
          data-phase={phase}
          onClick={isAnimating ? handleSkipAll : undefined}
          className={`relative rounded-xl border border-[#e3d2b6] py-4 px-3 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 ${
            chestStage === 'opening' || chestStage === 'opened'
              ? 'bg-gradient-to-b from-[#fef3c7]/80 via-[#fff9eb] to-[#f4e2bf]'
              : 'bg-gradient-to-b from-[#fffaf0] to-[#f4e4c7]'
          } ${isAnimating ? 'cursor-pointer' : ''}`}
        >
          <AnimatedChest type={result.chestType} size={92} stage={chestStage} />
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#6b421c] tabular-nums">
            <span>
              已跳出 {summary.revealedDrops.length} / {result.drops.length} 項
            </span>
          </div>
        </div>

        {/* Sequential Drops & Running Summary */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0">
          {summary.runningNp > 0 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 flex items-center justify-between chest-drop-pop">
              <span className="text-xs sm:text-sm font-black text-emerald-900">💰 獲得 NP 總計</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                +{summary.runningNp.toLocaleString()} NP
              </span>
            </div>
          )}

          {itemEntries.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-black text-[#4a3525]">獲得道具</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itemEntries.map(([itemId, count]) => {
                  const meta = itemsMap[itemId];
                  if (!meta) {
                    return null;
                  }
                  const subLabel = cleanTierLabel(meta.tierLabel);
                  return (
                    <div
                      key={itemId}
                      className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 chest-drop-pop ${
                        meta.cardClass || 'bg-[#faf6ee] border-[#d4b88c]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0" aria-hidden="true">
                          {meta.icon}
                        </span>
                        <div className="min-w-0">
                          {subLabel ? (
                            <div className="text-[10px] font-bold text-[#6b421c]">{subLabel}</div>
                          ) : null}
                          <div className="text-xs font-black text-[#3a2514] truncate">
                            {meta.name}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#3a2514] font-mono tabular-nums shrink-0">
                        +{count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-1 border-t border-[#e6d5b8]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6b421c]">
              <span>開箱明細</span>
              <span className="tabular-nums">
                {summary.revealedDrops.length} / {result.drops.length}
              </span>
            </div>
            <div
              ref={dropsScrollRef}
              data-testid="chest-drops-list"
              className="space-y-1.5 max-h-44 overflow-y-auto pr-1"
            >
              {summary.revealedDrops.length === 0 ? (
                <div className="rounded-lg px-3 py-3 text-xs text-center text-[#8b5a2b] bg-[#faf3e6]/70 border border-dashed border-[#dec8a6]">
                  準備開箱中…
                </div>
              ) : (
                summary.revealedDrops.map((drop, idx) => {
                  const { label, valueText } = formatDropLabel(drop, itemsMap);
                  return (
                    <div
                      key={`${replayCount}-${idx}`}
                      data-testid="chest-drop-item"
                      className="chest-drop-pop rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2 border bg-[#faf3e6] border-[#e3d2b6] text-[#4a3525]"
                    >
                      <span className="truncate font-bold">{label}</span>
                      <span className="font-mono font-black tabular-nums shrink-0 text-[#3a2514]">
                        {valueText}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <button
          type="button"
          onClick={isAnimating ? handleSkipAll : onClose}
          className={`wood-btn w-full min-h-[44px] py-2.5 rounded-xl font-black text-sm ${
            isAnimating
              ? 'bg-amber-500 hover:bg-amber-400 text-[#3a2008]'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          {isAnimating ? '⏩ 全部顯示' : '收下獎勵'}
        </button>
      </div>
    </div>
  );
}
