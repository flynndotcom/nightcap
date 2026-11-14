// Nightcap sits on your chat box, learns each prompt you send, and after every
// reply offers the one it thinks you'd write next. Tab to use it, Esc to dismiss.
(() => {
  if (window.__nightcap) return;
  window.__nightcap = true;

  const SITES = {
    'chatgpt.com': { input: '#prompt-textarea', reply: '[data-message-author-role="assistant"]', send: 'button[data-testid="send-button"], #composer-submit-button', busy: 'button[data-testid="stop-button"]' },
    'claude.ai': { input: 'div[contenteditable="true"].ProseMirror', reply: '.font-claude-response, .font-claude-message, [data-testid="assistant-message"]', send: 'button[aria-label="Send message"], button[aria-label="Send Message"]', busy: 'button[aria-label="Stop response"], [data-is-streaming="true"]' },
    'gemini.google.com': { input: 'rich-textarea .ql-editor, .ql-editor[contenteditable="true"]', reply: 'model-response message-content, .model-response-text', send: 'button.send-button, button[aria-label*="Send"]', busy: 'button[aria-label*="Stop"]' },
    'www.perplexity.ai': { input: 'textarea, div[contenteditable="true"]', reply: '.prose', send: 'button[aria-label="Submit"]', busy: 'button[aria-label*="Stop"]' },
    'grok.com': { input: 'textarea, div[contenteditable="true"]', reply: '.message-bubble, [class*="response"]', send: 'button[type="submit"]', busy: 'button[aria-label*="Stop"]' },
    'chat.deepseek.com': { input: 'textarea', reply: '.ds-markdown', send: 'div[role="button"][aria-disabled="false"]', busy: 'div[role="button"] svg rect' },
    'copilot.microsoft.com': { input: 'textarea', reply: '[data-content="ai-message"]', send: 'button[aria-label*="Submit"], button[title*="Submit"]', busy: 'button[aria-label*="Stop"]' },
  };
  SITES['chat.openai.com'] = SITES['chatgpt.com'];
  const host = location.hostname;
  const S = SITES[host] || window.__ncSite || { input: 'textarea, div[contenteditable="true"]', reply: '', send: 'button[type="submit"]', busy: '' };

  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 14 && r.bottom > 0 && r.top < innerHeight; };
  const textOf = (el) => (el ? ('value' in el && el.tagName === 'TEXTAREA' ? el.value : el.innerText) : '').replace(/​/g, '').trim();
  const send = (msg) => new Promise((res) => { try { chrome.runtime.sendMessage(msg, (r) => res(chrome.runtime.lastError ? null : r)); } catch { res(null); } });

  function findInput() {
    const list = [...document.querySelectorAll(S.input)].filter(visible);
    if (!list.length) return null;
    // The composer is the lowest, widest editable box.
    return list.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
  }
  function lastReply() {
    if (!S.reply) return '';
    const all = document.querySelectorAll(S.reply);
    const el = all[all.length - 1];
    const t = el ? el.innerText.trim() : '';
    return t.slice(-1600);
  }
  const busy = () => !!(S.busy && document.querySelector(S.busy));

  // ---------- the mascot ----------
  const hostEl = document.createElement('div');
  hostEl.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483646;';
  const root = hostEl.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{all:initial}
    .nc{position:fixed;width:64px;height:64px;cursor:pointer;transition:transform .35s cubic-bezier(.3,1.4,.5,1),opacity .4s;filter:drop-shadow(0 6px 10px rgba(10,10,40,.35));opacity:0}
    .nc.on{opacity:1}
    .nc svg{width:100%;height:100%;display:block;overflow:visible}
    .nc:hover{transform:translateY(-3px) scale(1.06)}
    .nc.pop{animation:pop .7s cubic-bezier(.3,1.5,.5,1)}
    .nc.nope{animation:nope .6s ease}
    @keyframes pop{0%{transform:scale(1)}35%{transform:translateY(-10px) scale(1.18)}100%{transform:scale(1)}}
    @keyframes nope{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(10deg)}}
    .bub{position:fixed;max-width:min(520px,70vw);display:flex;align-items:center;gap:10px;padding:10px 12px 10px 14px;border-radius:18px;
      background:rgba(24,26,52,.94);color:#f4f3fa;font:500 14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
      box-shadow:0 14px 34px -12px rgba(5,5,30,.55);backdrop-filter:blur(14px);opacity:0;transform:translateY(6px) scale(.97);transition:opacity .25s,transform .3s cubic-bezier(.3,1.3,.5,1);pointer-events:none}
    .bub.on{opacity:1;transform:none;pointer-events:auto}
    .bub .t{overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
    .k{flex:none;font:600 11.5px -apple-system,sans-serif;padding:3px 8px;border-radius:7px;background:#fff;color:#1b1d3a}
    .p{flex:none;font:600 11.5px -apple-system,sans-serif;color:#ffd27a}
    .x{flex:none;cursor:pointer;opacity:.55;font-size:15px;padding:0 2px}
    .x:hover{opacity:1}
    .card{position:fixed;width:240px;padding:14px;border-radius:20px;background:rgba(24,26,52,.96);color:#f4f3fa;font:500 13px/1.4 -apple-system,sans-serif;box-shadow:0 18px 40px -14px rgba(5,5,30,.6);display:none}
    .card.on{display:block}
    .card b{display:block;font-size:22px;letter-spacing:-.02em}
    .card .s{opacity:.7;margin-top:2px}
    .card button{all:unset;display:block;margin-top:10px;padding:8px 10px;border-radius:11px;background:rgba(255,255,255,.1);cursor:pointer;text-align:center}
    .card button:hover{background:rgba(255,255,255,.18)}
  </style>
  <div class="nc" id="nc" title="Nightcap"></div>
  <div class="bub" id="bub"><span class="t" id="bt"></span><span class="p" id="bp"></span><span class="k">Tab</span><span class="x" id="bx" title="Dismiss">×</span></div>
  <div class="card" id="card"><b id="cs">…</b><div class="s" id="cl"></div><button id="ct"></button></div>`;
  document.documentElement.appendChild(hostEl);
  const $ = (id) => root.getElementById(id);
  const nc = $('nc'), bub = $('bub'), card = $('card');

  let phase = 0.25, expr = 'happy', suggestion = null, settings = { suggest: true, minShow: 0.2, sites: {} };
  const siteOn = () => settings.suggest && settings.sites[host] !== false;
  function paint() { nc.innerHTML = window.nightcapSVG({ p: phase, expr, awake: expr === 'joy' }); }
  function mood(e, ms) {
    expr = e; paint();
    nc.classList.remove('pop', 'nope'); void nc.offsetWidth;
    if (e === 'joy') nc.classList.add('pop');
    if (e === 'surprised') nc.classList.add('nope');
    if (ms) setTimeout(() => { expr = busy() ? 'thinking' : 'happy'; paint(); }, ms);
  }
  function setPhase(sum) {
    if (!sum || !sum.turns) return;
    phase = Math.max(0.12, Math.min(1, 0.15 + (sum.top3 || 0) * 1.6));
    paint();
  }

  let input = null;
  function place() {
    const el = findInput();
    if (el !== input) attach(el);
    if (!input) { nc.classList.remove('on'); bub.classList.remove('on'); return; }
    const r = input.closest('form')?.getBoundingClientRect() || input.getBoundingClientRect();
    // Sit on the top edge with the legs hanging over it.
    nc.style.left = `${Math.round(r.right - 74)}px`;
    nc.style.top = `${Math.round(r.top - 47)}px`;
    nc.classList.add('on');
    bub.style.right = `${Math.round(innerWidth - r.right + 80)}px`;
    bub.style.bottom = `${Math.round(innerHeight - r.top + 10)}px`;
    card.style.right = `${Math.round(innerWidth - r.right + 4)}px`;
    card.style.bottom = `${Math.round(innerHeight - r.top + 16)}px`;
  }

  function showSuggestion(c) {
    suggestion = c;
    if (!c) { bub.classList.remove('on'); return; }
    $('bt').textContent = c.text;
    $('bp').textContent = `${Math.round(c.p * 100)}%`;
    bub.classList.add('on');
    mood('curious');
  }

  function insert(text) {
    input.focus();
    if (input.tagName === 'TEXTAREA') {
      const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      set.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      document.execCommand('selectAll', false);
      document.execCommand('insertText', false, text);
    }
  }

  async function captured(text) {
    if (!text) return;
    showSuggestion(null);
    const ctx = lastReply();
    const turn = { source: host, session: host + location.pathname, project: host, ts: Math.floor(Date.now() / 1000), ctx, pre_files: [], post_files: [], had_error: false, prompt: text.slice(0, 4000), gap: -1 };
    const r = await send({ t: 'learn', turn });
    if (!r) return;
    setPhase(r.summary);
    const o = r.outcome;
    if (o && o.scored) mood(o.hit ? 'joy' : o.top3 ? 'wink' : 'surprised', 1400);
  }

  function attach(el) {
    input = el;
    if (!el || el.__nc) return;
    el.__nc = true;
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab' && !ev.shiftKey && suggestion && !textOf(el)) {
        ev.preventDefault(); ev.stopPropagation();
        insert(suggestion.text);
        showSuggestion(null);
        mood('wink', 900);
        return;
      }
      if (ev.key === 'Escape' && suggestion) { showSuggestion(null); mood('happy'); return; }
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) captured(textOf(el));
    }, true);
  }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest(S.send);
    if (b && input) captured(textOf(input));
  }, true);

  // ---------- when a reply finishes, guess the next turn ----------
  let wasBusy = false, lastCtx = '';
  async function tick() {
    place();
    const b = busy();
    if (b && !wasBusy) { showSuggestion(null); mood('thinking'); }
    if (!b && wasBusy) setTimeout(guess, 600);
    wasBusy = b;
  }
  async function guess() {
    expr = 'happy'; paint();
    if (!siteOn() || !input || textOf(input)) return;
    const ctx = lastReply();
    if (!ctx || ctx === lastCtx) return;
    lastCtx = ctx;
    const c = await send({ t: 'predict', ctx, site: host, session: host + location.pathname });
    const top = c && c[0];
    if (top && top.p >= settings.minShow && !textOf(input)) showSuggestion(top);
  }

  $('bx').addEventListener('click', () => { showSuggestion(null); mood('happy'); });
  bub.addEventListener('click', (ev) => { if (ev.target.id !== 'bx' && suggestion) { insert(suggestion.text); showSuggestion(null); } });
  nc.addEventListener('click', async () => {
    if (card.classList.toggle('on')) {
      const r = await send({ t: 'summary' });
      if (!r) return;
      settings = r.settings;
      const s = r.summary;
      $('cs').textContent = s.turns < 30 ? 'Getting to know you' : `${Math.round((s.top3 || 0) * 100)}% in its top three`;
      $('cl').textContent = s.turns < 30 ? `${s.turns} prompts learned so far.` : `Guessed your exact next prompt ${Math.round((s.score || 0) * 100)}% of the time lately. ${s.turns.toLocaleString()} prompts learned.`;
      $('ct').textContent = siteOn() ? `Pause suggestions on ${host}` : `Suggest on ${host}`;
    }
  });
  $('ct').addEventListener('click', async () => {
    const sites = { ...settings.sites, [host]: !siteOn() };
    settings = await send({ t: 'settings', patch: { sites } }) || settings;
    $('ct').textContent = siteOn() ? `Pause suggestions on ${host}` : `Suggest on ${host}`;
    if (!siteOn()) showSuggestion(null);
  });

  send({ t: 'summary' }).then((r) => { if (r) { settings = r.settings; setPhase(r.summary); } paint(); });
  paint();
  setInterval(tick, 500);
  addEventListener('resize', place);
  addEventListener('scroll', place, true);
})();
