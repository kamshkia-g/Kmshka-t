
document.addEventListener('DOMContentLoaded', async function(){
  const container = document.getElementById('kmk-pod-list');
  const filterWrap = document.getElementById('kmk-pod-filters');
  const loadMoreBtn = document.getElementById('kmk-pod-loadmore');
  let items = [];
  try{
    const res = await fetch('assets/data/podcasts.json');
    items = await res.json();
  }catch(e){ console.error(e); return; }
  // build categories dynamically
  const cats = Array.from(new Set(items.map(i=>i.category).filter(Boolean)));
  // add All button
  const allBtn = document.createElement('button'); allBtn.textContent='الكل'; allBtn.className='kmk-filter-btn active'; allBtn.onclick = ()=> renderList(items);
  filterWrap.appendChild(allBtn);
  cats.forEach(c=>{ const b=document.createElement('button'); b.textContent=c; b.className='kmk-filter-btn'; b.onclick=()=> renderList(items.filter(i=>i.category===c)); filterWrap.appendChild(b); });
  let shown = 0; const per = 9;
  function makeCard(it){
    const card = document.createElement('article'); card.className='kmk-pod-card';
    const h = document.createElement('h4'); h.textContent = it.title; card.appendChild(h);
    const p = document.createElement('p'); p.textContent = it.description; card.appendChild(p);
    if(it.local_audio){
      const audio = document.createElement('audio'); audio.controls = true; audio.src = it.local_audio; audio.preload='none'; card.appendChild(audio);
      // download button
      const a = document.createElement('a'); a.href = it.local_audio; a.download = ''; a.textContent='تحميل'; a.className='kmk-small-btn'; card.appendChild(a);
    }
    if(it.youtube){
      const yt = document.createElement('a'); yt.href = it.youtube; yt.target='_blank'; yt.rel='noopener'; yt.textContent='استمع على يوتيوب'; yt.className='kmk-small-btn'; card.appendChild(yt);
    }
    const cat = document.createElement('div'); cat.className='kmk-pod-cat'; cat.textContent = it.category; card.appendChild(cat);
    return card;
  }
  function renderList(list){
    container.innerHTML='';
    shown = 0;
    if(list.length===0){ container.innerHTML='<p>لا توجد حلقات</p>'; loadMoreBtn.style.display='none'; return; }
    const slice = list.slice(0, per); slice.forEach(i=> container.appendChild(makeCard(i))); shown = slice.length;
    loadMoreBtn.style.display = shown < list.length ? 'block' : 'none';
    // store current list for load more
    container.dataset.current = JSON.stringify(list);
  }
  loadMoreBtn.addEventListener('click', function(){
    const list = JSON.parse(container.dataset.current || '[]');
    const next = list.slice(shown, shown + per);
    next.forEach(i=> container.appendChild(makeCard(i)));
    shown += next.length;
    if(shown >= list.length) loadMoreBtn.style.display='none';
  });
  // initial render (all)
  renderList(items);
});


// Listen for play requests and maintain current list for prev/next behavior
(function(){
  let currentList = [];
  let currentIndex = -1;
  window.addEventListener('kmk_set_list', function(e){ currentList = e.detail || []; currentIndex = -1; });
  window.addEventListener('kmk_play_item', function(e){
    const it = e.detail;
    // find index in currentList
    currentIndex = currentList.findIndex(x=>x.id===it.id);
    if(currentIndex===-1){
      // if not found, set list to all items
      currentList = window.__kmk_all_podcasts || [];
      currentIndex = currentList.findIndex(x=>x.id===it.id);
    }
    // call player API
    if(window.kmkPlayer && typeof window.kmkPlayer.playItem==='function'){
      window.kmkPlayer.playItem(it, currentList, currentIndex);
    }
  });
  // expose function to set items
  window.kmkSetList = function(list){ window.__kmk_all_podcasts = list; window.dispatchEvent(new CustomEvent('kmk_set_list',{detail:list})); };
})();
