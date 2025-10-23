// kamishka courses page script
(async function(){
  const DATA_URL = 'assets/data/udemy_courses.json';
  const PAGE_LINK = 'courses-udemy.html';
  const PER_PAGE = 9;

  let data = await fetch(DATA_URL).then(r=>r.json()).catch(()=>[]);
  let filtered = data.slice();
  let current = 0;

  const grid = document.querySelector('.kmk-grid');
  const searchInput = document.querySelector('#kmk-search');
  const filtersWrap = document.querySelector('.kmk-filters');
  const loadMoreBtn = document.querySelector('#kmk-loadmore');
  const noMore = document.querySelector('#kmk-no-more');

  // build filter buttons from categories
  const cats = Array.from(new Set(data.map(d=>d.category)));
  cats.unshift('الكل');
  cats.forEach(cat=>{
    const btn = document.createElement('button');
    btn.className = 'kmk-filter-btn' + (cat==='الكل' ? ' active' : '');
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.kmk-filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
    filtersWrap.appendChild(btn);
  });

  function renderItems(reset=false){
    if(reset){ grid.innerHTML=''; current=0; }
    const slice = filtered.slice(current, current+PER_PAGE);
    slice.forEach(item=>{
      const el = document.createElement('article');
      el.className = 'kmk-card';
      el.innerHTML = `
        <div>
          <h3 class="title-en">${escapeHtml(item.title_en)}</h3>
          <div class="title-ar">${escapeHtml(item.title_ar)}</div>
        </div>
        <div class="actions">
          <button class="kmk-btn kmk-small share-btn" data-url="${item.url}">شارك الكورس</button>
          <button class="kmk-btn kmk-small copy-btn" data-code="${item.coupon}">انسخ الكود</button>
          <a class="kmk-btn primary" href="${item.url}" target="_blank" rel="noopener">اذهب للكورس</a>
        </div>
      `;
      grid.appendChild(el);
    });
    current += slice.length;
    if(current >= filtered.length){ loadMoreBtn.style.display='none'; noMore.style.display='block'; } else { loadMoreBtn.style.display='inline-flex'; noMore.style.display='none'; }
    attachCardHandlers();
  }

  function applyFilters(){
    const q = (searchInput.value||'').trim().toLowerCase();
    const active = document.querySelector('.kmk-filter-btn.active').dataset.cat;
    filtered = data.filter(d=>{
      const matchQ = !q || d.title_en.toLowerCase().includes(q) || d.title_ar.toLowerCase().includes(q);
      const matchCat = (active==='الكل') || (d.category===active);
      return matchQ && matchCat;
    });
    renderItems(true);
  }

  function attachCardHandlers(){
    document.querySelectorAll('.share-btn').forEach(b=>{
      if(b.dataset.bound) return;
      b.dataset.bound = '1';
      b.addEventListener('click', async ()=>{
        const url = b.dataset.url || PAGE_LINK;
        if(navigator.share){
          try{ await navigator.share({ title: 'دورة من كمشكاة', url }); }catch(e){ copyText(url); showToast('تم نسخ الرابط'); }
        } else {
          copyText(url); showToast('تم نسخ الرابط');
        }
      });
    });
    document.querySelectorAll('.copy-btn').forEach(b=>{
      if(b.dataset.bound) return;
      b.dataset.bound = '1';
      b.addEventListener('click', ()=>{
        const code = b.dataset.code || '';
        copyText(code);
        showToast('تم نسخ الكود');
      });
    });
  }

  function copyText(t){
    try{ navigator.clipboard.writeText(t); }catch(e){ const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  }

  function escapeHtml(s){ return (''+s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  function showToast(msg){
    let t = document.querySelector('.kmk-toast');
    if(!t){ t = document.createElement('div'); t.className='kmk-toast'; t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px'; t.style.padding='10px 14px'; t.style.background='rgba(0,0,0,0.7)'; t.style.color='#fff'; t.style.borderRadius='8px'; t.style.zIndex=999999; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity='1';
    setTimeout(()=>{ t.style.opacity='0'; },1500);
  }

  // search input handler (debounced)
  let dt;
  searchInput.addEventListener('input', ()=>{ clearTimeout(dt); dt=setTimeout(()=>applyFilters(),250); });

  loadMoreBtn.addEventListener('click', ()=>{ renderItems(); });

  // initial render
  renderItems(true);

})(); // end script