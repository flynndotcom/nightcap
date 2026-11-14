import { nightcapSVG } from './lib/nightcap.js';
const send = (m) => chrome.runtime.sendMessage(m);
const $ = (id) => document.getElementById(id);
const { summary: s, settings } = await send({ t: 'summary' });
const known = (s.turns || 0) >= 30;
const phase = known ? Math.max(0.12, Math.min(1, 0.15 + (s.top3 || 0) * 1.6)) : 0.2;
$('moon').innerHTML = nightcapSVG({ p: phase, expr: known ? 'happy' : 'curious', awake: s.awake });
if (known) {
  $('h').textContent = `${Math.round((s.top3 || 0) * 100)}% in my top three`;
  $('sub').textContent = `I guessed your exact next prompt ${Math.round((s.score || 0) * 100)}% of the time lately, from ${s.turns.toLocaleString()} prompts.`;
  $('kinds').innerHTML = (s.kinds || []).filter((k) => k.total >= 8).slice(0, 5).map((k) =>
    `<div class="kind"><span>${k.name}</span><span class="bar"><i style="width:${Math.round(k.score * 100)}%"></i></span><span class="num">${Math.round(k.score * 100)}%</span></div>`).join('');
} else if (s.turns > 0) {
  $('h').textContent = 'Getting to know you';
  $('sub').textContent = `${s.turns} prompts learned. I start guessing after 30, or teach me your history now.`;
}
const sw = $('sug');
sw.setAttribute('aria-checked', String(settings.suggest));
sw.onclick = async () => {
  const on = sw.getAttribute('aria-checked') !== 'true';
  sw.setAttribute('aria-checked', String(on));
  await send({ t: 'settings', patch: { suggest: on } });
};
