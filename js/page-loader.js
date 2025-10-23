// Page loader: show centered circle, pulse then expand, then navigate
(function(){
  const DURATION_PULSE = 380;
  const DURATION_EXPAND = 520;
  const overlaySelector = '.kmk-loader-overlay';
  const circleClass = 'kmk-loader-circle';

  // create overlay element if not present
  function ensureOverlay(){
    let overlay = document.querySelector(overlaySelector);
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'kmk-loader-overlay';
      overlay.innerHTML = '<div class="'+circleClass+'"></div>';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  const overlay = ensureOverlay();
  const circle = overlay.querySelector('.' + circleClass);

  // helper to run transition on link click
  function startTransition(href){
    // show overlay and pulse
    overlay.classList.add('active');
    circle.classList.add('pulse');
    // after pulse, expand
    setTimeout(() => {
      circle.classList.remove('pulse');
      overlay.classList.add('expand');
      // wait for expand animation then navigate
      setTimeout(() => {
        window.location.href = href;
      }, DURATION_EXPAND);
    }, DURATION_PULSE);
  }

  // detect internal links
  function isInternal(a){
    try{
      const url = new URL(a.href, location.href);
      return url.origin === location.origin && (url.pathname.endsWith('.html') || url.pathname === '/' || url.hash);
    }catch(e){ return false; }
  }

  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;
    if(a.target && a.target !== '' && a.target !== '_self') return; // ignore new tab/external
    if(a.href && isInternal(a)){
      // ignore same-page hash links
      const url = new URL(a.href, location.href);
      if(url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      // start transition
      startTransition(a.href);
    }
  }, true);

  // On page load, ensure overlay hidden
  window.addEventListener('load', function(){
    const ov = document.querySelector(overlaySelector);
    if(ov) ov.classList.remove('active','expand');
  });
})();