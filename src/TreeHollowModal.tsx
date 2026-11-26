import React from 'react';
import type { ChestType } from './chestReveal';
import { getHighestChestQuality } from './specialDrops';

export interface TreeHollowModalProps {
  chests: ChestType[] | null;
  onInspect: () => void;
}

const HOLLOW_THEMES: Record<
  ChestType,
  {
    glowColor: string;
    glowSecondary: string;
    rimColor: string;
    moteColor: string;
    stageBg: string;
    badgeText: string;
    clueText: string;
    buttonClass: string;
    showRays: boolean;
  }
> = {
  common: {
    glowColor: '#f59e0b',
    glowSecondary: '#fde68a',
    rimColor: 'border-amber-400/70',
    moteColor: '#fbbf24',
    stageBg: 'from-[#fffbeb] via-[#fef3c7]/70 to-[#f5e3c1]',
    badgeText: '溫潤琥珀微光',
    clueText: '樹洞裡透出柔和的暖金色微光，好像藏著什麼好東西！',
    buttonClass: 'bg-[#8b5a2b] hover:bg-[#6b421c] text-white',
    showRays: false,
  },
  rare: {
    glowColor: '#0ea5e9',
    glowSecondary: '#bae6fd',
    rimColor: 'border-sky-400/80',
    moteColor: '#38bdf8',
    stageBg: 'from-[#f0f9ff] via-[#e0f2fe]/80 to-[#dbeafe]',
    badgeText: '神祕湛藍輝光',
    clueText: '樹洞深處正閃爍著清澈神祕的湛藍光芒，似乎有不尋常的寶物！',
    buttonClass: 'bg-sky-700 hover:bg-sky-800 text-white',
    showRays: true,
  },
  gold: {
    glowColor: '#eab308',
    glowSecondary: '#fef08a',
    rimColor: 'border-yellow-400',
    moteColor: '#fde047',
    stageBg: 'from-[#fefce8] via-[#fef08a]/65 to-[#fde68a]/80',
    badgeText: '耀眼金色神輝',
    clueText: '極為罕見的炫目金色光芒從樹洞滿溢而出！究竟發現了什麼？！',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    showRays: true,
  },
};

export function TreeHollowModal({ chests, onInspect }: TreeHollowModalProps) {
  if (!chests || chests.length === 0) {
    return null;
  }

  const quality = getHighestChestQuality(chests);
  const theme = HOLLOW_THEMES[quality];

  return (
    <div
      className="fixed inset-0 z-[94] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="樹洞發現閃閃發光的寶物"
      data-testid="tree-hollow-modal"
      data-quality={quality}
    >
      <div
        className={`wood-panel rounded-2xl p-5 sm:p-6 space-y-4 w-full max-w-md relative overflow-hidden border-2 ${theme.rimColor}`}
      >
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#6b421c] tracking-wide">
            原木旁傳來異樣動靜 · {theme.badgeText}
            {chests.length > 1 ? ` · 共 ${chests.length} 處` : ''}
          </div>
          <h3 className="text-lg font-black text-[#3a2514]">
            樹洞好像有什麼東西在閃閃發光⋯⋯！
          </h3>
        </div>

        {/* Illustrated Tree Hollow with Quality Glow */}
        <div
          className={`relative rounded-xl border border-[#dec8a6] bg-gradient-to-b ${theme.stageBg} py-6 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[190px]`}
        >
          {theme.showRays && (
            <svg
              viewBox="0 0 180 180"
              className="absolute inset-0 m-auto w-56 h-56 pointer-events-none hollow-rays-spin"
              aria-hidden="true"
            >
              <g fill={theme.glowSecondary} opacity="0.55">
                <polygon points="90,90 78,8 102,8" />
                <polygon points="90,90 172,78 172,102" />
                <polygon points="90,90 78,172 102,172" />
                <polygon points="90,90 8,78 8,102" />
                <polygon points="90,90 140,22 158,40" />
                <polygon points="90,90 40,22 22,40" />
                <polygon points="90,90 140,158 158,140" />
                <polygon points="90,90 40,158 22,140" />
              </g>
            </svg>
          )}

          {/* Ambient glow halo */}
          <div
            className="absolute w-36 h-36 rounded-full hollow-glow-pulse pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${theme.glowSecondary} 0%, ${theme.glowColor}66 48%, transparent 72%)`,
            }}
            aria-hidden="true"
          />

          {/* Floating light motes */}
          <span
            className="absolute left-[28%] top-[36%] w-2.5 h-2.5 rounded-full hollow-mote-float pointer-events-none"
            style={{ backgroundColor: theme.moteColor, animationDelay: '0s' }}
            aria-hidden="true"
          />
          <span
            className="absolute right-[26%] top-[32%] w-2 h-2 rounded-full hollow-mote-float pointer-events-none"
            style={{ backgroundColor: theme.glowSecondary, animationDelay: '0.6s' }}
            aria-hidden="true"
          />
          <span
            className="absolute left-[46%] top-[24%] w-2 h-2 rounded-full hollow-mote-float pointer-events-none"
            style={{ backgroundColor: theme.moteColor, animationDelay: '1.15s' }}
            aria-hidden="true"
          />

          {/* SVG Wooden Tree Trunk & Glowing Hollow */}
          <svg
            viewBox="0 0 140 120"
            className="w-36 h-32 relative z-10 drop-shadow-md"
            aria-hidden="true"
          >
            {/* Bark / Tree Trunk */}
            <path
              d="M28,112 C32,76 34,42 26,14 L114,14 C106,42 108,76 112,112 Z"
              fill="#6d4322"
              stroke="#442710"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Bark grain highlights */}
            <path
              d="M42,22 C44,44 43,72 39,104 M98,22 C96,44 97,72 101,104"
              stroke="#85552d"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Moss accent */}
            <path
              d="M24,108 Q42,96 58,108 Q74,98 90,108 Q106,96 118,108 L118,114 L22,114 Z"
              fill="#4d7c0f"
              stroke="#365314"
              strokeWidth="2.5"
            />
            {/* Tree Hollow Rim */}
            <ellipse
              cx="70"
              cy="64"
              rx="23"
              ry="28"
              fill="#2a1608"
              stroke="#4a2b13"
              strokeWidth="4"
            />
            {/* Glowing Treasure Light inside Hollow */}
            <ellipse
              cx="70"
              cy="66"
              rx="16"
              ry="20"
              fill={theme.glowColor}
              opacity="0.88"
            />
            <ellipse
              cx="70"
              cy="66"
              rx="10"
              ry="13"
              fill={theme.glowSecondary}
              opacity="0.95"
            />
            {/* Shimmer star inside hollow */}
            <path
              d="M70,54 L72.5,63.5 L82,66 L72.5,68.5 L70,78 L67.5,68.5 L58,66 L67.5,63.5 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <p className="text-xs sm:text-sm text-center font-bold text-[#5c3614] leading-relaxed">
          {theme.clueText}
        </p>

        <button
          type="button"
          onClick={onInspect}
          className={`wood-btn w-full min-h-[44px] py-2.5 px-4 rounded-xl font-black text-sm ${theme.buttonClass}`}
        >
          ✨ 伸手探查樹洞
        </button>
      </div>
    </div>
  );
}
