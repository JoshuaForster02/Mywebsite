(function(){
  'use strict';
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(){
    if(prefersReduced) return;
    var hero = document.querySelector('.hero-grid');
    if(hero) hero.classList.add('animate-in');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
