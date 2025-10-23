
// Navigation dropdown toggle (keyboard friendly)
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.nav-btn');
  document.querySelectorAll('.has-dropdown .dropdown').forEach(d=> d.style.display='none');
  document.querySelectorAll('.has-dropdown .nav-btn').forEach(b=> b.setAttribute('aria-expanded','false'));
  if(btn){
    const dd = btn.parentElement.querySelector('.dropdown');
    dd.style.display = 'flex';
    btn.setAttribute('aria-expanded','true');
    e.stopPropagation();
  }
});

// Count-up for stats
document.addEventListener('DOMContentLoaded', ()=>{
  const counters = document.querySelectorAll('.stat-value[data-value]');
  counters.forEach(el=>{
    const target = +el.dataset.value;
    let start = 0;
    const duration = 900;
    const t0 = performance.now();
    function step(t){
      const p = Math.min(1, (t - t0)/duration);
      const val = Math.floor(p*target);
      el.textContent = val;
      if(p<1) requestAnimationFrame(step); else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
});

// Tasbeeh counter
(function(){
  const phrases = ['سبحان الله','الحمد لله','لا إله إلا الله','الله اكبر','استغفر الله'];
  let phraseIndex = 0, count = 0;
  const bar = document.getElementById('counterBar');
  const fill = document.getElementById('counterFill');
  const txt = document.getElementById('counterText');
  const num = document.getElementById('counterNumber');
  if(!bar) return;
  function update(){
    txt.textContent = phrases[phraseIndex];
    num.textContent = count + ' / 100';
    fill.style.width = Math.min(100,count) + '%';
  }
  update();
  function complete(){
    bar.classList.add('counter-complete');
    setTimeout(()=> bar.classList.remove('counter-complete'), 600);
    setTimeout(()=>{
      phraseIndex = (phraseIndex + 1) % phrases.length;
      count = 0; update();
    }, 500);
  }
  function inc(){
    count = Math.min(100, count+1); update();
    if(count === 100) complete();
  }
  bar.addEventListener('click', inc);
  bar.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); inc(); } });
})();


/* KMK helper additions */

/* KMK helper: show current Gregorian and Hijri date in elements with .kmk-date and .kmk-hijri */
(function(){
  function pad(n){ return n<10? '0'+n: n; }
  function toHijri(d){
    // Simple approximate conversion for display (not authoritative) - using Umm al-Qura not possible offline
    // We'll use a rough algorithm (Arithmetical) for placeholder: not for legal use.
    var jd = Math.floor((d/86400000) - Math.floor((d.getTimezoneOffset()/60)/24) + 2440587.5); // not exact
    // fallback: show Islamic year/month/day from Intl if available
    try{
      var hij = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day:'numeric', month:'long', year:'numeric' }).format(d);
      return hij;
    }catch(e){
      return ''; 
    }
  }
  function updateDates(){
    var els = document.querySelectorAll('.kmk-date');
    var d = new Date();
    els.forEach(function(el){
      el.textContent = d.toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' }) + ' — ' + toHijri(d);
    });
  }
  window.addEventListener('load', updateDates);
  setInterval(updateDates, 60*60*1000);
})();
