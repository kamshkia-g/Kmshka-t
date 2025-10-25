
// KMK_APPLY_FILTER: central filter function
function kmk_applyFilterCat(cat){
  const q = (cat||'').toString().trim().toLowerCase();
  document.querySelectorAll('.kmk-grid .kmk-card').forEach(card=>{
    const cardCat = (card.dataset.category||'').toLowerCase();
    const txt = (card.textContent||'').toLowerCase();
    if(!q || q==='الكل' || q === ''){ card.style.display=''; return; }
    if(cardCat && cardCat.includes(q)){ card.style.display=''; return; }
    if(txt.includes(q)){ card.style.display=''; return; }
    card.style.display='none';
  });
}
// expose globally
window.kmk_applyFilterCat = kmk_applyFilterCat;


// KMK_DYNAMIC_FILTERS: build filter buttons from udemy_courses.json
(async function kmk_build_filters(){
  try{
    const res = await fetch('assets/data/udemy_courses.json');
    if(!res.ok) return;
    const data = await res.json();
    const cats = Array.from(new Set(data.map(d=> (d.category||'').trim() ).filter(Boolean))).sort();
    const wrap = document.querySelector('.kmk-filters');
    if(!wrap) return;
    // clear existing
    wrap.innerHTML = '';
    // add 'الكل'
    const allBtn = document.createElement('button');
    allBtn.className = 'kmk-filter-btn active';
    allBtn.dataset.cat = 'الكل';
    allBtn.textContent = 'الكل';
    wrap.appendChild(allBtn);
    cats.forEach(cat=>{
      const b = document.createElement('button');
      b.className = 'kmk-filter-btn';
      b.dataset.cat = cat;
      b.textContent = cat;
      wrap.appendChild(b);
    });
    // attach handlers (existing filter logic will pick up clicks)
    wrap.addEventListener('click', (e)=>{
      const btn = e.target.closest('.kmk-filter-btn');
      if(!btn) return;
      wrap.querySelectorAll('.kmk-filter-btn').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      // trigger existing filter code by dispatching click (or call apply logic if available)
      kmk_applyFilterCat(btn.dataset.cat || '');
    });
  }catch(e){ console.error(e); }
})(); // end dynamic filters


// Simple renderer for courses-udemy: fetch JSON and render into .kmk-grid
(async function(){
  const GRID = document.querySelector('.kmk-grid');
  if(!GRID) return;
  const DATA_URL = 'assets/data/udemy_courses.json';
  let data = [];
  try{ data = await fetch(DATA_URL).then(r=>r.json()); }catch(e){ console.error('failed load json', e); }
  if(!Array.isArray(data) || data.length===0) {
    GRID.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:rgba(0,0,0,0.6)">لا توجد دورات لعرضها</div>';
    return;
  }
  GRID.innerHTML = ''; // clear placeholders
  data.forEach(function(item){
    const el = document.createElement('article');
    el.className = 'kmk-card';
    el.innerHTML = `
      <div>
        <div class="title-en">${escapeHtml(item.title_en || '')}</div>
        <div class="title-ar">${escapeHtml(item.title_ar || '')}</div>
      </div>
      <div class="actions">
        <button class="kmk-btn share-btn" data-url="${escapeAttr(item.url)}">شارك الكورس</button>
        <button class="kmk-btn copy-btn" data-code="${escapeAttr(item.coupon||'')}">انسخ الكود</button>
        <a class="kmk-btn primary" href="${escapeAttr(item.url)}" target="_blank" rel="noopener">اذهب للكورس</a>
      </div>
    `;
    GRID.appendChild(el);
  });
  // attach handlers
  document.querySelectorAll('.share-btn').forEach(b=> b.addEventListener('click', ()=> {
    const url = b.dataset.url || location.href;
    if(navigator.share) navigator.share({url, title:'دورة'}).catch(()=>navigator.clipboard.writeText(url));
    else navigator.clipboard.writeText(url);
  }));
  document.querySelectorAll('.copy-btn').forEach(b=> b.addEventListener('click', ()=> {
    const code = b.dataset.code || '';
    navigator.clipboard.writeText(code).then(()=>{}).catch(()=>{});
  }));

  function escapeHtml(s){ return (''+s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function escapeAttr(s){ return (''+s).replace(/"/g,'&quot;'); }
})();

/* KMK search fix */

// Ensure search input filters visible cards
document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('kmk-search');
  if(!input) return;
  input.addEventListener('input', function(){
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll('.kmk-grid .kmk-card').forEach(card=>{
      const txt = (card.textContent||'').toLowerCase();
      card.style.display = q && !txt.includes(q) ? 'none' : '';
    });
  });
});


/* KMK filter fix */

/* KMK filter fix: delegate clicks and filter rendered cards */
document.addEventListener('DOMContentLoaded', function(){
  function applyFilterCat(cat){
    const cards = document.querySelectorAll('.kmk-grid .kmk-card');
    cards.forEach(card=>{
      const txt = (card.textContent||'').toLowerCase();
      if(!cat || cat==='الكل'){ card.style.display=''; return; }
      // check category text inside card (we expect a data-category or category in text)
      const catAttr = card.dataset.category || '';
      if(catAttr && catAttr.toLowerCase()===cat.toLowerCase()){ card.style.display=''; }
      else if(txt.includes(cat.toLowerCase())){ card.style.display=''; }
      else card.style.display='none';
    });
  }
  document.querySelectorAll('.kmk-filter-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      document.querySelectorAll('.kmk-filter-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      applyFilterCat(this.dataset.cat || this.textContent.trim());
    });
  });
});



// KMK_SEARCH_SAFE: ensure search input filters cards (safe rebind)
document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('kmk-search');
  if(!input) return;
  input.removeEventListener && input.removeEventListener('input', ()=>{});
  input.addEventListener('input', function(){
    const q = this.value.trim().toLowerCase();
    document.querySelectorAll('.kmk-grid .kmk-card').forEach(card=>{
      const txt = (card.textContent||'').toLowerCase();
      card.style.display = q && !txt.includes(q) ? 'none' : '';
    });
  });
});
