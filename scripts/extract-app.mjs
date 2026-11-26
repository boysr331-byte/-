import fs from 'node:fs';

const html = fs.readFileSync('public/assets/aistudio/index_ff85620d.html', 'utf8');

// 1. Build src/index.css
const wp = html.indexOf('.wood-panel{');
const prop = html.indexOf('@property --tw-translate-x');
const customCss = html.slice(wp, prop);

const newChestCss = `
@keyframes chestShake {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  15% { transform: translateY(2px) rotate(-6deg) scale(1.04, 0.95); }
  30% { transform: translateY(-2px) rotate(6deg) scale(0.97, 1.04); }
  45% { transform: translateY(2px) rotate(-7deg) scale(1.05, 0.94); }
  60% { transform: translateY(-2px) rotate(7deg) scale(0.96, 1.05); }
  75% { transform: translateY(2px) rotate(-4deg) scale(1.04, 0.95); }
  90% { transform: translateY(-1px) rotate(3deg) scale(0.99, 1.02); }
}
.chest-stage-shaking {
  animation: 0.42s ease-in-out infinite chestShake;
  will-change: transform;
}

@keyframes chestPopBounce {
  0% { transform: translateY(4px) scale(1.06, 0.9); }
  42% { transform: translateY(-10px) scale(0.96, 1.08); }
  75% { transform: translateY(2px) scale(1.03, 0.98); }
  100% { transform: translateY(0) scale(1); }
}
.chest-stage-opening {
  animation: 0.44s cubic-bezier(0.22, 1, 0.36, 1) forwards chestPopBounce;
  will-change: transform;
}

@keyframes chestLidOpen {
  0% { transform: translateY(0) rotate(0deg) scaleY(1); }
  55% { transform: translateY(-14px) rotate(-22deg) scaleY(0.84); }
  80% { transform: translateY(-10px) rotate(-15deg) scaleY(0.9); }
  100% { transform: translateY(-11px) rotate(-16deg) scaleY(0.88); }
}
.chest-lid-anim-open {
  animation: 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards chestLidOpen;
  will-change: transform;
}
.chest-lid-static-open {
  transform: translateY(-11px) rotate(-16deg) scaleY(0.88);
}

@keyframes chestAuraCharge {
  0%, 100% { opacity: 0.45; transform: scale(0.88); }
  50% { opacity: 0.95; transform: scale(1.08); }
}
.chest-aura-charge {
  animation: 0.5s ease-in-out infinite chestAuraCharge;
}

@keyframes chestAuraBurst {
  0% { opacity: 0.25; transform: scale(0.65); }
  45% { opacity: 1; transform: scale(1.22); }
  100% { opacity: 0.72; transform: scale(1.05); }
}
.chest-aura-burst {
  animation: 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards chestAuraBurst;
}

@keyframes chestLightRays {
  0% { opacity: 0; transform: scaleY(0.2) translateY(10px); }
  50% { opacity: 0.95; transform: scaleY(1.08) translateY(-2px); }
  100% { opacity: 0.85; transform: scaleY(1) translateY(0); }
}
.chest-light-rays {
  transform-origin: 32px 28px;
  animation: 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards chestLightRays;
}

@keyframes chestSparkleFloat {
  0%, 100% { opacity: 0.7; transform: translateY(0) scale(0.95); }
  50% { opacity: 1; transform: translateY(-3px) scale(1.1); }
}
.chest-sparkles-active {
  animation: 1.5s ease-in-out infinite chestSparkleFloat;
}

@keyframes chestDropPop {
  0% { opacity: 0; transform: translateY(-14px) scale(0.8); }
  62% { opacity: 1; transform: translateY(2px) scale(1.03); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.chest-drop-pop {
  animation: 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards chestDropPop;
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .chest-stage-shaking,
  .chest-stage-opening,
  .chest-lid-anim-open,
  .chest-aura-charge,
  .chest-aura-burst,
  .chest-light-rays,
  .chest-sparkles-active,
  .chest-drop-pop {
    animation: none !important;
    transition: none !important;
  }
}
`;

const indexCss = `@import "tailwindcss";

@layer base {
  body {
    color: #4a3525;
    background-color: #fdf6e3;
    background-image: radial-gradient(#e6d5b8 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    font-family: 'Noto Sans TC', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

/* Custom studio styles */
${customCss}
${newChestCss}
`;

fs.writeFileSync('src/index.css', indexCss);

// 2. Extract and update src/MushroomApp.jsx
const s0 = html.indexOf('<script type="module" crossorigin>') + '<script type="module" crossorigin>'.length;
const s1 = html.indexOf('</script>', s0);
const fullJs = html.slice(s0, s1);

const yIdx = fullJs.indexOf('y=3e3');
const renderIdx = fullJs.indexOf('(0,v.createRoot)');
let appCode = 'var ' + fullJs.slice(yIdx, renderIdx);

const itStart = appCode.indexOf(',It=o(');
const ztStart = appCode.indexOf('function zt()');

if (itStart === -1 || ztStart === -1) {
  throw new Error('Could not locate markers: ' + JSON.stringify({ itStart, ztStart }));
}

appCode =
  appCode.slice(0, itStart) +
  ';\nconst Lt = AnimatedChest;\nconst Rt = ({ result, onClose, soundEnabled = false }) => (0, z.jsx)(ChestResultModal, { result, onClose, chestsMap: le, itemsMap: j, ConfettiCanvas: Vt, soundEnabled, soundFx: R });\n' +
  appCode.slice(ztStart);

const rtUsageBefore = '(0,z.jsx)(Rt,{result:te?null:ne[0]||null,onClose:()=>ie(e=>e.slice(1))})';
const rtUsageAfter = '(0,z.jsx)(Rt,{result:te?null:ne[0]||null,soundEnabled:e.soundEnabled,onClose:()=>ie(e=>e.slice(1))})';
if (!appCode.includes(rtUsageBefore)) {
  throw new Error('Could not find Rt usage');
}
appCode = appCode.replace(rtUsageBefore, rtUsageAfter);

const replacements = [
  ['可開出第 1 檔基本 NP 與營養劑／稀有藥，並有機會額外獲得第 2 檔改良獎勵或基礎黴菌胞子。', '可開出基本 NP 與營養劑／稀有藥，並有機會額外獲得進階道具或基礎黴菌胞子。'],
  ['可開出第 2 檔改良 NP 與道具（含第 1 檔基本藥水），並有機會額外獲得第 3 檔新型獎勵或進階黴菌胞子。', '可開出豐厚 NP 與改良道具，並有機會額外獲得高階獎勵或進階黴菌胞子。'],
  ['可開出第 3 檔新型 NP 與道具（含第 2 檔改良藥水），並有機會額外獲得第 4 檔終極獎勵或稀有黴菌胞子。', '可開出大量 NP 與稀有道具，並有機會額外獲得終極獎勵或稀有黴菌胞子。'],
  ['nutrient_1:{id:`nutrient_1`,name:`基本營養劑`,icon:`🧪`,category:`nutrient`,tier:1,tierLabel:`第 1 檔 · 基本`', 'nutrient_1:{id:`nutrient_1`,name:`基本營養劑`,icon:`🧪`,category:`nutrient`,tier:1,tierLabel:`營養劑 · 基本`'],
  ['nutrient_2:{id:`nutrient_2`,name:`改良營養劑`,icon:`⚗️`,category:`nutrient`,tier:2,tierLabel:`第 2 檔 · 改良`', 'nutrient_2:{id:`nutrient_2`,name:`改良營養劑`,icon:`⚗️`,category:`nutrient`,tier:2,tierLabel:`營養劑 · 改良`'],
  ['nutrient_3:{id:`nutrient_3`,name:`新型營養劑`,icon:`🧬`,category:`nutrient`,tier:3,tierLabel:`第 3 檔 · 新型`', 'nutrient_3:{id:`nutrient_3`,name:`新型營養劑`,icon:`🧬`,category:`nutrient`,tier:3,tierLabel:`營養劑 · 新型`'],
  ['nutrient_4:{id:`nutrient_4`,name:`終極營養劑`,icon:`🌟`,category:`nutrient`,tier:4,tierLabel:`第 4 檔 · 終極`', 'nutrient_4:{id:`nutrient_4`,name:`終極營養劑`,icon:`🌟`,category:`nutrient`,tier:4,tierLabel:`營養劑 · 終極`'],
  ['potion_1:{id:`potion_1`,name:`基本稀有藥`,icon:`🫧`,category:`potion`,tier:1,tierLabel:`第 1 檔 · 基本`', 'potion_1:{id:`potion_1`,name:`基本稀有藥`,icon:`🫧`,category:`potion`,tier:1,tierLabel:`稀有藥 · 基本`'],
  ['potion_2:{id:`potion_2`,name:`改良稀有藥`,icon:`💧`,category:`potion`,tier:2,tierLabel:`第 2 檔 · 改良`', 'potion_2:{id:`potion_2`,name:`改良稀有藥`,icon:`💧`,category:`potion`,tier:2,tierLabel:`稀有藥 · 改良`'],
  ['potion_3:{id:`potion_3`,name:`新型稀有藥`,icon:`✨`,category:`potion`,tier:3,tierLabel:`第 3 檔 · 新型`', 'potion_3:{id:`potion_3`,name:`新型稀有藥`,icon:`✨`,category:`potion`,tier:3,tierLabel:`稀有藥 · 新型`'],
  ['potion_4:{id:`potion_4`,name:`終極稀有藥`,icon:`🔮`,category:`potion`,tier:4,tierLabel:`第 4 檔 · 終極`', 'potion_4:{id:`potion_4`,name:`終極稀有藥`,icon:`🔮`,category:`potion`,tier:4,tierLabel:`稀有藥 · 終極`'],
];

for (const [from, to] of replacements) {
  if (!appCode.includes(from)) {
    throw new Error('Missing replacement target: ' + from);
  }
  appCode = appCode.replace(from, to);
}

appCode = appCode.replaceAll(
  '(0,z.jsx)(Lt,{type:e.chestType,size:38,className:n?`opacity-65`:``})',
  '(0,z.jsx)(Lt,{type:e.chestType,size:38,stage:n?`opened`:`closed`,className:n?`opacity-70`:``})'
);
appCode = appCode.replaceAll(
  '(0,z.jsx)(Lt,{type:t.chestType,size:36,className:n?`opacity-65`:``})',
  '(0,z.jsx)(Lt,{type:t.chestType,size:36,stage:n?`opened`:`closed`,className:n?`opacity-70`:``})'
);

const header = `// @ts-nocheck
import * as _ from 'react';
import * as z from 'react/jsx-runtime';
import { AnimatedChest } from './AnimatedChest';
import { ChestResultModal } from './ChestResultModal';

`;
const footer = `
export default function MushroomApp() {
  return (0, z.jsx)(vn, {});
}
`;

fs.writeFileSync('src/MushroomApp.jsx', header + appCode + footer);
console.log('Generated src/index.css and src/MushroomApp.jsx cleanly.');
