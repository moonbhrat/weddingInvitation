(function () {
  // Time and place can be added here later, for example { time: 'शाम 7:00 बजे', place: 'स्थान का नाम' }
  var DETAILS = {
    tel: { time: '', place: '' },
    vivah: { time: '', place: '' },
    vidai: { time: '', place: '' }
  };

  // Always open on the first (swagat) page: drop any #utsav / #parivar left in the address and start at the top
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);

  var VIEWS = ['swagat', 'utsav', 'parivar'];
  var card = document.querySelector('.card');
  var doors = document.getElementById('doors');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function current() {
    var h = location.hash.replace('#', '');
    return VIEWS.indexOf(h) > -1 ? h : 'swagat';
  }

  // Show one page; children of the page rise in one after another
  function render(animate, base) {
    var c = current();
    VIEWS.forEach(function (v) {
      var el = document.getElementById('view-' + v);
      el.hidden = v !== c;
      el.classList.remove('anim');
      if (v === c && animate) {
        Array.prototype.forEach.call(el.children, function (ch, i) { ch.style.setProperty('--i', Math.min(i, 8)); });
        el.style.setProperty('--base', base || '0s');
        void el.offsetWidth;
        el.classList.add('anim');
      }
    });
    document.querySelectorAll('.tabs a').forEach(function (a) {
      if (a.dataset.tab === c) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  Object.keys(DETAILS).forEach(function (k) {
    var d = DETAILS[k];
    var parts = [d.time, d.place].filter(Boolean);
    var el = document.querySelector('[data-ev="' + k + '"]');
    if (el && parts.length) { el.textContent = parts.join(' · '); el.hidden = false; }
  });

  function countdown() {
    var el = document.getElementById('count');
    var t = new Date();
    var today = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
    var days = Math.round((Date.UTC(2026, 10, 21) - today) / 86400000);
    var text = '';
    if (days > 1) text = 'शुभ विवाह में ' + days + ' दिन शेष';
    else if (days === 1) text = 'शुभ विवाह कल है';
    else if (days === 0) text = 'आज शुभ विवाह है';
    if (text) { el.textContent = text; el.hidden = false; }
  }

  /* ---------- Music ----------
     Starts on the first click of any card link (the "मंगल कार्यक्रम देखें" button on page 1),
     because browsers only allow sound after a tap. Then it keeps playing on every page.
     Put the song at assets/song.mp3 */
  var audio = document.getElementById('song');
  var musicBtn = document.getElementById('music');
  var started = false;
  var TARGET_VOL = 0.8;

  function fadeIn() {
    audio.volume = 0;
    var v = 0;
    var t = setInterval(function () {
      v = Math.min(TARGET_VOL, v + 0.05);
      audio.volume = v;
      if (v >= TARGET_VOL) clearInterval(t);
    }, 120);
  }

  function startMusic() {
    if (started) return;
    started = true;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        fadeIn();
        musicBtn.classList.add('show');
        musicBtn.setAttribute('aria-pressed', 'true');
      }).catch(function () { started = false; });
    }
  }

  audio.addEventListener('error', function () { musicBtn.classList.remove('show'); });

  musicBtn.addEventListener('click', function () {
    if (audio.paused) { audio.play(); musicBtn.setAttribute('aria-pressed', 'true'); }
    else { audio.pause(); musicBtn.setAttribute('aria-pressed', 'false'); }
  });

  document.querySelectorAll('.card a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', startMusic);
  });

  /* ---------- Page change with doors ---------- */
  var shown = current();
  var busy = false;

  function go() {
    if (busy || current() === shown) return;
    if (reduce) { render(false); shown = current(); window.scrollTo(0, 0); return; }
    busy = true;
    doors.classList.add('run');
    requestAnimationFrame(function () { requestAnimationFrame(function () { doors.classList.add('closed'); }); });
    // doors shut (0.75s) + a short pause on the seal
    setTimeout(function () {
      render(true, '0.35s');
      shown = current();
      window.scrollTo(0, 0);
      doors.classList.remove('closed');
      setTimeout(function () {
        doors.classList.remove('run');
        busy = false;
        go();
      }, 900);
    }, 1250);
  }

  window.addEventListener('hashchange', go);
  render(!reduce, '0.1s');
  countdown();
})();