
(async function(){
  const container = document.getElementById('kmk-masonry');
  const loadBtn = document.getElementById('kmk-masonry-loadmore');
  const perPage = 60; // show 60 at first (6 columns -> 10 rows)
  let shown = 0;
  let items = [];

  // try manifest
  try{
    let res = await fetch('assets/data/ibda3at.json');
    if(res.ok){ items = await res.json(); }
  }catch(e){}

  // if no manifest, build list by scanning expected filenames (1..1000)
  if(!items || items.length===0){
    const folder = 'assets/images/ibda3at/';
    const exts = ['jpg','jpeg','png','webp'];
    for(let i=1;i<=1000;i++){
      for(const ext of exts){
        const url = folder + i + '.' + ext;
        // quick existence test by creating Image object
        try{
          await new Promise((resolve)=>{
            const img = new Image();
            img.onload = ()=>{ items.push({image:url}); resolve(true); };
            img.onerror = ()=> resolve(false);
            img.src = url + '?v=1';
          });
        }catch(e){}
      }
    }
  }

  if(!items.length){
    // fallback placeholders
    items = [{image:'assets/images/ibda3at/placeholder1.jpg'},{image:'assets/images/ibda3at/placeholder2.jpg'},{image:'assets/images/ibda3at/placeholder3.jpg'}];
  }

  function renderSlice(){
    const slice = items.slice(shown, shown+perPage);
    slice.forEach(it=>{
      const div = document.createElement('div');
      div.className = 'kmk-masonry-item';
      const img = document.createElement('img');
      img.src = it.image;
      img.alt = it.title || 'تصميم';
      div.appendChild(img);
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      const btnShare = document.createElement('button');
      btnShare.className = 'btn share';
      btnShare.textContent = 'شارك';
      btnShare.addEventListener('click', ()=>{
        const url = window.location.origin + '/' + it.image;
        if(navigator.share) navigator.share({title:it.title||'تصميم', url}).catch(()=>navigator.clipboard.writeText(url));
        else navigator.clipboard.writeText(url);
      });
      const btnDownload = document.createElement('button');
      btnDownload.className = 'btn download';
      btnDownload.textContent = 'تحميل';
      btnDownload.addEventListener('click', ()=>{
        const a = document.createElement('a');
        a.href = it.image;
        a.download = it.image.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
      overlay.appendChild(btnShare);
      overlay.appendChild(btnDownload);
      div.appendChild(overlay);
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<div class="title">${it.title||''}</div>`;
      div.appendChild(meta);
      container.appendChild(div);
      // animate in
      setTimeout(()=> div.classList.add('visible'), 20);
    });
    shown += slice.length;
    if(shown>=items.length) loadBtn.style.display='none';
  }

  renderSlice();
  loadBtn.addEventListener('click', ()=> renderSlice());
})();
