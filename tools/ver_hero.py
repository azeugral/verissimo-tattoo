# -*- coding: utf-8 -*-
"""Tira quadros do shader do hero em varios tempos e monta uma tira em _ref/hero-tira.jpg."""
import base64, io, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
S = Path(__file__).resolve().parent.parent
NOMES = ['leao', 'olho', 'dragao', 'itachi']
TS = [float(x) for x in (sys.argv[1].split(',') if len(sys.argv) > 1 else '0.5,1.6,2.2,2.8,3.6,5.8,6.1,6.4'.split(','))]
b64 = lambda f: 'data:image/webp;base64,' + base64.b64encode((S / f).read_bytes()).decode()
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 400, 'height': 400})
    g.set_content('<body style="margin:0"><canvas id=c></canvas></body>')
    g.add_script_tag(content=(S / 'assets/js/hero.js').read_text(encoding='utf8'))
    g.evaluate("""async(a)=>{window.H=veroHero(document.getElementById('c'),{guardar:true});
      for(let i=0;i<a.length;i++){const m=new Image();m.src=a[i];await m.decode();H.textura(i,m)}}""", [b64(f'assets/hero/{n}.webp') for n in NOMES])
    L = 360; tira = Image.new('RGB', (L * len(TS), L), 'black')
    for i, t in enumerate(TS):
        d = g.evaluate(f"(H.desenha({t},{L},1),document.getElementById('c').toDataURL('image/jpeg',.9))")
        im = Image.open(io.BytesIO(base64.b64decode(d.split(',', 1)[1])))
        m = Image.new('L', (L, L), 0); ImageDraw.Draw(m).ellipse((0, 0, L - 1, L - 1), fill=255)
        tira.paste(im, (i * L, 0), m)
    tira.save(S.parent / '_ref/hero-tira.jpg', quality=85)
    b.close()
