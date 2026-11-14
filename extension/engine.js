// The Nightcap engine, compiled from Rust to WebAssembly. JSON in, JSON out.
export async function createEngine(url) {
  const bytes = await (await fetch(url)).arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const x = instance.exports;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const mem = () => new Uint8Array(x.memory.buffer);
  const call = (fn, str) => {
    const b = enc.encode(str);
    const p = x.nc_alloc(b.length || 1);
    mem().set(b, p);
    const r = fn(p, b.length);
    x.nc_free(p, b.length || 1);
    return r;
  };
  const read = (ptr) => dec.decode(mem().slice(ptr, ptr + x.nc_out_len()));
  const json = (s, d) => { try { return JSON.parse(s); } catch { return d; } };
  return {
    load: (s) => call(x.nc_load, s) === 1,
    save: () => read(x.nc_save()),
    learn: (turns) => json(read(call(x.nc_learn, JSON.stringify(turns))), null),
    predict: (q) => json(read(call(x.nc_predict, JSON.stringify(q))), []),
    summary: (wake = 0.99) => json(read(x.nc_summary(wake)), {}),
    reset: () => x.nc_reset(),
  };
}
