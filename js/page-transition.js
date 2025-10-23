// Page transition script: fade out on internal link click, then navigate; fade in on load
(function(){
  const DURATION = 360; // match CSS transition
  const body = document.body;

  // On load: remove transitioning class after tiny delay to create fade-in
  body.classList.add('is-transitioning');
  window.addEventListener('load', function(){
    setTimeout(() => body.classList.remove('is-transitioning'), 50);
  }, {once:true});

  // Helper to determine internal navigation
  function isInternalLink(a){
    try{
      const url = new URL(a.href, location.href);
      return url.origin === location.origin && (url.pathname.endsWith('.html') || url.pathname === location.pathname || url.hash || url.pathname === '/');
    }catch(e){
      return false;
    }
  }

  // Attach click handler to links
  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;
    if(a.target && a.target !== '' && a.target !== '_self') return; // ignore external targets
    if(a.href && isInternalLink(a)){
      // ignore links that only change hash on same page
      if(a.hash && a.pathname === location.pathname) return;
      e.preventDefault();
      const href = a.href;
      // start transition
      body.classList.add('is-transitioning');
      setTimeout(()=> { window.location.href = href; }, DURATION);
    }
  }, true);

  // Also handle back/forward navigation to show transition (best effort)
  window.addEventListener('popstate', function(){
    body.classList.add('is-transitioning');
    setTimeout(()=> body.classList.remove('is-transitioning'), DURATION+50);
  });
})();