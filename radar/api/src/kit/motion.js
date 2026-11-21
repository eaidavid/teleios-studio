/* Teleios Motion Kit — veja /kit/LEIA.md */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('tm-js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function split(el) {
    var mode = el.getAttribute('data-split') || 'words';
    var text = el.textContent.trim().replace(/\s+/g, ' ');
    var keep = el.innerHTML;
    if (/<(em|strong|b|i|span)/i.test(keep) && mode !== 'chars') {
      // preserva ênfases: divide por palavras dentro de cada nó de texto
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = d.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(d.createTextNode(' ')); return; }
              var m = d.createElement('span'); m.className = 'tm-mask';
              var p = d.createElement('span'); p.className = 'tm-piece'; p.style.setProperty('--i', i++); p.textContent = w;
              m.appendChild(p); frag.appendChild(m);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(el);
      return;
    }
    el.setAttribute('aria-label', text);
    var html = '', i2 = 0;
    text.split(' ').forEach(function (w) {
      if (mode === 'chars') {
        html += '<span class="tm-word" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="tm-mask"><span class="tm-piece" style="--i:' + (i2++) + '">' + c + '</span></span>'; }).join('') + '</span> ';
      } else {
        html += '<span class="tm-mask" aria-hidden="true"><span class="tm-piece" style="--i:' + (i2++) + '">' + w + '</span></span> ';
      }
    });
    el.innerHTML = html;
  }

  function init() {
    d.querySelectorAll('[data-split]').forEach(split);
    d.querySelectorAll('[data-delay]').forEach(function (el) { el.style.setProperty('--tm-delay', el.getAttribute('data-delay') + 's'); });
    d.querySelectorAll('[data-stagger]').forEach(function (g) {
      var step = parseFloat(g.getAttribute('data-stagger')) || 0.08;
      Array.prototype.forEach.call(g.children, function (c, i) { c.setAttribute('data-reveal', c.getAttribute('data-reveal') || g.getAttribute('data-reveal-type') || ''); c.style.setProperty('--tm-delay', (i * step) + 's'); });
    });
    d.querySelectorAll('[data-stack]').forEach(function (s) { Array.prototype.forEach.call(s.children, function (c, i) { c.style.setProperty('--i', i); }); });
    d.querySelectorAll('[data-marquee]').forEach(function (m) {
      var t = d.createElement('div'); t.className = 'tm-track';
      while (m.firstChild) t.appendChild(m.firstChild);
      m.appendChild(t); var t2 = t.cloneNode(true); t2.setAttribute('aria-hidden', 'true'); m.appendChild(t2);
    });
    d.querySelectorAll('[data-scrub-words]').forEach(function (el) {
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="tm-sw">' + w + '</span>'; }).join(' ');
    });

    var targets = d.querySelectorAll('[data-reveal],[data-split],[data-draw],[data-curtain],[data-count]');
    if (reduce || !('IntersectionObserver' in window)) { targets.forEach(function (el) { el.classList.add('tm-in'); count(el, true); }); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('tm-in'); count(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }

    // magnético
    if (!reduce && matchMedia('(pointer:fine)').matches) {
      d.querySelectorAll('[data-magnetic]').forEach(function (b) {
        var f = parseFloat(b.getAttribute('data-magnetic')) || 0.3;
        b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * f) + 'px,' + ((e.clientY - r.top - r.height / 2) * f) + 'px)'; });
        b.addEventListener('mouseleave', function () { b.style.transform = ''; });
      });
    }
    onScroll(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  }

  function count(el, now) {
    if (!el.hasAttribute || !el.hasAttribute('data-count') || el._tm) return; el._tm = 1;
    var to = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var fmt = function (v) { return pre + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
    if (now || reduce) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 1600;
    (function step(t) { var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false; var vh = innerHeight;
      if (!reduce) d.querySelectorAll('[data-parallax]').forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + 'px,0)';
      });
      d.querySelectorAll('[data-scrub-words]').forEach(function (el) {
        var r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        var ws = el.querySelectorAll('.tm-sw'), n = Math.round(p * ws.length);
        ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
      });
      d.querySelectorAll('[data-progress]').forEach(function (el) {
        var r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        el.style.setProperty('--tm-p', p.toFixed(3));
        el.querySelectorAll('[data-step]').forEach(function (s) { var sr = s.getBoundingClientRect(); s.classList.toggle('tm-lit', sr.top < vh * 0.6); });
      });
      d.querySelectorAll('[data-scroll-x]').forEach(function (el) {
        var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute('data-scroll-x')) || 0.3;
        el.style.transform = 'translate3d(' + ((r.top - vh) * k).toFixed(1) + 'px,0,0)';
      });
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
