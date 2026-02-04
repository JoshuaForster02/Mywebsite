(function(){
  'use strict';
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(){
    if(prefersReduced) return;
    var hero = document.querySelector('.hero-grid');
    if(hero) hero.classList.add('animate-in');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  var grid = document.querySelector('.hero-overlay-grid');
  if(grid){
    document.addEventListener('mousemove', function(e){
      var x = (e.clientX / window.innerWidth - 0.5) * 10;
      var y = (e.clientY / window.innerHeight - 0.5) * 10;
      grid.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
  }
})();

