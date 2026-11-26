import type { ChestAnimStage, ChestType } from './chestReveal';

export interface AnimatedChestProps {
  type: ChestType;
  size?: number;
  className?: string;
  stage?: ChestAnimStage;
}

const CHEST_PALETTES: Record<
  ChestType,
  {
    shadow: string;
    bodyFill: string;
    bodyStroke: string;
    plankStroke: string;
    cavityFill: string;
    lidFill: string;
    lidHighlight: string;
    strapFill: string;
    strapStroke: string;
    bandFill: string;
    bandStroke: string;
    claspFill: string;
    claspStroke: string;
    gemFill: string;
    glowColor: string;
    rayColor: string;
  }
> = {
  common: {
    shadow: '#3a2514',
    bodyFill: '#92400e',
    bodyStroke: '#451a03',
    plankStroke: '#78350f',
    cavityFill: '#451a03',
    lidFill: '#b45309',
    lidHighlight: '#d97706',
    strapFill: '#78716c',
    strapStroke: '#292524',
    bandFill: '#a8a29e',
    bandStroke: '#292524',
    claspFill: '#f59e0b',
    claspStroke: '#451a03',
    gemFill: '#fde68a',
    glowColor: 'rgba(245, 158, 11, 0.48)',
    rayColor: '#fde68a',
  },
  rare: {
    shadow: '#0c4a6e',
    bodyFill: '#1e40af',
    bodyStroke: '#0f172a',
    plankStroke: '#1d4ed8',
    cavityFill: '#0f172a',
    lidFill: '#2563eb',
    lidHighlight: '#60a5fa',
    strapFill: '#cbd5e1',
    strapStroke: '#334155',
    bandFill: '#e2e8f0',
    bandStroke: '#334155',
    claspFill: '#38bdf8',
    claspStroke: '#0f172a',
    gemFill: '#bae6fd',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    rayColor: '#7dd3fc',
  },
  gold: {
    shadow: '#78350f',
    bodyFill: '#b45309',
    bodyStroke: '#451a03',
    plankStroke: '#9f1239',
    cavityFill: '#451a03',
    lidFill: '#f59e0b',
    lidHighlight: '#fef08a',
    strapFill: '#fde047',
    strapStroke: '#78350f',
    bandFill: '#fde047',
    bandStroke: '#78350f',
    claspFill: '#fef08a',
    claspStroke: '#78350f',
    gemFill: '#e11d48',
    glowColor: 'rgba(250, 204, 21, 0.65)',
    rayColor: '#fef08a',
  },
};

export function AnimatedChest({
  type,
  size = 40,
  className = '',
  stage = 'closed',
}: AnimatedChestProps) {
  const p = CHEST_PALETTES[type] || CHEST_PALETTES.common;
  const isOpen = stage === 'opening' || stage === 'opened';
  const isShaking = stage === 'shaking';

  const wrapperAnimClass = isShaking
    ? 'chest-stage-shaking'
    : stage === 'opening'
      ? 'chest-stage-opening'
      : stage === 'opened'
        ? 'chest-stage-opened'
        : '';

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${wrapperAnimClass} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {(isShaking || isOpen) && (
        <span
          className={`pointer-events-none absolute inset-[-18%] rounded-full ${
            isOpen ? 'chest-aura-burst' : 'chest-aura-charge'
          }`}
          style={{
            background: `radial-gradient(circle, ${p.glowColor} 0%, rgba(255,255,255,0) 72%)`,
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible drop-shadow-sm"
      >
        {/* Ground shadow */}
        <ellipse
          cx="32"
          cy="56"
          rx={isOpen ? 24 : 22}
          ry="4"
          fill={p.shadow}
          fillOpacity={isOpen ? '0.28' : '0.2'}
        />

        {/* Radiant light beams behind open lid */}
        {isOpen && (
          <g className="chest-light-rays" opacity="0.96">
            <path d="M21 30L8 3L22 7L29 29Z" fill={p.rayColor} fillOpacity="0.68" />
            <path d="M28 29L25 1L39 1L36 29Z" fill={p.claspFill} fillOpacity="0.58" />
            <path d="M35 29L42 7L56 3L43 30Z" fill={p.rayColor} fillOpacity="0.68" />
          </g>
        )}

        {/* Open interior cavity + peeking treasure */}
        {isOpen && (
          <g>
            <rect
              x="11"
              y="22"
              width="42"
              height="10"
              rx="3"
              fill={p.cavityFill}
              stroke={p.bodyStroke}
              strokeWidth="2"
            />
            <ellipse cx="32" cy="27" rx="17" ry="4.5" fill="#fbbf24" fillOpacity="0.5" />
            {/* Gold coins & gem peeking out */}
            <circle cx="22" cy="26" r="4" fill="#fde047" stroke="#92400e" strokeWidth="1.4" />
            <circle cx="32" cy="25" r="4.5" fill="#fef08a" stroke="#92400e" strokeWidth="1.4" />
            <circle cx="42" cy="26.5" r="3.8" fill="#facc15" stroke="#92400e" strokeWidth="1.4" />
            <polygon
              points="27,22 30,26 27,29 24,26"
              fill={type === 'rare' ? '#38bdf8' : type === 'gold' ? '#f43f5e' : '#34d399'}
              stroke="#1f2937"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Chest Base */}
        <g>
          <rect
            x="9.5"
            y="28"
            width="45"
            height="25"
            rx="4.5"
            fill={p.bodyFill}
            stroke={p.bodyStroke}
            strokeWidth="2.5"
          />
          {type === 'common' ? (
            <>
              <line x1="12" y1="37" x2="52" y2="37" stroke={p.plankStroke} strokeWidth="1.5" />
              <line x1="12" y1="45" x2="52" y2="45" stroke={p.plankStroke} strokeWidth="1.5" />
            </>
          ) : (
            <rect x="13" y="33.5" width="38" height="15.5" rx="2.2" fill={p.plankStroke} />
          )}

          {/* Base vertical straps */}
          <rect
            x="15"
            y="28"
            width="5.5"
            height="25"
            rx="1.5"
            fill={p.strapFill}
            stroke={p.strapStroke}
            strokeWidth="1.5"
          />
          <rect
            x="43.5"
            y="28"
            width="5.5"
            height="25"
            rx="1.5"
            fill={p.strapFill}
            stroke={p.strapStroke}
            strokeWidth="1.5"
          />

          {/* Lower keyhole / gem latch when open */}
          {isOpen ? (
            <rect
              x="27.5"
              y="28.5"
              width="9"
              height="7"
              rx="2"
              fill={p.claspFill}
              stroke={p.claspStroke}
              strokeWidth="1.8"
            />
          ) : null}
        </g>

        {/* Chest Lid (hinged upward when opening/opened) */}
        <g
          className={
            stage === 'opening'
              ? 'chest-lid-anim-open'
              : stage === 'opened'
                ? 'chest-lid-static-open'
                : 'chest-lid-closed'
          }
          style={{ transformOrigin: '32px 26px' }}
        >
          <path
            d="M8 28C8 15.5 16 10.5 32 10.5C48 10.5 56 15.5 56 28H8Z"
            fill={p.lidFill}
            stroke={p.bodyStroke}
            strokeWidth="2.5"
          />
          <path
            d="M13 23.5C15.5 16.5 22 14 32 14C42 14 48.5 16.5 51 23.5"
            stroke={p.lidHighlight}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect
            x="15"
            y="12.5"
            width="5.5"
            height="15.5"
            rx="1.5"
            fill={p.strapFill}
            stroke={p.strapStroke}
            strokeWidth="1.5"
          />
          <rect
            x="43.5"
            y="12.5"
            width="5.5"
            height="15.5"
            rx="1.5"
            fill={p.strapFill}
            stroke={p.strapStroke}
            strokeWidth="1.5"
          />
          {type === 'gold' && (
            <path
              d="M25 13L28 7L32 11L36 7L39 13Z"
              fill="#fde047"
              stroke="#78350f"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
          <rect
            x="7.5"
            y="25.5"
            width="49"
            height="5.2"
            rx="2.2"
            fill={p.bandFill}
            stroke={p.bandStroke}
            strokeWidth="2"
          />
          {!isOpen && (
            <>
              <rect
                x="26.5"
                y="23.5"
                width="11"
                height="13.5"
                rx="3"
                fill={p.claspFill}
                stroke={p.claspStroke}
                strokeWidth="2"
              />
              {type === 'common' ? (
                <>
                  <circle cx="32" cy="29.5" r="1.8" fill={p.claspStroke} />
                  <path
                    d="M32 30.8V33.8"
                    stroke={p.claspStroke}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <polygon
                  points="32,25.5 36,30 32,34.5 28,30"
                  fill={p.gemFill}
                  stroke={p.claspStroke}
                  strokeWidth="1.2"
                />
              )}
            </>
          )}
        </g>

        {/* Sparkle accents */}
        {(type !== 'common' || isOpen) && (
          <g className={isOpen ? 'chest-sparkles-active' : ''}>
            <path
              d="M54 9L55.2 12.2L58.5 13.5L55.2 14.8L54 18L52.8 14.8L49.5 13.5L52.8 12.2Z"
              fill={p.rayColor}
            />
            <path
              d="M10 10L11 12.5L13.5 13.5L11 14.5L10 17L9 14.5L6.5 13.5L9 12.5Z"
              fill={p.gemFill}
            />
          </g>
        )}
      </svg>
    </span>
  );
}
