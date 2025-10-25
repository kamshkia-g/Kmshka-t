
// Global podcasts player
(function(){
  const audio = document.getElementById('kmk-audio');
  const player = document.getElementById('kmk-global-player');
  const titleEl = document.getElementById('kmk-player-title');
  const playBtn = document.getElementById('kmk-play');
  const prevBtn = document.getElementById('kmk-prev');
  const nextBtn = document.getElementById('kmk-next');
  const seek = document.getElementById('kmk-seek');
  const speed = document.getElementById('kmk-speed');
  const download = document.getElementById('kmk-download');
  const closeBtn = document.getElementById('kmk-close');
  let list = [];
  let idx = -1;
  function show(){ player.style.display='flex'; }
  function hide(){ player.style.display='none'; }
  function loadItem(it, index, arr){
    idx = index || 0;
    list = arr || list;
    titleEl.textContent = it.title || 'Podcast';
    // choose source: local audio first, else youtube open externally
    if(it.local_audio){
      audio.src = it.local_audio;
      audio.playbackRate = parseFloat(speed.value || 1);
      audio.play().catch(()=>{});
      download.href = it.local_audio;
      download.style.display = 'inline-block';
    } else if(it.youtube){
      // open YouTube externally
      window.open(it.youtube, '_blank');
      return;
    } else {
      // nothing to play
      alert('لا يوجد ملف صوتي لهذا العنصر.');
      return;
    }
    show();
    sessionStorage.setItem('kmk_player_state', JSON.stringify({currentId: it.id, currentSrc: audio.src}));
  }
  // player API exposed
  window.kmkPlayer = {
    playItem: function(it, arr, i){ list = arr || list; idx = i || 0; loadItem(it, idx, arr); },
    playNext: function(){ if(idx+1 < list.length){ loadItem(list[idx+1], idx+1, list); } },
    playPrev: function(){ if(idx-1 >=0){ loadItem(list[idx-1], idx-1, list); } }
  };
  // controls
  playBtn.addEventListener('click', function(){ if(audio.paused) audio.play(); else audio.pause(); });
  prevBtn.addEventListener('click', function(){ window.kmkPlayer.playPrev(); });
  nextBtn.addEventListener('click', function(){ window.kmkPlayer.playNext(); });
  closeBtn.addEventListener('click', function(){ audio.pause(); hide(); });
  // update play button state
  audio.addEventListener('play', ()=> playBtn.textContent='⏸');
  audio.addEventListener('pause', ()=> playBtn.textContent='▶');
  // seek update
  audio.addEventListener('timeupdate', function(){ if(audio.duration){ seek.max = Math.floor(audio.duration); seek.value = Math.floor(audio.currentTime); } });
  seek.addEventListener('input', function(){ audio.currentTime = parseInt(this.value || 0); });
  // speed control
  speed.addEventListener('change', function(){ audio.playbackRate = parseFloat(this.value); });
  // restore from session on load (best-effort)
  window.addEventListener('load', function(){
    try{
      const state = JSON.parse(sessionStorage.getItem('kmk_player_state')||'null');
      if(state && state.currentSrc){
        audio.src = state.currentSrc;
        // do not autoplay to avoid unexpected play; show player so user can resume
        show();
      }
    }catch(e){}
  });
  // handle media keys via Media Session API if available
  if('mediaSession' in navigator){
    navigator.mediaSession.setActionHandler('play', ()=> audio.play());
    navigator.mediaSession.setActionHandler('pause', ()=> audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', ()=> window.kmkPlayer.playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', ()=> window.kmkPlayer.playNext());
  }
})();
