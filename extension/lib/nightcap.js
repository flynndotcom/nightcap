// Nightcap, the character. One drawing used by the extension, the desktop app,
// the website and the icons. Pure string output, no DOM needed.
let U=0;const uid=()=>'nc'+(U++).toString(36)+Math.random().toString(36).slice(2,6);
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,x)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*Math.max(0,Math.min(1,x))).toString(16).padStart(2,'0')).join('')};
const lg=(id,a,b,x2=0,y2=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const f1=n=>(+n).toFixed(2);
function legs(o,xs,y0,col,len=14){if(o.legs===false)return '';
  return xs.map(x=>`<path d="M${f1(x)} ${f1(y0)} L${f1(x)} ${f1(y0+len)}" stroke="${col}" stroke-width="3.6" stroke-linecap="round"/>`).join('')}
function halo(o,col,cx=50,cy=50,r=46){if(!o.awake)return '';const id=uid();
  return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`}

/* one face system, every character */
function face(o,f){
  const e=o.expr||(o.awake?'joy':'happy'),c=f.c,rx=f.rx||2.4,ry=f.ry||3.1;
  const [lx,ly]=f.l,[qx,qy]=f.r,mx=(lx+qx)/2,my=Math.max(ly,qy)+(f.mg||7);
  const dot=(x,y,s=1)=>`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx*s)}" ry="${f1(ry*s)}" fill="${c}"/>`+
    (f.glint===false?'':`<circle cx="${f1(x+rx*s*.35)}" cy="${f1(y-ry*s*.42)}" r="${f1(rx*s*.4)}" fill="#fff"/>`);
  const st=(d,w=2.2)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const up=(x,y)=>st(`M${f1(x-rx*1.45)} ${f1(y+1.2)} Q${f1(x)} ${f1(y-ry*1.5)} ${f1(x+rx*1.45)} ${f1(y+1.2)}`,2.3);
  const down=(x,y)=>st(`M${f1(x-rx*1.45)} ${f1(y-.4)} Q${f1(x)} ${f1(y+ry*1.25)} ${f1(x+rx*1.45)} ${f1(y-.4)}`,2.1);
  let E='',M='',X='';
  if(e==='happy'){E=dot(lx,ly)+dot(qx,qy);M=st(`M${f1(mx-3.4)} ${f1(my)} Q${f1(mx)} ${f1(my+3.6)} ${f1(mx+3.4)} ${f1(my)}`)}
  if(e==='joy'){E=up(lx,ly)+up(qx,qy);M=`<path d="M${f1(mx-4.4)} ${f1(my-.6)} Q${f1(mx)} ${f1(my+6.4)} ${f1(mx+4.4)} ${f1(my-.6)}Z" fill="${c}"/>`}
  if(e==='curious'){E=dot(lx,ly-.6)+dot(qx,qy-1.4,1.28);M=`<ellipse cx="${f1(mx+1)}" cy="${f1(my+.6)}" rx="1.5" ry="1.9" fill="${c}"/>`;
    X=st(`M${f1(qx-3)} ${f1(qy-ry*2.3)} Q${f1(qx)} ${f1(qy-ry*3)} ${f1(qx+3)} ${f1(qy-ry*2.4)}`,1.7)}
  if(e==='thinking'){E=dot(lx+1.3,ly-1.3)+dot(qx+1.3,qy-1.3);M=st(`M${f1(mx-2.8)} ${f1(my+.9)} L${f1(mx+2.8)} ${f1(my-.5)}`);
    X=st(`M${f1(lx-2.8)} ${f1(ly-ry*2.2)} L${f1(lx+2.8)} ${f1(ly-ry*1.9)}`,1.7)}
  if(e==='surprised'){E=dot(lx,ly,1.3)+dot(qx,qy,1.3);M=`<ellipse cx="${f1(mx)}" cy="${f1(my+1.2)}" rx="2.3" ry="3" fill="${c}"/>`;
    X=[lx,qx].map((x,i)=>st(`M${f1(x-2.6)} ${f1([ly,qy][i]-ry*2.5)} Q${f1(x)} ${f1([ly,qy][i]-ry*3.1)} ${f1(x+2.6)} ${f1([ly,qy][i]-ry*2.5)}`,1.6)).join('')}
  if(e==='sleepy'){E=down(lx,ly)+down(qx,qy);M=st(`M${f1(mx-1.8)} ${f1(my)} Q${f1(mx)} ${f1(my+1.5)} ${f1(mx+1.8)} ${f1(my)}`,1.9);
    if(f.z)X=`<text x="${f.z[0]}" y="${f.z[1]}" font-size="9" font-weight="760" fill="${f.zc||'#8b90bd'}" font-family="-apple-system,sans-serif">z</text><text x="${f.z[0]+6.5}" y="${f.z[1]-6.5}" font-size="6.5" font-weight="760" fill="${f.zc||'#8b90bd'}" font-family="-apple-system,sans-serif">z</text>`}
  if(e==='wink'){E=up(lx,ly)+dot(qx,qy);M=st(`M${f1(mx-4)} ${f1(my-.3)} Q${f1(mx)} ${f1(my+4.6)} ${f1(mx+4)} ${f1(my-.3)}`)}
  const ch=(['happy','joy','wink','sleepy'].includes(e)&&f.ch)?f.ch.map(([x,y])=>`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="4" ry="2.3" fill="${f.cc}" opacity="${f.co||.55}"/>`).join(''):'';
  return ch+E+M+X;
}
function star(cx,cy,R,r,fill,extra=''){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;d+=(i?'L':'M')+f1(cx+Math.cos(a)*q)+' '+f1(cy+Math.sin(a)*q)}
  return `<path d="${d}Z" fill="${fill}" stroke="${fill}" stroke-width="1.6" stroke-linejoin="round" ${extra}/>`}
function phaseMoon(o,cx,cy,r,lit,dark,craters=true){
  const cp=uid(),p=o.p;
  return `<defs><clipPath id="${cp}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
  <g clip-path="url(#${cp})"><rect x="${cx-r}" y="${cy-r}" width="${2*r}" height="${2*r}" fill="${lit}"/>
  ${craters?`<circle cx="${cx+10}" cy="${cy-12}" r="4.2" fill="#f0dfb6"/><circle cx="${cx-12}" cy="${cy+14}" r="3" fill="#f0dfb6"/><circle cx="${cx+14}" cy="${cy+12}" r="2" fill="#f0dfb6"/>`:''}
  <circle cx="${f1(cx-p*(2*r+6))}" cy="${cy}" r="${r+.6}" fill="${dark}"/></g>
  ${p>=1?'':`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3d4280" stroke-width="1.6"/>`}`;
}

function draw(o){const lit=o.p>.55,g=uid();
  return `${halo(o,'#ffe0a0',50,52)}<defs>${lg(g,'#7d8bff','#3f45d8',.6,1)}</defs>${legs(o,[43,57],73,'#d8bf88')}
  ${phaseMoon(o,50,52,26,'#fff3d6','#2a2e5c')}
  <path d="M24 43 C26 25 40 16 58 17 C72 18 82 26 86 37 C88 43 86 49 82 51 C80 43 74 37 66 35 C52 32 36 36 24 43Z" fill="url(#${g})"/>
  ${[[40,26],[56,22],[70,28]].map(([x,y])=>star(x,y,2.4,1,'#fff','opacity=".85"')).join('')}
  <path d="M23 44 C38 35 58 33 72 37" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
  <circle cx="82.5" cy="52" r="5.6" fill="#fff"/>
  ${face(o,{l:[43,56],r:[57,56],rx:2.5,ry:3.3,c:lit?'#2a2e5c':'#ffd27a',glint:lit,ch:lit?[[36,63],[64,63]]:null,cc:'#ffb9a0',co:.6,z:[10,34],zc:'#ffe2a6'})}`}

/** Full <svg>. p: 0..1 how well it knows you (moon phase). expr: happy, curious,
 *  thinking, surprised, sleepy, wink, joy. awake: glow. legs: false for icons. */
export function nightcapSVG({p=1,expr,awake=false,legs=true,size,viewBox='0 6 100 90',cls=''}={}){
  const o={p,expr,awake,legs};
  const sz=size?` width="${size}" height="${size}"`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${sz}${cls?` class="${cls}"`:''} aria-hidden="true">${draw(o)}</svg>`;
}
export const EXPRESSIONS=['happy','curious','thinking','surprised','sleepy','wink','joy'];
if(typeof window!=='undefined')window.nightcapSVG=nightcapSVG;
