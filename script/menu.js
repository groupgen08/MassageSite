(function(){
  const toggle = document.querySelector('.nav-toggle');
  const side = document.querySelector('.side-nav');
  const closeBtn = document.querySelector('.side-close');
  const TRANS_MS = 320; // должен совпадать с duration в CSS (+запас)

  function openSide() {
    if(!side) return;
    // делаем видимым для a11y и запускаем анимацию
    side.setAttribute('aria-hidden','false');
    // небольшая пауза чтобы браузер успел применить атрибуты
    requestAnimationFrame(()=> requestAnimationFrame(()=> {
      side.classList.add('open');
      document.body.classList.add('no-scroll');
      if(toggle) toggle.setAttribute('aria-expanded','true');
    }));
  }

  function closeSide() {
    if(!side) return;
    side.classList.remove('open'); // запускает transition (opacity+transform)
    if(toggle) toggle.setAttribute('aria-expanded','false');

    // Ждём окончания transition — лучше слушать transitionend
    let done = false;
    function finish(e){
      // допускаем, что transitionend может прийти от дочерних элементов; фильтруем по нашему side
      if (e && e.target !== side) return;
      if(done) return;
      done = true;
      side.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
      side.removeEventListener('transitionend', finish);
    }
    side.addEventListener('transitionend', finish);

    // safety fallback
    setTimeout(()=> finish(), TRANS_MS + 80);
  }

  // init state
  if(side) side.setAttribute('aria-hidden','true');

  if(toggle && side){
    toggle.addEventListener('click', ()=> side.classList.contains('open') ? closeSide() : openSide());
  }
  if(closeBtn) closeBtn.addEventListener('click', closeSide);

  // click outside to close
  document.addEventListener('click', (e)=> {
    if(!side) return;
    if(side.classList.contains('open') && !side.contains(e.target) && !toggle.contains(e.target)){
      closeSide();
    }
  });
})();




// Закрытие side-nav при изменении ширины экрана (debounced)
(function(){
  const BREAKPOINT = 720; // тот же порог, что и в медиа-запросах
  const side = document.querySelector('.side-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (!side) return;

  // функция "безопасного закрытия" — делает то же, что closeSide, но без повторного слушателя
  function closeSideImmediate() {
    // если уже закрыто — ничего не делать
    if (!side.classList.contains('open')) {
      // но убедимся, что aria-hidden = true и no-scroll снят
      side.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
      if (toggle) toggle.setAttribute('aria-expanded','false');
      return;
    }
    // запускаем закрытие анимированно (удаляем класс open),
    // но записываем aria-hidden уже после завершения transition
    side.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded','false');

    const onEnd = (e) => {
      if (e && e.target !== side) return;
      side.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
      side.removeEventListener('transitionend', onEnd);
    };
    side.addEventListener('transitionend', onEnd);

    // safety fallback
    const TRANSITION_TIMEOUT = 420;
    setTimeout(() => {
      if (side.classList.contains('open')) return; // если успели открыть снова — не мешаем
      side.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
      side.removeEventListener('transitionend', onEnd);
    }, TRANSITION_TIMEOUT);
  }

  // debounce helper
  function debounce(fn, wait){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this, args), wait);
    };
  }

  // запомним текущее состояние широкого/узкого, чтобы реагировать только при переходе
  let isWide = window.innerWidth > BREAKPOINT;

  const onResize = debounce(function(){
    const nowWide = window.innerWidth > BREAKPOINT;
    if (nowWide && !isWide) {
      // перешли из мобильного в десктоп — закрываем боковое меню, если открыто
      closeSideImmediate();
    }
    isWide = nowWide;
  }, 160);

  window.addEventListener('resize', onResize);
  // также полезно проверить при первой загрузке (в случае, если страница открыта в широком окне)
  // но обычно это не нужно: мы уже инициализируем aria-hidden=true при старте.
})();