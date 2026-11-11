# -*- coding: utf-8 -*-
"""Imagem de prévia do link (WhatsApp/Instagram/Google), 1200x630: a cena do hero "galeria no chão" num instante
escolhido (todas as obras inteiras, nenhuma no meio da troca; dragão já coberto no centro, Ayrton no canto),
gravada a 2x e reduzida, com VERÍSSIMO e a linha embaixo, no eixo. Precisa do servidor local na 8767.
Uso: python tools/og.py"""
import io
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
S = Path(__file__).resolve().parent.parent
URL = 'http://127.0.0.1:8767/'
HTML = """<style>@font-face{font-family:A;src:url(/assets/fonts/antonio.woff2);font-weight:100 700}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0a0a0b}
canvas{position:absolute;inset:0;width:1200px;height:630px}
.t{position:absolute;left:0;right:0;bottom:46px;text-align:center;color:#efe9e0;font-family:A}
.n{font:600 88px/.9 A;letter-spacing:.06em;padding-left:.06em;text-transform:uppercase}
.s{margin-top:20px;font:500 13px/1 A;letter-spacing:.32em;padding-left:.32em;text-transform:uppercase;color:#a29d95}
.s i{display:inline-block;width:1px;height:11px;background:rgba(239,233,224,.28);margin:0 20px;vertical-align:-1px}</style>
<canvas id=c></canvas><div class=t><div class=n>Veríssimo</div>
<div class=s>Tattoo artist desde 1994<i></i>Realismo e coberturas<i></i>Maringá e Goiânia</div></div>"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=2)
    g.goto(URL + 'assets/galeria/galeria.json')
    g.evaluate('h => { document.documentElement.innerHTML = h; }', HTML)
    g.add_script_tag(url=URL + 'assets/js/galeria.js')
    g.evaluate("""async () => {
      await document.fonts.load('600 88px A'); await document.fonts.load('500 13px A');
      const meta = await (await fetch('/assets/galeria/galeria.json')).json(), T = 10;
      // cada quadro de realismo parado no 1º trabalho (3 s depois de trocar); centro com o dragão coberto; canto com o Ayrton
      const Q = GALERIA.pc.map(q => Object.assign({}, q, q.cob == null ? {off: T - 3} : {off: 0, cob: q.cob === 0 ? 0 : 1}));
      const ns = new Set(); Q.forEach(q => q.cob != null ? GALERIA.seq.forEach(n => { if (/^(dragao|pastor)$/.test(n)) { ns.add(n + '-a'); ns.add(n + '-d'); } else ns.add(n); }) : q.arts.forEach(n => ns.add(n)));
      const imgs = {}; for (const n of ns) { const m = new Image(); m.src = '/assets/galeria/' + n + '.webp'; await m.decode(); imgs[n] = m; }
      const G = galeria(document.getElementById('c'), {imgs, meta, quadros: Q, fundo: [.62, 1], guardar: true, tam: [2400, 1260], u: 2});
      G.desenha(1, 1); G.desenha(T, 1);
    }""")
    g.wait_for_timeout(300)
    png = g.screenshot()
    b.close()
Image.open(io.BytesIO(png)).convert('RGB').resize((1200, 630), Image.LANCZOS).save(S / 'assets/img/og.jpg', quality=90, optimize=True, progressive=True)
print('og.jpg', round((S / 'assets/img/og.jpg').stat().st_size / 1e3), 'KB')
