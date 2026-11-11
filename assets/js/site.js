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

  /* hero: cobertura ao vivo */
  var SEM = [[.5, .42], [.5, .4], [.5, .45], [.42, .72]], NOMES = ['dragao', 'cerejeira', 'pastor', 'onca'];
  var P = 8.0, N = NOMES.length, CICLO = P * N, VIRA = 5.4;
  var hero = $('.hero'), quadro = $('.quadro'), fase = $('.q-fase'), qt = $('.q-t');
  var barras = $$('.q-barras b'), amb = $$('.amb img'), COBS = window.COB || [];
  var ultI = -1, ultF = '';
  function marca(t) {
    var i = Math.floor(t / P) % N, s = t - Math.floor(t / P) * P;
    barras.forEach(function (b, j) { b.style.transform = 'scaleX(' + (j < i ? 1 : j > i ? 0 : Math.min(s / (P - .9), 1)).toFixed(4) + ')'; });
    var f = s < 1.3 ? 'Antes' : s < VIRA ? 'Cobrindo' : 'Depois';
    if (f !== ultF) { ultF = f; fase.textContent = f; quadro.classList.toggle('depois', f === 'Depois'); }
    if (i !== ultI) {
      ultI = i; qt.style.opacity = 0;
      amb.forEach(function (a, j) { a.classList.toggle('on', j === i); });
      setTimeout(function () { qt.textContent = (COBS[i] || {}).t || ''; qt.style.opacity = 1; }, 220);
    }
  }
  function estatico() {
    $('.q-poster').src = 'assets/hero/dragao-d.webp';
    fase.textContent = 'Depois'; quadro.classList.add('depois');
    barras.forEach(function (b, j) { b.style.transform = 'scaleX(' + (j === 0 ? 1 : 0) + ')'; });
  }
  function iniciaGL() {
    var cv = $('.q-gl'), carregadas = 0, imgs = [];
    if (!window.cobHero) return false;
    var teste = document.createElement('canvas').getContext('webgl');
    if (!teste) return false;
    NOMES.forEach(function (n, i) {
      ['a', 'd'].forEach(function (k, j) {
        var im = new Image(); im.decoding = 'async'; im.src = 'assets/hero/' + n + '-' + k + '.webp';
        (imgs[i] = imgs[i] || [])[j] = im;
        im.onload = function () { if (++carregadas === N * 2) comeca(); };
        im.onerror = function () { iniciaVideo(); };
      });
    });
    var H, t0 = 0, vis = true, raf = 0;
    function quadroGL(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      H.desenha(t, devicePixelRatio || 1); marca(t);
      raf = vis ? requestAnimationFrame(quadroGL) : 0;
    }
    function comeca() {
      try { H = window.cobHero(cv, imgs.map(function (p, i) { return [p[0], p[1], SEM[i]]; })); } catch (e) { H = null; }
      if (!H) { iniciaVideo(); return; }
      quadro.classList.add('gl');
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (vis && !raf) raf = requestAnimationFrame(quadroGL);
      }).observe(quadro);
      raf = requestAnimationFrame(quadroGL);
    }
    return true;
  }
  var videoTentado = false;
  function iniciaVideo() {
    if (videoTentado) return; videoTentado = true;
    var v = $('.q-video');
    v.src = 'assets/video/cobertura.mp4?v=5'; v.preload = 'auto';
    var p = v.play();
    // iPhone em modo de economia recusa o autoplay: aí o shader faz o trabalho
    if (p && p.catch) p.catch(function () { if (!quadro.classList.contains('gl') && !iniciaGL()) estatico(); });
    v.addEventListener('playing', function () { quadro.classList.add('vd'); }, { once: true });
    v.addEventListener('error', function () { if (!iniciaGL()) estatico(); });
    (function laco() { if (!v.paused && quadro.classList.contains('vd')) marca(v.currentTime % CICLO); requestAnimationFrame(laco); })();
    document.addEventListener('visibilitychange', function () { if (!document.hidden && quadro.classList.contains('vd')) v.play().catch(function () {}); });
  }
  if (reduz) estatico();
  else if (matchMedia('(pointer: coarse)').matches || cel()) iniciaVideo();
  else if (!iniciaGL()) iniciaVideo();
  requestAnimationFrame(function () { hero.classList.add('pronto'); });

  /* surgir ao rolar */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  function observa(el) { if (reduz) el.classList.add('vis'); else io.observe(el); }
  $$('.rev, .revela, .passos').forEach(observa);

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
