(function(){
  const navbar = document.querySelector('.kmk-navbar');
  const hamburger = document.querySelector('.kmk-hamburger');
  const sidebar = document.querySelector('.kmk-sidebar');
  const closeBtn = document.querySelector('.kmk-close');

  if(!navbar) return;

  const onScroll = () => {
    if(window.scrollY > 24) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const openSidebar = () => {
    if(!sidebar) return;
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
  };
  const closeSidebar = () => {
    if(!sidebar) return;
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
  };

  hamburger?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  sidebar?.querySelectorAll('a')?.forEach(a => a.addEventListener('click', closeSidebar));
  window.addEventListener('keydown', e => { if(e.key==='Escape') closeSidebar(); });
})();