import React, { useEffect, useState } from 'react';
import type { ChestType } from './chestReveal';
import type { CompanionGiftDrop } from './specialDrops';

export interface CompanionGiftModalProps {
  gift: CompanionGiftDrop | null;
  onClaim: (gift: CompanionGiftDrop) => void;
}

const GIFT_THEMES: Record<
  ChestType,
  {
    auraColor: string;
    auraSecondary: string;
    stageBg: string;
    borderClass: string;
    sparkleGlyph: string;
    hintText: string;
    buttonClass: string;
  }
> = {
  common: {
    auraColor: '#f59e0b',
    auraSecondary: '#fde68a',
    stageBg: 'from-[#fffdf7] via-[#fef3c7]/65 to-[#f5e3c3]',
    borderClass: 'border-[#c8a87a]',
    sparkleGlyph: '✨',
    hintText: '在草叢邊撿到了一個包裹，小心翼翼地推到你面前！',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  rare: {
    auraColor: '#0ea5e9',
    auraSecondary: '#bae6fd',
    stageBg: 'from-[#f0f9ff] via-[#e0f2fe]/75 to-[#dbeafe]',
    borderClass: 'border-sky-400',
    sparkleGlyph: '💠',
    hintText: '神氣地抱回了一個閃著藍光的精美寶箱，看起來很得意！',
    buttonClass: 'bg-sky-700 hover:bg-sky-800 text-white',
  },
  gold: {
    auraColor: '#eab308',
    auraSecondary: '#fef08a',
    stageBg: 'from-[#fefce8] via-[#fef08a]/70 to-[#fde68a]/80',
    borderClass: 'border-amber-500',
    sparkleGlyph: '🌟',
    hintText: '竟然拖回了一個閃閃發亮的華麗寶箱，眼睛都亮起來了！',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
};

function isImageUrl(icon: string): boolean {
  return (
    typeof icon === 'string' &&
    (icon.startsWith('data:image') ||
      icon.startsWith('http://') ||
      icon.startsWith('https://') ||
      icon.startsWith('/'))
  );
}

export function CompanionGiftModal({ gift, onClaim }: CompanionGiftModalProps) {
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    setImgBroken(false);
  }, [gift?.id, gift?.icon]);

  if (!gift) {
    return null;
  }

  const theme = GIFT_THEMES[gift.chestType];

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="伴讀菇菇好像有東西要給你"
      data-testid="companion-gift-modal"
      data-chest-type={gift.chestType}
    >
      <div
        className={`wood-panel rounded-2xl p-5 sm:p-6 space-y-4 w-full max-w-md border-2 ${theme.borderClass}`}
      >
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#6b421c] tabular-nums">
            {gift.name} · {gift.rarity} · 好感 Lv.{gift.bondLevel}
          </div>
          <h3 className="text-lg font-black text-[#3a2514]">
            「{gift.name}」好像有東西要給你⋯⋯！
          </h3>
        </div>

        {/* Animated Mushroom Character Stage */}
        <div
          className={`relative rounded-xl border border-[#e3d2b6] bg-gradient-to-b ${theme.stageBg} py-6 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[176px]`}
        >
          <div
            className="absolute w-32 h-32 rounded-full companion-gift-aura pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${theme.auraSecondary} 0%, ${theme.auraColor}55 52%, transparent 74%)`,
            }}
            aria-hidden="true"
          />

          <span
            className="absolute left-[22%] top-[24%] text-xl companion-gift-sparkle pointer-events-none select-none"
            style={{ animationDelay: '0s' }}
            aria-hidden="true"
          >
            {theme.sparkleGlyph}
          </span>
          <span
            className="absolute right-[22%] top-[22%] text-lg companion-gift-sparkle pointer-events-none select-none"
            style={{ animationDelay: '0.45s' }}
            aria-hidden="true"
          >
            💛
          </span>
          <span
            className="absolute right-[28%] bottom-[22%] text-base companion-gift-sparkle pointer-events-none select-none"
            style={{ animationDelay: '0.85s' }}
            aria-hidden="true"
          >
            ✨
          </span>

          <div className="relative z-10 companion-gift-bounce flex items-center justify-center">
            {isImageUrl(gift.icon) && !imgBroken ? (
              <img
                src={gift.icon}
                alt={gift.name}
                referrerPolicy="no-referrer"
                onError={() => setImgBroken(true)}
                className="w-24 h-24 object-contain drop-shadow-md select-none"
              />
            ) : (
              <div
                className="w-24 h-24 flex items-center justify-center text-6xl drop-shadow-md select-none"
                aria-label={gift.name}
              >
                {imgBroken ? '🍄' : gift.icon || '🍄'}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-center font-bold text-[#5c3614] leading-relaxed">
          {theme.hintText}
        </p>

        <button
          type="button"
          onClick={() => onClaim(gift)}
          className={`wood-btn w-full min-h-[44px] py-2.5 px-4 rounded-xl font-black text-sm ${theme.buttonClass}`}
        >
          🎁 看看是什麼
        </button>
      </div>
    </div>
  );
}
