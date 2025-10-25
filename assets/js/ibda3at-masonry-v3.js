// KMK_MANIFEST_ONLY

(async function(){
  const container = document.getElementById('kmk-masonry');
  const loadBtn = document.getElementById('kmk-masonry-loadmore');
  const filterBtns = document.querySelectorAll('[data-cat], #kmk-filter-all');
  const perPage = 60;
  let shown = 0;
  let items = [];

  // try manifest
  try{
    const res = await fetch('assets/data/ibda3at.json');
    if(res.ok){ items = await res.json(); }
  }catch(e){}

  // if no manifest, probe numeric filenames up to 1000
  if(!items || items.length===0){
    const folder = 'assets/images/ibda3at/';
    const exts = ['jpg','jpeg','png','webp'];
    for(let i=1;i<=1000;i++){
      for(const ext of exts){
        const url = folder + i + '.' + ext;
        try{
          await new Promise((resolve)=>{
            const img = new Image();
            img.onload = ()=>{ items.push({image:url, title:'', category:''}); resolve(true); };
            img.onerror = ()=> resolve(false);
            img.src = url + '?v=1';
          });
        }catch(e){}
      }
    }
  }
  
// KMK_FORCE_PLACEHOLDERS: ensure 400 slots available even if no images exist
if(!items.length){
  const folder = 'assets/images/ibda3at/';
  // prepare 400 slots that will attempt to load numbered images; browser will fallback if missing
  for(let i=1;i<=400;i++){
    const padded = String(i);
    items.push({image: folder + padded + '.jpg', title:'', category:''});
  }
}
if(!items.length){
    items = [{image:'assets/images/ibda3at/placeholder1.jpg', title:'', category:''}];
  }

  // favorites from localStorage
  let favs = JSON.parse(localStorage.getItem('kmk_favs')||'[]');

  function createItem(it, idx){
    const div = document.createElement('div');
    div.className = 'kmk-masonry-item';
    div.dataset.category = it.category || '';
    div.innerHTML = `<img src="${it.image}" alt="${(it.title||'تصميم')}" loading="lazy"><div class="controls"><button class="kmk-dot-btn" aria-label="خيارات">⋮</button></div>
      <div class="kmk-menu" role="menu">
        <button class="menu-share">شارك</button>
        <button class="menu-download">تحميل</button>
        <button class="menu-fav">${favs.includes(it.image)?'إزالة من المفضلة':'أضف للمفضلة'}</button>
      </div>
      <div class="meta"><div class="title">${it.title||''}</div></div>
      <button class="kmk-fav" title="إضافة للمفضلة">${favs.includes(it.image)?'♥':'♡'}</button>
    `;
    // handlers
    const dot = div.querySelector('.kmk-dot-btn');
    const menu = div.querySelector('.kmk-menu');
    dot.addEventListener('click', (e)=>{ e.stopPropagation(); menu.style.display = menu.style.display==='block'?'none':'block'; });
    // hide menu on doc click
    document.addEventListener('click', ()=> menu.style.display='none');

    div.querySelector('.menu-share').addEventListener('click', ()=> {
      const url = window.location.origin + '/' + it.image;
      if(navigator.share) navigator.share({title:it.title||'تصميم', url}).catch(()=>navigator.clipboard.writeText(url));
      else navigator.clipboard.writeText(url);
    });
    div.querySelector('.menu-download').addEventListener('click', ()=> {
      const a = document.createElement('a'); a.href = it.image; a.download = it.image.split('/').pop(); document.body.appendChild(a); a.click(); a.remove();
    });
    const menuFav = div.querySelector('.menu-fav');
    const heart = div.querySelector('.kmk-fav');
    function toggleFav(){
      if(favs.includes(it.image)){ favs = favs.filter(x=>x!==it.image); menuFav.textContent='أضف للمفضلة'; heart.textContent='♡'; }
      else { favs.push(it.image); menuFav.textContent='إزالة من المفضلة'; heart.textContent='♥'; }
      localStorage.setItem('kmk_favs', JSON.stringify(favs));
    }
    menuFav.addEventListener('click', toggleFav);
    heart.addEventListener('click', toggleFav);

    return div;
  }

  function renderSlice(){
    const slice = items.slice(shown, shown+perPage);
    slice.forEach((it, i)=>{
      const el = createItem(it, shown + i);
      container.appendChild(el);
    });
    shown += slice.length;
    if(shown>=items.length) loadBtn.style.display='none';
  }

  // filtering by category
  function applyFilter(cat){
    // clear container and reset shown
    container.innerHTML = '';
    shown = 0;
    // if cat is 'الكل' show all items, else filter items by item.category equals cat
    if(!cat || cat==='الكل'){ renderSlice(); return; }
    // create filtered copy
    const filtered = items.filter(it=> (it.category||'').toLowerCase() === cat.toLowerCase());
    // render filtered items (no pagination for simplicity)
    filtered.forEach(it=> container.appendChild(createItem(it)));
    loadBtn.style.display='none';
  }

  // attach filter buttons
  filterBtns.forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('[data-cat], #kmk-filter-all').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const cat = b.dataset.cat || 'الكل';
      applyFilter(cat);
    });
  });

  renderSlice();

  loadBtn.addEventListener('click', ()=> renderSlice());

})();
