/*
 * 말랑한 3D 자동차 렌더러 (WebGL 레이마칭)
 * 둥근 박스들을 부드럽게 합친 SDF 모델 → 소프트 섀도·AO·광택으로 렌더 → PNG로 캐시
 * WebGL이 없으면 car.js의 아이소메트릭 SVG로 대체
 * 좌표: x = 길이(앞 +), y = 높이, z = 폭
 */

// body: [반길이, 반폭, 바닥높이, 벨트높이]
// cab:  [중심x, 아래 반길이, 위 반길이, 지붕높이]
// cab2: [지붕 앞뒤 이동, 아래 반폭, 캐빈 라운드, 차체 라운드]
// wheel:[반지름, 앞바퀴 x, 뒷바퀴 x, 타이어 반폭]
// extra:[루프랙, 적재함 x, 적재함 반길이, B필러 x] / p2: 두 번째 필러 x
const CAR3D_MODELS = {
  sedan:  { body: [1.72, .9, .3, .84],  cab: [-.12, .98, .6, 1.42],   cab2: [-.08, .8, .26, .34],  wheel: [.37, 1.08, -1.05, .2],  extra: [0, -99, 0, -.14], p2: -99 },
  hatch:  { body: [1.5, .9, .3, .86],   cab: [-.18, 1.12, .82, 1.5],  cab2: [-.1, .8, .26, .34],   wheel: [.37, .95, -.92, .2],   extra: [0, -99, 0, -.2],  p2: -99 },
  suv:    { body: [1.8, .95, .4, 1.0],  cab: [-.2, 1.4, 1.18, 1.78],  cab2: [-.08, .86, .26, .34], wheel: [.43, 1.12, -1.1, .22],  extra: [1, -99, 0, .08],  p2: -.78 },
  coupe:  { body: [1.75, .9, .28, .8],  cab: [-.2, .92, .48, 1.3],    cab2: [-.15, .78, .26, .32], wheel: [.36, 1.1, -1.08, .2],  extra: [0, -99, 0, 99],   p2: -99 },
  van:    { body: [1.8, .95, .36, .95], cab: [-.25, 1.52, 1.36, 1.85], cab2: [-.1, .86, .28, .34], wheel: [.39, 1.18, -1.15, .21], extra: [0, -99, 0, .28],  p2: -.68 },
  pickup: { body: [1.92, .95, .4, 1.0], cab: [.45, .62, .42, 1.72],   cab2: [-.05, .86, .26, .34], wheel: [.43, 1.22, -1.15, .22], extra: [0, -1.02, .74, 99], p2: -99 }
};

const carSVG = (function () {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uColor;
uniform vec4 uBody, uCab, uCab2, uWheel, uExtra, uExtra2;

float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float sdRB(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdCylZ(vec3 p,float r,float h,float rr){vec2 d=vec2(length(p.xy)-r+rr,abs(p.z)-h+rr);return min(max(d.x,d.y),0.)+length(max(d,0.))-rr;}
float sdEll(vec3 p,vec3 r){float k0=length(p/r);float k1=length(p/(r*r));return k0*(k0-1.)/k1;}

float fBody(vec3 p){return sdRB(p-vec3(0.,(uBody.z+uBody.w)*.5,0.),vec3(uBody.x,(uBody.w-uBody.z)*.5,uBody.y),uCab2.w);}
float fCab(vec3 p){
  float yb=uBody.w-.15; float hh=(uCab.w-yb)*.5;
  vec3 q=p-vec3(uCab.x,yb+hh,0.);
  float t=clamp(q.y/hh*.5+.5,0.,1.);
  q.x-=mix(0.,uCab2.x,t);
  return sdRB(q,vec3(mix(uCab.y,uCab.z,t),hh,mix(uCab2.y,uCab2.y*.84,t)),uCab2.z)*.75;
}
vec3 wheelC(int i){return vec3(i==0?uWheel.y:uWheel.z,uWheel.x,uBody.y-uWheel.w-.03);}

vec2 map(vec3 p){
  vec3 q=vec3(p.xy,abs(p.z));
  float b=fBody(p), c=fCab(p);
  float d=smin(b,c,.16);
  float m=c<b?1.:0.;
  for(int i=0;i<2;i++){vec3 w=wheelC(i);d=smax(d,-sdCylZ(q-vec3(w.x,w.y,uBody.y),uWheel.x+.08,.5,.06),.07);}
  if(uExtra.y>-50.){d=smax(d,-sdRB(p-vec3(uExtra.y,uBody.w+.12,0.),vec3(uExtra.z,.3,uBody.y-.15),.08),.05);}
  vec2 r=vec2(d,m);
  float hl=sdEll(q-vec3(uBody.x-.07,uBody.w-.2,uBody.y-.36),vec3(.09,.12,.15));
  if(hl<r.x) r=vec2(hl,3.);
  float tr=1e5;
  for(int i=0;i<2;i++){tr=min(tr,sdCylZ(q-wheelC(i),uWheel.x,uWheel.w,.1));}
  if(tr<r.x) r=vec2(tr,2.);
  if(uExtra.x>.5){float rl=sdRB(q-vec3(uCab.x+uCab2.x,uCab.w+.05,uCab2.y*.84-.2),vec3(uCab.z*.8,.04,.04),.035);if(rl<r.x) r=vec2(rl,4.);}
  return r;
}
vec2 march(vec3 ro,vec3 rd){
  float t=0.,m=-1.;
  for(int i=0;i<120;i++){vec2 h=map(ro+rd*t);if(h.x<.0006*t){m=h.y;break;}t+=h.x;if(t>24.)break;}
  return vec2(t,m);
}
vec3 nor(vec3 p){const vec2 e=vec2(.0007,-.0007);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
float shadow(vec3 ro,vec3 rd){float res=1.,t=.02;for(int i=0;i<40;i++){float h=map(ro+rd*t).x;res=min(res,9.*h/t);t+=clamp(h,.02,.25);if(res<.002||t>6.)break;}return clamp(res,0.,1.);}
float occl(vec3 p,vec3 n){float o=0.,s=1.;for(int i=0;i<5;i++){float h=.02+.09*float(i);float d=map(p+n*h).x;o+=(h-d)*s;s*=.75;}return clamp(1.-2.2*o,0.,1.);}

void main(){
  vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y;
  vec3 ta=vec3(0.,.8,0.);
  vec3 dir=normalize(vec3(1.,.78,1.3));
  vec3 ro=ta+dir*12.;
  vec3 ww=-dir, uu=normalize(cross(ww,vec3(0.,1.,0.))), vv=cross(uu,ww);
  vec3 rd=normalize(ww+(uv.x*uu+uv.y*vv)*.17);
  vec3 L=normalize(vec3(.45,1.,.6));
  vec2 h=march(ro,rd);
  float tg=rd.y<0.?-ro.y/rd.y:1e9;
  vec4 outc=vec4(0.);
  if(h.y>-.5&&h.x<tg){
    vec3 p=ro+rd*h.x, n=nor(p), q=vec3(p.xy,abs(p.z));
    float m=h.y;
    vec3 base=uColor; float gloss=1., emis=0.;
    if(m<1.5){
      float az=abs(n.z);
      bool win=p.y>uBody.w+.05&&p.y<uCab.w-.1&&abs(n.y)<.78;
      if(az>.3&&az<.86) win=false;
      if(az>.86&&(abs(p.x-uExtra.w)<.06||abs(p.x-uExtra2.x)<.06)) win=false;
      if(win){base=mix(vec3(.14,.24,.42),vec3(.5,.68,.94),clamp(n.y*.6+.5,0.,1.));gloss=1.8;}
      else if(n.x>.55){
        if(abs(p.z)<.27&&p.y>uBody.z+.12&&p.y<uBody.z+.26){base=vec3(.97);gloss=.4;}
        else if(abs(p.z)<uBody.y-.6&&abs(p.y-(uBody.w-.2))<.055){base=vec3(.14,.16,.2);gloss=.6;}
      }
    } else if(m<2.5){
      vec3 w=abs(p.x-uWheel.y)<abs(p.x-uWheel.z)?wheelC(0):wheelC(1);
      float rr=length(q.xy-w.xy);
      base=vec3(.15,.16,.2);gloss=.35;
      if(q.z>w.z+uWheel.w-.07&&rr<uWheel.x*.6){base=rr<uWheel.x*.2?vec3(.6,.63,.7):vec3(.9,.92,.95);gloss=1.3;}
    } else if(m<3.5){base=vec3(1.,.97,.86);emis=.6;gloss=1.6;}
    else {base=vec3(.24,.26,.32);}
    vec3 lin=pow(base,vec3(2.2));
    float occ=occl(p,n);
    float sh=shadow(p+n*.004,L);
    float dif=clamp(dot(n,L),0.,1.)*sh;
    vec3 hal=normalize(L-rd);
    float spe=pow(clamp(dot(n,hal),0.,1.),60.)*dif*gloss;
    float fre=pow(1.-clamp(dot(n,-rd),0.,1.),4.);
    vec3 sky=vec3(.9,.94,1.), gnd=vec3(.62,.58,.56);
    vec3 amb=mix(gnd,sky,clamp(n.y*.5+.5,0.,1.));
    vec3 c=lin*(amb*.66*occ+vec3(1.,.96,.9)*dif*.9)+lin*emis;
    // 클리어코트/유리 반사: 하늘 그라디언트 + 소프트박스 띠
    vec3 R=reflect(rd,n);
    vec3 env=mix(vec3(.55,.58,.66),vec3(1.,1.,1.04),smoothstep(-.25,.45,R.y));
    env+=vec3(1.)*exp(-pow((R.y-.5)*6.,2.))*.6;
    float kr=(.05+.6*fre)*min(gloss,1.6);
    c=mix(c,env*occ,clamp(kr,0.,.85));
    c+=spe*.55+pow(clamp(n.y,0.,1.),3.)*.05*occ;
    c=c/(1.+c*.12);
    outc=vec4(pow(c,vec3(1./2.2)),1.);
  } else if(tg<1e8){
    vec3 p=ro+rd*tg;
    float s=shadow(p+vec3(0.,.002,0.),L);
    float d=map(p).x;
    float a=(1.-s)*.2+clamp(.4-d,0.,.4)*.75;
    a=clamp(a*uExtra2.y,0.,.5);
    outc=vec4(0.,0.,0.,a);
  }
  gl_FragColor=outc;
}`;

  let gl = null, canvas = null, U = {}, state = 0; // 0 미초기화, 1 사용 가능, -1 불가
  const cache = new Map();

  function init() {
    try {
      canvas = document.createElement('canvas');
      gl = canvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false, alpha: true });
      if (!gl) throw new Error('no webgl');
      const sh = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uColor', 'uBody', 'uCab', 'uCab2', 'uWheel', 'uExtra', 'uExtra2'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
      state = 1;
    } catch (e) {
      console.warn('3D 렌더 불가, SVG로 대체:', e);
      state = -1;
    }
  }

  const rgb = hex => { const n = parseInt(String(hex).replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

  function render(type, color, w, h, withShadow) {
    const key = `${type}|${color}|${w}|${withShadow ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);
    if (state === 0) init();
    if (state !== 1) return null;
    const m = CAR3D_MODELS[type] || CAR3D_MODELS.sedan;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform3fv(U.uColor, rgb(color));
    gl.uniform4fv(U.uBody, m.body);
    gl.uniform4fv(U.uCab, m.cab);
    gl.uniform4fv(U.uCab2, m.cab2);
    gl.uniform4fv(U.uWheel, m.wheel);
    gl.uniform4fv(U.uExtra, m.extra);
    gl.uniform4fv(U.uExtra2, [m.p2, withShadow ? 1 : 0, 0, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const url = canvas.toDataURL('image/png');
    if (url.length < 200) return null; // 렌더 실패
    cache.set(key, url);
    return url;
  }

  return function carSVG(type, color, opts = {}) {
    const small = !!(opts.noShadow || opts.small);
    const url = render(type, color || '#2E6CF6', small ? 300 : 840, small ? 258 : 724, !opts.noShadow);
    if (!url) return carSVGIso(type, color, opts);
    return `<img class="car-svg car-3d" src="${url}" alt="" draggable="false">`;
  };
})();
