/* ============================================
   NIDHI'S PLACE — app.js
============================================ */
'use strict';

/* ── STATE ──────────────────────────────── */
const S = {
  page:'hero', stars:0, total:5,
  found:{1:false,2:false,3:false,4:false,5:false},
  music:false, audioCtx:null, gainNode:null,
  envelope:false, letterDone:false, letterStarted:false,
  theme:'dark', rainDone:false, memesDone:false, endingCanvasDone:false,
};

/* ── BOOT ───────────────────────────────── */
window.addEventListener('load',()=>{
  spawnLoaderPetals();
  setTimeout(hideLoader, 2800);
});

function hideLoader(){
  const l=document.getElementById('loader');
  if(!l) return;
  l.classList.add('hide');
  setTimeout(()=>{ l.style.display='none'; init(); }, 850);
}

function init(){
  initHeroCanvas();
  initMouseGlow();
  initSparkle();
  initFloatingFlowers();
  initFireflies();
  initGoldCanvas();
  initGlobalRain();
  initGlobalPetals();
  document.getElementById('music-btn').addEventListener('click', toggleMusic);
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  // Keyboard support for cards
  document.querySelectorAll('.card').forEach(c=>{
    c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') c.click(); });
  });
}

/* ── PAGE NAVIGATION ────────────────────── */
function goTo(name){
  if(name===S.page) return;
  const prev=document.getElementById('pg-'+S.page);
  const next=document.getElementById('pg-'+name);
  if(!next) return;
  if(prev){
    prev.style.opacity='0';
    prev.style.transition='opacity .25s ease';
    setTimeout(()=>{ prev.classList.remove('active'); prev.style.opacity=''; prev.style.transition=''; activate(next,name); },250);
  } else { activate(next,name); }
}

function activate(el,name){
  el.classList.add('active');
  // Scroll the inner .pg-scroll back to top
  const sc=el.querySelector('.pg-scroll');
  if(sc) sc.scrollTop=0;
  S.page=name;
  // Per-page one-time inits
  if(name==='sad'&&!S.rainDone){ initRain(); S.rainDone=true; }
  if(name==='smile'&&!S.memesDone){ loadNewMemes(); S.memesDone=true; }
  if(name==='ending'&&!S.endingCanvasDone){ initEndingCanvas(); S.endingCanvasDone=true; }
  if(name==='choose') refreshChoose();
  if(name==='envelope') refreshEnvelope();
  // Entry sparkle
  if(name!=='hero'){
    confetti({particleCount:28,spread:55,origin:{y:.18},colors:['#c4a8ff','#ff8fab','#ffd700'],scalar:.65,gravity:.35});
  }
}

function refreshChoose(){
  const sc=document.getElementById('choose-star-count');
  if(sc) sc.textContent=`⭐ ${S.stars} / ${S.total} found`;
  const es=document.getElementById('choose-env-status');
  if(es) es.textContent=S.envelope
    ? '✅ Unlocked — go read the letter!'
    : `🔒 Locked — collect ${S.total} ⭐ first`;
}

function refreshEnvelope(){
  const pct=(S.stars/S.total)*100;
  const bar=document.getElementById('ep-prog');
  if(bar) bar.style.width=pct+'%';
  const need=document.getElementById('ep-need');
  if(need) need.textContent=Math.max(0,S.total-S.stars);
  const lock=document.getElementById('ep-lock-area');
  const open=document.getElementById('ep-unlock-area');
  const btn=document.querySelector('.ep-stars-btn');
  if(S.envelope){
    if(lock) lock.style.display='none';
    if(open) open.style.display='flex';
    if(btn)  btn.style.display='none';
  }
}

/* ── GLOBAL RAIN (behind every page) ──────── */
function initGlobalRain(){
  const c=document.getElementById('global-rain');
  if(!c) return;
  for(let i=0;i<55;i++){
    const d=document.createElement('div');
    d.className='g-raindrop';
    d.style.cssText=`left:${Math.random()*100}%;height:${18+Math.random()*60}px;animation-duration:${.6+Math.random()*1.2}s;animation-delay:${Math.random()*6}s;opacity:${.15+Math.random()*.35};`;
    c.appendChild(d);
  }
}

/* ── GLOBAL PETALS (behind every page) ─────── */
function initGlobalPetals(){
  const c=document.getElementById('global-petals');
  if(!c) return;
  const emojis=['🌸','🌺','✿','🌷','💮','🌼'];
  for(let i=0;i<22;i++){
    const el=document.createElement('div');
    el.className='petal';
    el.textContent=emojis[i%emojis.length];
    el.style.cssText=`left:${Math.random()*105}%;font-size:${10+Math.random()*12}px;animation-duration:${12+Math.random()*14}s;animation-delay:${Math.random()*14}s;`;
    c.appendChild(el);
  }
}

/* ── LOADER PETALS ────────────────────────── */
function spawnLoaderPetals(){
  const w=document.getElementById('loaderPetals');
  if(!w) return;
  const e=['🌸','🌺','✿','💮','🌷','🌼'];
  for(let i=0;i<14;i++){
    const el=document.createElement('span');
    el.className='floating-flower';
    el.textContent=e[i%e.length];
    el.style.cssText=`left:${Math.random()*100}%;font-size:${12+Math.random()*14}px;animation-duration:${10+Math.random()*12}s;animation-delay:${Math.random()*8}s;opacity:.35;`;
    w.appendChild(el);
  }
}

/* ── HERO STARFIELD ─────────────────────── */
function initHeroCanvas(){
  const c=document.getElementById('hero-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  const resize=()=>{ c.width=c.offsetWidth||innerWidth; c.height=c.offsetHeight||innerHeight; };
  resize(); window.addEventListener('resize',resize);
  const CLR=['#ffffff','#c4a8ff','#ffd700','#ff8fab'];
  const stars=Array.from({length:160},()=>({
    x:Math.random(),y:Math.random(),r:Math.random()*1.8+.4,
    phase:Math.random()*Math.PI*2,speed:Math.random()*.018+.004,
    base:Math.random()*.6+.2,color:CLR[Math.floor(Math.random()*4)],
  }));
  let t=0;
  (function draw(){
    ctx.clearRect(0,0,c.width,c.height); t++;
    for(const s of stars){
      const a=((Math.sin(t*s.speed+s.phase)+1)/2)*.75+.1;
      ctx.save(); ctx.globalAlpha=a*s.base;
      ctx.beginPath(); ctx.arc(s.x*c.width,s.y*c.height,s.r,0,Math.PI*2);
      ctx.fillStyle=s.color; ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(draw);
  })();
}

/* ── ENDING CANVAS ──────────────────────── */
function initEndingCanvas(){
  const c=document.getElementById('ending-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  const resize=()=>{ c.width=innerWidth; c.height=innerHeight; };
  resize(); window.addEventListener('resize',resize);
  const stars=Array.from({length:120},()=>({
    x:Math.random(),y:Math.random(),r:Math.random()*1.4+.3,
    phase:Math.random()*Math.PI*2,speed:Math.random()*.012+.003,
    base:Math.random()*.5+.15,
  }));
  let t=0;
  (function draw(){
    ctx.clearRect(0,0,c.width,c.height); t++;
    for(const s of stars){
      const a=((Math.sin(t*s.speed+s.phase)+1)/2)*.65+.1;
      ctx.save(); ctx.globalAlpha=a*s.base;
      ctx.beginPath(); ctx.arc(s.x*c.width,s.y*c.height,s.r,0,Math.PI*2);
      ctx.fillStyle=Math.random()<.6?'#fff':'#c4a8ff'; ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(draw);
  })();
}

/* ── RAIN ───────────────────────────────── */
function initRain(){
  const c=document.getElementById('rain-sad');
  if(!c) return;
  c.innerHTML='';
  for(let i=0;i<40;i++){
    const d=document.createElement('div');
    d.className='raindrop';
    d.style.cssText=`left:${Math.random()*100}%;height:${20+Math.random()*65}px;animation-duration:${.65+Math.random()*1.3}s;animation-delay:${Math.random()*5}s;opacity:${.18+Math.random()*.45};`;
    c.appendChild(d);
  }
}

/* ── MOUSE GLOW ─────────────────────────── */
function initMouseGlow(){
  const g=document.getElementById('mouseGlow');
  if(!g) return;
  document.addEventListener('mousemove',e=>{ g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px'; });
}

/* ── SPARKLE CURSOR ─────────────────────── */
function initSparkle(){
  const sp=['✦','✧','⋆','·','˚','*','✨'];
  let last=0;
  document.addEventListener('mousemove',e=>{
    const now=Date.now();
    if(now-last<80||Math.random()>.42) return;
    last=now;
    const el=document.createElement('div');
    el.className='sparkle-cursor';
    el.textContent=sp[Math.floor(Math.random()*sp.length)];
    el.style.cssText=`left:${e.clientX+(Math.random()-.5)*18}px;top:${e.clientY+(Math.random()-.5)*18}px;color:${['#ffd700','#c4a8ff','#ff8fab','#fff'][Math.floor(Math.random()*4)]};`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),750);
  });
}

/* ── FLOATING FLOWERS ───────────────────── */
function initFloatingFlowers(){
  const e=['🌸','🌺','✿','💮','🌷','🌼','🍃','🌿'];
  for(let i=0;i<10;i++){
    const el=document.createElement('span');
    el.className='floating-flower';
    el.textContent=e[i%e.length];
    el.style.cssText=`left:${Math.random()*100}%;font-size:${11+Math.random()*15}px;animation-duration:${12+Math.random()*14}s;animation-delay:${Math.random()*12}s;opacity:.36;`;
    document.body.appendChild(el);
  }
}

/* ── FIREFLIES ──────────────────────────── */
function initFireflies(){
  for(let i=0;i<14;i++){
    const el=document.createElement('div');
    el.className='firefly';
    const dx=(Math.random()-.5)*200,dy=(Math.random()-.5)*200;
    const dx2=(Math.random()-.5)*160,dy2=(Math.random()-.5)*160;
    el.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${6+Math.random()*9}s;animation-delay:${Math.random()*9}s;--fx:${dx}px;--fy:${dy}px;--fx2:${dx2}px;--fy2:${dy2}px;`;
    document.body.appendChild(el);
  }
}

/* ── ENTER SITE ─────────────────────────── */
function enterSite(){
  startMusic();
  goTo('choose');
  confetti({particleCount:100,spread:110,origin:{y:.55},colors:['#ff8fab','#c4a8ff','#ffd700','#7ec8e3'],scalar:.88});
}

/* ── AMBIENT MUSIC ──────────────────────── */
function startMusic(){
  if(S.audioCtx) return;
  try{
    S.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    S.gainNode=S.audioCtx.createGain();
    S.gainNode.gain.setValueAtTime(0,S.audioCtx.currentTime);
    S.gainNode.gain.linearRampToValueAtTime(.07,S.audioCtx.currentTime+4);
    S.gainNode.connect(S.audioCtx.destination);
    const rev=S.audioCtx.createConvolver();
    const len=S.audioCtx.sampleRate*2.5,buf=S.audioCtx.createBuffer(2,len,S.audioCtx.sampleRate);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);}
    rev.buffer=buf; rev.connect(S.gainNode);
    [261.63,311.13,369.99,440,523.25,622.25,739.99].forEach((freq,i)=>{
      const osc=S.audioCtx.createOscillator(),g=S.audioCtx.createGain(),f=S.audioCtx.createBiquadFilter();
      const lfo=S.audioCtx.createOscillator(),lg=S.audioCtx.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(freq,S.audioCtx.currentTime);
      f.type='lowpass';f.frequency.setValueAtTime(700,S.audioCtx.currentTime);
      g.gain.setValueAtTime(.12/7,S.audioCtx.currentTime);
      lfo.frequency.setValueAtTime(.2+i*.08,S.audioCtx.currentTime);
      lg.gain.setValueAtTime(1.5,S.audioCtx.currentTime);
      lfo.connect(lg);lg.connect(osc.frequency);osc.connect(f);f.connect(g);g.connect(rev);
      lfo.start();osc.start();
    });
    S.music=true;
    document.getElementById('music-btn').textContent='🔊';
    const ms=document.getElementById('music-status');if(ms)ms.textContent='Now Playing ♪';
  }catch(e){console.warn('Audio unavailable:',e);}
}

function toggleMusic(){
  if(!S.audioCtx){startMusic();return;}
  if(S.music){S.audioCtx.suspend();S.music=false;document.getElementById('music-btn').textContent='🎵';const ms=document.getElementById('music-status');if(ms)ms.textContent='Paused';}
  else{S.audioCtx.resume();S.music=true;document.getElementById('music-btn').textContent='🔊';const ms=document.getElementById('music-status');if(ms)ms.textContent='Now Playing ♪';}
}

/* ── THEME ──────────────────────────────── */
function toggleTheme(){
  S.theme=S.theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',S.theme);
  document.getElementById('theme-btn').textContent=S.theme==='dark'?'🌙':'☀️';
}

/* ── DEEP BREATH ────────────────────────── */
function deepBreath(btn){
  const steps=[['💙 Breathe in…',3500],['💙 Hold…',2500],['💙 Breathe out…',3500],['💙 You did great ❤️',3000]];
  let d=0;
  steps.forEach(([txt,dur],i)=>{
    setTimeout(()=>{ btn.textContent=txt; if(i===steps.length-1) setTimeout(()=>btn.textContent='Take A Deep Breath ❤️',dur); },d);
    d+=dur;
  });
  confetti({particleCount:35,spread:65,origin:{y:.6},colors:['#c4a8ff','#7ec8e3'],scalar:.55});
  sfx([440,528,396],.12,.6);
}

/* ── HUG ────────────────────────────────── */
function sendHug(){
  const o=document.getElementById('hug-overlay');
  o.classList.add('on');
  setTimeout(()=>o.classList.remove('on'),1500);
  confetti({particleCount:120,spread:140,origin:{y:.5},colors:['#ff8fab','#ffb3c6','#ffd700','#c4a8ff'],shapes:['circle'],scalar:1.1});
  sfx([523.25,659.25,783.99],.18,.5);
}

/* ── AFFIRMATIONS ───────────────────────── */
const AFF={
  'Kind'         :["Your kindness is a rare gift. You give so naturally, so genuinely.",
                   "The way you care for others without expecting anything in return is one of the most beautiful things about you."],
  'Strong'       :["You have survived every single difficult day you've ever faced. 100% success rate.",
                   "Strength isn't about never falling. It's about getting up every time. You do that, more than you know."],
  'Funny'        :["Your sense of humor is a genuine superpower. The way you make people laugh is a gift.",
                   "There's a magic in someone who can make others smile even on hard days. That's you. 😄"],
  'Thoughtful'   :["The fact that you care about how others feel puts you in a truly special category.",
                   "You notice things others miss. You remember details that matter. That's one of your best traits."],
  'Supportive'   :["You show up for people. You listen. You stay. That presence is worth more than you know.",
                   "Not everyone knows how to be there for others. You do — and people feel safer because of you."],
  'Beautiful Soul':["There's something warm and pure about who you are inside. The world is better because you're in it.",
                    "A beautiful soul isn't about perfection — it's about authenticity, warmth, and love. You have all three. ✨"],
};

function showAff(trait,btn){
  document.querySelectorAll('.aff-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const msgs=AFF[trait];
  const el=document.getElementById('aff-msg');
  if(!el) return;
  el.textContent='✨  '+msgs[Math.floor(Math.random()*msgs.length)];
  el.className='aff-msg show';
  confetti({particleCount:50,spread:80,origin:{y:.5},colors:['#ffd700','#fff176','#ffee58'],scalar:.75});
  sfx([880,1046.5],.15,.4);
}

/* ── MEMES ──────────────────────────────── */
const CAPS=[
  "This kitten has been waiting all day just to make you smile. 🐱",
  "You officially smiled. Congratulations! 😊",
  "Doctor Fluffy recommends one more dose of cuteness.",
  "This tiny cat believes in you. Fully. 🐾",
  "When your friend sends a voice note instead of typing 😅",
  "Life is better when you don't take it too seriously 🐶",
  "This fluffy thing thinks you're doing amazing! 💛",
  "Just a reminder: you're allowed to have a good day today 🌟",
  "100% certified wholesome content, just for you 💖",
  "Sending you virtual pets and the best vibes 🐾",
  "Objective fact: you deserve all the happy things 🌈",
];
const DOG_FB=['https://images.dog.ceo/breeds/retriever-golden/n02099601_1023.jpg',
              'https://images.dog.ceo/breeds/pomeranian/n02112018_10096.jpg'];
let dIdx=0;

async function fetchDog(){
  try{const r=await fetch('https://dog.ceo/api/breeds/image/random');const d=await r.json();return d.message;}
  catch{return DOG_FB[dIdx++%2];}
}

async function loadNewMemes(){
  const g=document.getElementById('meme-grid');
  if(!g) return;
  g.innerHTML=`<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:50px 0;font-size:.9rem">Loading cuteness… 🐱</div>`;
  const dog=await fetchDog();
  const ts=Date.now();
  const srcs=[`https://cataas.com/cat?width=300&height=225&t=${ts}`,dog,`https://cataas.com/cat?width=300&height=225&t=${ts+77}`];
  g.innerHTML='';
  srcs.forEach((src,i)=>{
    const item=document.createElement('div'); item.className='meme-item';
    item.style.cssText='opacity:0;transform:translateY(16px)';
    const box=document.createElement('div'); box.className='meme-img-box';
    const img=document.createElement('img'); img.alt='Cute animal'; img.loading='lazy'; img.src=src;
    img.onerror=()=>{ const ph=document.createElement('div');ph.className='meme-ph';ph.textContent=['🐱','🐶','🐼','🐰','🦆'][Math.floor(Math.random()*5)];box.innerHTML='';box.appendChild(ph); };
    const cap=document.createElement('div'); cap.className='meme-cap'; cap.textContent=CAPS[Math.floor(Math.random()*CAPS.length)];
    box.appendChild(img); item.appendChild(box); item.appendChild(cap); g.appendChild(item);
    setTimeout(()=>{item.style.transition='opacity .5s ease,transform .5s ease';item.style.opacity='1';item.style.transform='translateY(0)';},i*150);
  });
  confetti({particleCount:22,spread:50,origin:{y:.7},colors:['#ff8fab','#ffd700','#c4a8ff'],scalar:.65});
}

/* ── HIDDEN STARS ───────────────────────── */
function collectStar(num){
  if(S.found[num]) return;
  S.found[num]=true; S.stars++;
  const starEl=document.getElementById('star-'+num);
  const counter=document.getElementById('star-counter');
  if(starEl&&counter){
    const sr=starEl.getBoundingClientRect(),cr=counter.getBoundingClientRect();
    const fly=document.createElement('div');
    fly.textContent='⭐';
    fly.style.cssText=`position:fixed;left:${sr.left+sr.width/2}px;top:${sr.top+sr.height/2}px;font-size:20px;z-index:9999;pointer-events:none;transition:all .85s cubic-bezier(.25,.46,.45,.94);transform:translate(-50%,-50%);`;
    document.body.appendChild(fly);
    requestAnimationFrame(()=>{
      fly.style.left=`${cr.left+cr.width/2}px`;
      fly.style.top=`${cr.top+cr.height/2}px`;
      fly.style.transform='translate(-50%,-50%) scale(.25)';
      fly.style.opacity='0';
    });
    setTimeout(()=>fly.remove(),900);
    starEl.classList.add('taken');
  }
  updateCounter();
  updateJar();
  updateTracker(num);
  sfx([880,1320,1760],.25,.4);
  toast(`⭐ Star ${num}/5 found! ${S.stars<S.total?(S.total-S.stars)+' more to go!':'All 5 found! 🎉'}`,3200);
  if(S.stars>=S.total) setTimeout(showGoldenKey,1400);
}

function updateCounter(){
  const el=document.getElementById('star-counter');
  if(el){el.textContent=`⭐ ${S.stars} / ${S.total}`;el.classList.add('pop');setTimeout(()=>el.classList.remove('pop'),450);}
  const jc=document.getElementById('jar-count');if(jc)jc.textContent=`⭐ ${S.stars} / ${S.total} Stars Found`;
}

function updateJar(){
  for(let i=1;i<=5;i++){
    const j=document.getElementById('js'+i);
    if(!j) continue;
    if(i<=S.stars){j.style.opacity='1';j.style.filter='drop-shadow(0 0 5px rgba(255,215,0,.9))';}
    else{j.style.opacity='.08';j.style.filter='none';}
  }
  const gl=document.getElementById('jar-glow');
  if(gl) gl.setAttribute('fill',`rgba(255,215,0,${.03+S.stars/S.total*.22})`);
}

function updateTracker(num){
  const row=document.getElementById('tr'+num);
  const dot=document.getElementById('dot-'+num);
  const st =document.getElementById('st-'+num);
  if(row) row.classList.add('found');
  if(dot) dot.textContent='✅';
  if(st)  st.textContent='Found! ⭐';
}

function giveHint(){
  const hints=[
    '🏠 Check the Landing/Hero page — something glimmers near the middle!',
    '💙 Visit "When You\'re Sad" — look near the upper right corner.',
    '🤍 Go to "When You Need Support" — star is on the right side.',
    '⭐ On "When You Doubt Yourself" — check the lower left!',
    '😊 Visit "When You Want To Smile" — top right corner! ✨',
  ];
  const idx=Math.min(S.stars,4);
  toast(S.stars>=S.total?'✨ All 5 stars found! Open the envelope!': `Hint: ${hints[idx]}`,5500);
}

/* ── GOLDEN KEY ─────────────────────────── */
let gP=[];
function initGoldCanvas(){
  const c=document.getElementById('gold-canvas');if(!c)return;
  const ctx=c.getContext('2d');
  const resize=()=>{c.width=innerWidth;c.height=innerHeight;};resize();
  window.addEventListener('resize',resize);
  (function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    if(document.getElementById('golden-overlay').classList.contains('on')){
      if(Math.random()>.4)gP.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*1.3,vy:(Math.random()-.5)*1.3-.5,r:Math.random()*3+1,a:.9,d:.008+Math.random()*.012});
      for(let i=gP.length-1;i>=0;i--){const p=gP[i];p.x+=p.vx;p.y+=p.vy;p.a-=p.d;if(p.a<=0){gP.splice(i,1);continue;}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,215,0,${p.a})`;ctx.fill();}
    }
    requestAnimationFrame(loop);
  })();
}

function showGoldenKey(){
  document.getElementById('golden-overlay').classList.add('on');
  playMagic();
  confetti({particleCount:220,spread:200,origin:{y:.5},colors:['#ffd700','#ffe066','#ffcc00','#ff8fab'],scalar:1.4});
}

function unlockEnvelope(){
  if(S.stars<S.total){toast(`⭐ Find ${S.total-S.stars} more star(s) first!`,3000);return;}
  const o=document.getElementById('golden-overlay');
  o.style.opacity='0';setTimeout(()=>{o.classList.remove('on');o.style.opacity='';},750);
  S.envelope=true;
  confetti({particleCount:160,spread:130,origin:{y:.6},colors:['#ffd700','#ff8fab','#c4a8ff'],scalar:1.1});
  playMagic();
  toast('💌 Envelope unlocked! Visit the Digital Envelope page!',4000);
  setTimeout(()=>goTo('envelope'),1200);
}

/* ── ENVELOPE ───────────────────────────── */
function openEnvelope(){
  if(!S.envelope){
    const w=document.getElementById('ep-img-wrap');
    if(w){w.style.animation='shake .5s ease';setTimeout(()=>w.style.animation='',550);}
    toast(`🔒 Collect ${S.total-S.stars} more star(s) first!`,3200);return;
  }
  goTo('letter');
  setTimeout(readLetter,500);
}

/* ── LETTER ─────────────────────────────── */
const LETTER=`Hey Nidhi,

Before you leave, there's one last thing I wanted to say.

I know our bond hasn't felt the same lately, and we even had that little fight. Looking back, I know I was the one who made the mistake. I'm really glad we talked it out, so let's leave that behind.

What I don't want to leave unsaid is this:

You're genuinely someone very special to me.

You probably don't even realize it, but I often find myself waiting for your messages. Seeing your name pop up on my screen always makes my day a little better.

I know I'm probably not your first priority, and honestly, that's okay. I'm not expecting to be. I just wanted you to know that you've become an important person in my life.

If there's ever something on your mind, or if you just feel like talking about your day, laughing about something random, or sharing even the smallest things... I'd love to hear them. Not because I expect you to, but because talking to you genuinely makes me happy.

I don't want anything in return. I just hope you always know that you'll never be a bother to me.

Thank you for being you.

And thank you for taking the time to be part of my life, even in the little moments.

Take care of yourself. Always. 🤍`;

function readLetter(){
  if(!S.envelope){toast('🔒 Unlock the envelope first!',3000);return;}
  if(S.letterStarted) return;
  S.letterStarted=true;
  const lock=document.getElementById('letter-locked');
  const textEl=document.getElementById('letter-text');
  const inner=document.querySelector('.lc-card-inner');
  if(lock) lock.style.display='none';
  if(textEl) textEl.style.display='block';
  const cursor=document.createElement('span'); cursor.className='lc-cursor';
  textEl.appendChild(cursor);
  let i=0;
  const iv=setInterval(()=>{
    if(i>=LETTER.length){
      clearInterval(iv); S.letterDone=true;
      if(cursor.parentNode) cursor.remove();
      const end=document.getElementById('letter-end'); if(end)end.style.display='flex';
      confetti({particleCount:140,spread:110,origin:{y:.6},colors:['#ff8fab','#c4a8ff','#ffd700','#ffb3c6'],scalar:1.05});
      sfx([523.25,659.25,783.99,1046.5],.16,.6);
      return;
    }
    const ch=LETTER[i++];
    if(ch==='\n'){
      if(LETTER[i]==='\n'){textEl.insertBefore(document.createElement('br'),cursor);textEl.insertBefore(document.createElement('br'),cursor);i++;}
      else textEl.insertBefore(document.createElement('br'),cursor);
    } else textEl.insertBefore(document.createTextNode(ch),cursor);
    // scroll the inner pg-scroll to show text
    const sc=document.querySelector('#pg-letter .pg-scroll');
    if(sc) sc.scrollTop=sc.scrollHeight;
  },26);
}

/* ── TOAST ──────────────────────────────── */
let toastTimer=null;
function toast(msg,dur=3200){
  let t=document.getElementById('_toast');
  if(!t){
    t=document.createElement('div'); t.id='_toast';
    t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);background:rgba(20,10,40,.95);border:1px solid rgba(196,168,255,.28);backdrop-filter:blur(20px);color:#f0e6ff;padding:13px 28px;border-radius:50px;font-size:.87rem;font-family:Nunito,sans-serif;font-weight:600;z-index:9001;transition:transform .4s ease,opacity .4s ease;opacity:0;max-width:92vw;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.4);';
    document.body.appendChild(t);
  }
  clearTimeout(toastTimer);
  t.textContent=msg;
  requestAnimationFrame(()=>{t.style.transform='translateX(-50%) translateY(0)';t.style.opacity='1';});
  toastTimer=setTimeout(()=>{t.style.transform='translateX(-50%) translateY(80px)';t.style.opacity='0';},dur);
}

/* ── SFX ────────────────────────────────── */
function sfx(freqs,vol=.18,dur=.4){
  let c=S.audioCtx;
  if(!c){try{c=new(window.AudioContext||window.webkitAudioContext)();}catch{return;}}
  freqs.forEach((f,i)=>{
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);
    o.frequency.setValueAtTime(f,c.currentTime+i*.1);
    g.gain.setValueAtTime(vol,c.currentTime+i*.1);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.1+dur);
    o.start(c.currentTime+i*.1);o.stop(c.currentTime+i*.1+dur+.05);
  });
}
function playMagic(){sfx([261.63,329.63,392,523.25,659.25,783.99,1046.5,1318.51],.14,.55);}

/* ── EXPORTS ────────────────────────────── */
window.goTo          = goTo;
window.enterSite     = enterSite;
window.deepBreath    = deepBreath;
window.sendHug       = sendHug;
window.showAff       = showAff;
window.loadNewMemes  = loadNewMemes;
window.collectStar   = collectStar;
window.giveHint      = giveHint;
window.unlockEnvelope= unlockEnvelope;
window.openEnvelope  = openEnvelope;
window.readLetter    = readLetter;
window.toggleMusic   = toggleMusic;
window.toggleTheme   = toggleTheme;
