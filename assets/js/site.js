(function () {
  'use strict';
  var WA = '5544991761485';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cel = function () { return innerWidth <= 860; };

  /* topo */
  var topo = $('#topo');
  function rolou() { topo.classList.toggle('solido', scrollY > 30); }
  addEventListener('scroll', rolou, { passive: true }); rolou();

  /* menu */
  var mb = $('.menu-bt'), menu = $('#menu');
  function abre(v) {
    mb.setAttribute('aria-expanded', v); mb.setAttribute('aria-label', v ? 'Fechar menu' : 'Abrir menu');
    if (v) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('aberto'); }); document.body.style.overflow = 'hidden'; }
    else { menu.classList.remove('aberto'); menu.hidden = true; document.body.style.overflow = ''; }
  }
  mb.addEventListener('click', function () { abre(mb.getAttribute('aria-expanded') !== 'true'); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { abre(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) abre(false); });
  addEventListener('resize', function () { if (!cel() && !menu.hidden) abre(false); });

  /* hero */
  var NOMES = ['leao', 'olho', 'dragao', 'itachi'];
  var TITULOS = ['Leão em chamas', 'Olho com a cruz', 'Dragão oriental · cobertura', 'Itachi Uchiha'];
  var P = 6.5, F0 = 1.15, F = 2.3, TR = 0.95, CICLO = P * NOMES.length;
  var hero = $('.hero'), lente = $('.lente'), arco = $('.aro-cor'), peca = $('.peca-t');
  var lados = { pc: $('.lado-e'), cor: $('.lado-d') };
  var ultI = -1, ultL = '';
  function marca(t) {
    var i = Math.floor(t / P) % NOMES.length, s = t % P;
    var f = Math.min(Math.max((s - F0) / F, 0), 1);
    var troca = s > P - TR, k = troca ? (s - (P - TR)) / TR : 0;
    var arcoV = troca ? 100 * (1 - k) : 100 * f;
    arco.style.strokeDasharray = arcoV.toFixed(2) + ' 100';
    var l = (f > 0.35 && !troca) ? 'cor' : 'pc';
    if (l !== ultL) { lados.pc.classList.toggle('on', l === 'pc'); lados.cor.classList.toggle('on', l === 'cor'); ultL = l; }
    if (i !== ultI) {
      ultI = i; peca.style.opacity = 0;
      setTimeout(function () { peca.textContent = TITULOS[i]; peca.style.opacity = 1; }, 260);
    }
  }
  function estatico() {
    lados.cor.classList.add('on'); arco.style.strokeDasharray = '100 100';
    peca.textContent = TITULOS[0];
  }
  function iniciaGL() {
    var cv = $('.lente-gl'), H;
    try { H = window.veroHero(cv); } catch (e) { H = null; }
    if (!H) return false;
    var prontas = 0, imgs = [];
    NOMES.forEach(function (n, i) {
      var im = new Image(); im.decoding = 'async'; im.src = 'assets/hero/' + n + '.webp';
      imgs[i] = im;
      im.onload = function () {
        prontas++;
        if (prontas === NOMES.length) {
          try { imgs.forEach(function (m, j) { H.textura(j, m); }); } catch (e) { iniciaVideo(); return; }
          comeca();
        }
      };
    });
    var t0 = 0, vis = true, raf = 0;
    function lado() { return lente.getBoundingClientRect().width; }
    function quadro(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      H.desenha(t, lado(), Math.min(devicePixelRatio || 1, 2));
      marca(t);
      raf = vis ? requestAnimationFrame(quadro) : 0;
    }
    function comeca() {
      lente.classList.add('gl');
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (vis && !raf) raf = requestAnimationFrame(quadro);
      }).observe(lente);
      raf = requestAnimationFrame(quadro);
    }
    return true;
  }
  function iniciaVideo() {
    var v = $('.lente-video');
    v.src = 'assets/video/hero.mp4'; v.preload = 'auto';
    var p = v.play();
    if (p && p.catch) p.catch(function () { estatico(); });
    v.addEventListener('playing', function () { lente.classList.add('vd'); }, { once: true });
    v.addEventListener('error', function () { if (!iniciaGL()) estatico(); });
    (function laco() { if (!v.paused) marca(v.currentTime % CICLO); requestAnimationFrame(laco); })();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) v.play().catch(function () {}); });
  }
  if (reduz) estatico();
  else if (matchMedia('(pointer: coarse)').matches || cel()) iniciaVideo();
  else if (!iniciaGL()) iniciaVideo();
  requestAnimationFrame(function () { hero.classList.add('pronto'); });

  /* números */
  function conta(el) {
    var n = +el.dataset.n; if (!n || reduz) return;
    var pre = el.dataset.pre || '', pos = el.dataset.pos || '', t0 = 0;
    (function q(ts) {
      if (!t0) t0 = ts; var k = Math.min((ts - t0) / 1400, 1); k = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(n * k) + pos; if (k < 1) requestAnimationFrame(q);
    })(performance.now());
  }

  /* surgir ao rolar */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis'); io.unobserve(e.target);
      var b = e.target.querySelector('b[data-n]'); if (b) conta(b);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  function observa(el) { if (reduz) el.classList.add('vis'); else io.observe(el); }
  $$('.rev').forEach(observa);

  /* portfólio */
  var TR_ = window.TRAB || [], grade = $('#grade'), mais = $('#mais'), filtro = 'todos', aberto = false;
  var ROT = { cor: 'Realismo colorido', pc: 'Preto e cinza' };
  function lista() {
    return TR_.filter(function (x) {
      return filtro === 'todos' || (filtro === 'cob' ? x.k : x.c === filtro);
    });
  }
  function limite() { return cel() ? 8 : 12; }
  function desenha() {
    var L = lista(), n = aberto ? L.length : Math.min(L.length, limite());
    grade.innerHTML = '';
    L.slice(0, n).forEach(function (x, i) {
      var li = document.createElement('li'); li.className = 'card';
      li.innerHTML = '<button type="button" data-i="' + i + '"><span class="card-f"><img src="assets/img/trab/' + x.s + '-p.webp" alt="' + x.t + ', tatuagem em ' + ROT[x.c].toLowerCase() + '" width="540" height="675" loading="lazy" decoding="async"></span>' +
        '<span class="card-t">' + x.t + '</span><span class="card-c">' + ROT[x.c] + (x.k ? ' · cobertura' : '') + '</span></button>';
      li.style.transitionDelay = (i % 4) * 60 + 'ms';
      grade.appendChild(li); observa(li);
    });
    mais.parentNode.hidden = n >= L.length;
  }
  $$('.filtro').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.filtro').forEach(function (o) { o.classList.toggle('on', o === b); o.setAttribute('aria-pressed', o === b); });
      filtro = b.dataset.f; aberto = false; desenha();
    });
  });
  mais.addEventListener('click', function () { aberto = true; desenha(); });
  var larg = innerWidth;
  addEventListener('resize', function () { if ((larg <= 860) !== cel()) { larg = innerWidth; desenha(); } });
  desenha();

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lb img'), lbCap = $('#lb figcaption'), atual = 0, foco = null;
  function mostra(i) {
    var L = lista(); atual = (i + L.length) % L.length; var x = L[atual];
    lbImg.src = 'assets/img/trab/' + x.s + '.webp'; lbImg.alt = x.t;
    lbCap.textContent = x.t + ' · ' + ROT[x.c] + (x.k ? ' · cobertura' : '');
  }
  grade.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    foco = b; mostra(+b.dataset.i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-x').focus();
  });
  function fecha() { lb.hidden = true; document.body.style.overflow = ''; if (foco) foco.focus(); }
  $('.lb-x').addEventListener('click', fecha);
  $('.lb-a').addEventListener('click', function () { mostra(atual - 1); });
  $('.lb-p').addEventListener('click', function () { mostra(atual + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha(); else if (e.key === 'ArrowLeft') mostra(atual - 1); else if (e.key === 'ArrowRight') mostra(atual + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(d) > 50) mostra(atual + (d < 0 ? 1 : -1));
  });

  /* coberturas */
  var cobs = $('#cobs');
  (window.COB || []).forEach(function (c) {
    var li = document.createElement('li'); li.className = 'cob rev';
    li.innerHTML = '<div class="cob-f" role="button" tabindex="0" aria-label="Alternar antes e depois: ' + c.t + '">' +
      '<img src="assets/img/cob/' + c.s + '-antes.webp" alt="Antes: tatuagem antiga" width="720" height="900" loading="lazy">' +
      '<img class="depois" src="assets/img/cob/' + c.s + '-depois.webp" alt="Depois: ' + c.t + '" width="720" height="900" loading="lazy">' +
      '<span class="rot">Depois</span></div>' +
      '<div class="cob-bts"><button type="button" data-v="antes">Antes</button><button type="button" data-v="depois" class="on">Depois</button></div>' +
      '<p>' + c.t + '</p>';
    cobs.appendChild(li); observa(li);
    function poe(v) {
      li.classList.toggle('antes', v === 'antes');
      $$('.cob-bts button', li).forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', b.dataset.v === v); });
      $('.rot', li).textContent = v === 'antes' ? 'Antes' : 'Depois';
    }
    $$('.cob-bts button', li).forEach(function (b) { b.addEventListener('click', function () { poe(b.dataset.v); }); });
    var f = $('.cob-f', li);
    function alterna() { poe(li.classList.contains('antes') ? 'depois' : 'antes'); }
    f.addEventListener('click', alterna);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterna(); } });
  });

  /* navegação ativa */
  var secoes = $$('main section[id]'), links = $$('.nav a');
  var ns = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach(function (s) { ns.observe(s); });

  /* formulário → WhatsApp */
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, v = function (n) { var el = f.elements[n]; return (el && el.value || '').trim(); };
    if (!v('nome')) { $('#erro').hidden = false; f.elements.nome.focus(); return; }
    $('#erro').hidden = true;
    var linhas = ['Olá, Veríssimo! Quero um orçamento.', '', '*Nome:* ' + v('nome'), '*Estúdio:* ' + v('estudio'), '*Estilo:* ' + v('estilo'), '*Cobertura:* ' + v('cob')];
    if (v('local')) linhas.push('*Local do corpo:* ' + v('local'));
    if (v('tam')) linhas.push('*Tamanho:* ' + v('tam'));
    if (v('ideia')) linhas.push('', '*Ideia:* ' + v('ideia'));
    linhas.push('', 'Vou mandar as fotos do local e das referências aqui.');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  });

  $('#ano').textContent = new Date().getFullYear();
})();
