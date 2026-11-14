import { createEngine } from './engine.js';

const DEFAULTS = { suggest: true, minShow: 0.2, sites: {} };
let engine = (async () => {
  const e = await createEngine(chrome.runtime.getURL('nightcap.wasm'));
  const { model } = await chrome.storage.local.get('model');
  if (model) e.load(model);
  return e;
})();

let saveTimer;
function saveSoon(e) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => chrome.storage.local.set({ model: e.save(), savedAt: Date.now() }), 1200);
}

async function settings() {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULTS, ...(settings || {}) };
}

async function badge(e) {
  const s = e.summary();
  const n = Math.round((s.top3 || 0) * 100);
  chrome.action.setBadgeBackgroundColor({ color: '#3f45d8' });
  chrome.action.setBadgeText({ text: s.turns >= 30 ? `${n}` : '' });
}

chrome.runtime.onMessage.addListener((m, _sender, reply) => {
  (async () => {
    const e = await engine;
    switch (m.t) {
      case 'learn': {
        const o = e.learn([m.turn]);
        saveSoon(e);
        badge(e);
        const c = await chrome.storage.local.get('count');
        chrome.storage.local.set({ count: (c.count || 0) + 1 });
        return reply({ outcome: o, summary: e.summary() });
      }
      case 'predict':
        return reply(e.predict({ ctx: m.ctx || '', project: m.site || '', session: m.session || '', ts: Math.floor(Date.now() / 1000), k: 3 }));
      case 'summary':
        return reply({ summary: e.summary(), settings: await settings() });
      case 'import': {
        const o = e.learn(m.turns || []);
        if (m.last) {
          await chrome.storage.local.set({ model: e.save(), savedAt: Date.now() });
          badge(e);
        }
        return reply({ outcome: o, summary: e.summary() });
      }
      case 'settings': {
        const s = { ...(await settings()), ...(m.patch || {}) };
        await chrome.storage.local.set({ settings: s });
        return reply(s);
      }
      case 'reset':
        e.reset();
        await chrome.storage.local.remove(['model', 'count']);
        badge(e);
        return reply({ ok: true });
    }
    reply(null);
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('import.html?welcome=1') });
});
