// ibda3at gallery loader
(async function(){
  const GRID = document.querySelector('.kmk-gallery');
  const controls = document.querySelectorAll('.kmk-gallery-controls button[data-aspect]');
  const loadMoreBtn = document.querySelector('#kmk-gallery-loadmore');
  const manifestUrl = 'assets/data/ibda3at.json';
  let items = [];
  let perPage = 30;
  let shown = 0;

  // try manifest first
  try{
    const res = await fetch(manifestUrl);
    if(res.ok){ items = await res.json(); }
  }catch(e){ /* ignore */ }

  // if no manifest, probe sequential filenames (001..500) with common exts
  if(!items || items.length===0){
    const folder = 'assets/images/ibda3at/';
    const exts = ['jpg','jpeg','png','webp'];
    let found = [];
    // Attempt names 1..500 (padded and unpadded)
    for(let i=1;i<=500;i++){
      let names = [String(i), String(i).padStart(3,'0')];
      for(const n of names){
        for(const ext of exts){
          const url = folder + n + '.' + ext;
          // create image to test load
          try{
            await new Promise((resolve)=>{
              const img = new Image();
              img.onload = ()=>{ found.push({image:url}); resolve(true); };
              img.onerror = ()=>{ resolve(false); };
              img.src = url + '?v=1'; // cache-bust safe
            });
          }catch(e){}
        }
      }
      // small break to allow UI responsiveness
      if(i%50===0){ await new Promise(r=>setTimeout(r,30)); }
      if(found.length>=500) break;
    }
    items = found;
  }

  // fallback: if still empty, use placeholders present in folder
  if(!items || items.length===0){
    const placeholders = ['assets/images/ibda3at/placeholder1.jpg','assets/images/ibda3at/placeholder2.jpg','assets/images/ibda3at/placeholder3.jpg'];
    items = placeholders.map(p=>({image:p}));
  }

  function renderSlice(){
    const slice = items.slice(shown, shown+perPage);
    slice.forEach(it=>{
      const wrapper = document.createElement('div');
      wrapper.className = 'kmk-item';
      wrapper.innerHTML = `<img src="${it.image}" alt="${(it.title||'تصميم')}"><div class="meta"><div class="title">${(it.title||'')} </div></div>`;
      GRID.appendChild(wrapper);
      // reveal with animation
      setTimeout(()=> wrapper.classList.add('visible'), 20);
    });
    shown += slice.length;
    if(shown>=items.length) loadMoreBtn.style.display='none'; else loadMoreBtn.style.display='inline-block';
  }

  // initial render
  renderSlice();

  // load more
  loadMoreBtn.addEventListener('click', ()=> renderSlice());

  // aspect controls
  controls.forEach(btn=> btn.addEventListener('click', ()=>{
    document.querySelectorAll('.kmk-gallery-controls button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const asp = btn.dataset.aspect;
    const wrapper = document.querySelector('.kmk-gallery-wrapper');
    wrapper.classList.remove('kmk-aspect-square','kmk-aspect-portrait','kmk-aspect-tall');
    wrapper.classList.add('kmk-aspect-'+asp);
  }));

})();