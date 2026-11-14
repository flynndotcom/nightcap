import { nightcapSVG } from './lib/nightcap.js';
const send = (m) => chrome.runtime.sendMessage(m);
const $ = (id) => document.getElementById(id);
const face = (expr, p = 0.3, awake = false) => ($('moon').innerHTML = nightcapSVG({ p, expr, awake }));
face(new URLSearchParams(location.search).has('welcome') ? 'wink' : 'curious');
if (new URLSearchParams(location.search).has('welcome')) {
  $('h').textContent = "Hi! I'm Nightcap.";
  $('sub').textContent = "I'll sit on your AI chat box and learn how you prompt. Give me a head start: drop in your ChatGPT or Claude export.";
}

const tail = (s, n) => (s.length > n ? s.slice(-n) : s);
const turn = (source, session, project, ts, ctx, prompt) => ({ source, session, project, ts: Math.floor(ts || 0), ctx: tail(ctx, 1600), pre_files: [], post_files: [], had_error: false, prompt: prompt.slice(0, 4000), gap: -1 });

function fromChatGPT(convs) {
  const out = [];
  for (const c of convs) {
    if (!c.mapping) continue;
    const path = [];
    let id = c.current_node;
    while (id && c.mapping[id]) { path.push(c.mapping[id]); id = c.mapping[id].parent; }
    path.reverse();
    let ctx = '';
    for (const n of path) {
      const m = n.message;
      if (!m || !m.content) continue;
      const text = (m.content.parts || []).filter((x) => typeof x === 'string').join('\n').trim();
      if (!text) continue;
      if (m.author?.role === 'assistant') ctx = tail(ctx + '\n' + text, 3200);
      else if (m.author?.role === 'user') { out.push(turn('chatgpt', 'chatgpt:' + (c.id || c.conversation_id || c.title), 'chatgpt.com', m.create_time || c.create_time, ctx, text)); ctx = ''; }
    }
  }
  return out;
}
function fromClaude(convs) {
  const out = [];
  for (const c of convs) {
    let ctx = '';
    for (const m of c.chat_messages || []) {
      const text = (m.text || (m.content || []).map((x) => x.text || '').join('\n')).trim();
      if (!text) continue;
      const ts = Date.parse(m.created_at) / 1000;
      if (m.sender === 'assistant') ctx = tail(ctx + '\n' + text, 3200);
      else { out.push(turn('claude', 'claude:' + c.uuid, 'claude.ai', ts, ctx, text)); ctx = ''; }
    }
  }
  return out;
}

async function learnFile(file) {
  face('thinking');
  $('h').textContent = 'Reading…';
  let data;
  try { data = JSON.parse(await file.text()); } catch { return fail("That file isn't JSON. Look for conversations.json inside the export."); }
  const convs = Array.isArray(data) ? data : data.conversations || [];
  const turns = (convs[0]?.mapping ? fromChatGPT(convs) : fromClaude(convs)).filter((t) => t.prompt).sort((a, b) => a.ts - b.ts);
  if (!turns.length) return fail("I couldn't find any of your messages in that file.");
  $('prog').style.display = 'block';
  const size = 250;
  for (let i = 0; i < turns.length; i += size) {
    const r = await send({ t: 'import', turns: turns.slice(i, i + size), last: i + size >= turns.length });
    const p = Math.min(1, (i + size) / turns.length);
    $('bar').style.width = `${p * 100}%`;
    $('h').textContent = `Learning ${Math.min(i + size, turns.length).toLocaleString()} of ${turns.length.toLocaleString()}`;
    face(i % 1000 < 500 ? 'thinking' : 'curious', 0.15 + p * 0.85);
    if (r && i + size >= turns.length) done(r.summary, turns.length);
  }
}
function done(s, n) {
  face('joy', Math.max(0.3, Math.min(1, 0.15 + (s.top3 || 0) * 1.6)), true);
  $('h').textContent = 'Got it. Goodnight!';
  $('sub').textContent = `I learned ${n.toLocaleString()} of your prompts. Replaying them, your next prompt was in my top three ${Math.round((s.top3 || 0) * 100)}% of the time. Open a chat and I'll be sitting on the box.`;
}
function fail(msg) { face('surprised'); $('h').textContent = 'Hmm.'; $('sub').textContent = msg; }

const drop = $('drop');
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) learnFile(f); });
$('file').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) learnFile(f); });
$('reset').addEventListener('click', async () => {
  if (!confirm('Forget everything Nightcap has learned in this browser?')) return;
  await send({ t: 'reset' });
  face('sleepy', 0.1);
  $('h').textContent = 'All forgotten.';
  $('sub').textContent = "I'm a blank slate again.";
});
