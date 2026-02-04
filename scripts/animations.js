(function(){
  'use strict';
  var storageKey = 'site-motion-disabled';
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createToggle(){
    var header = document.querySelector('header .header-wrapper');
    if(!header) return null;
    var group = header.querySelector('.control-group');
    if(!group){ group = document.createElement('div'); group.className = 'control-group'; header.appendChild(group); }
    var btn = document.createElement('button');
    btn.className = 'motion-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-pressed','false');
    btn.textContent = 'Animationen';
    group.appendChild(btn);
    return btn;
  }

  function ready(){
    var btn = createToggle();
    var disabled = localStorage.getItem(storageKey) === '1';
    if(disabled) document.body.classList.add('no-animation');
    if(btn) btn.setAttribute('aria-pressed', disabled ? 'true' : 'false');

    if(btn){
      btn.addEventListener('click', function(){
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        pressed = !pressed;
        btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        if(pressed){ document.body.classList.add('no-animation'); localStorage.setItem(storageKey,'1'); }
        else { document.body.classList.remove('no-animation'); localStorage.removeItem(storageKey); }
      });
    }

    if(!prefersReduced && !document.body.classList.contains('no-animation')){
      var hero = document.querySelector('.hero-grid');
      if(hero) hero.classList.add('animate-in');
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
