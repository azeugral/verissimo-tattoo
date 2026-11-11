# -*- coding: utf-8 -*-
"""Quadros do hero de cobertura -> _ref/cob-tira.jpg. Uso: python tools/ver_cob.py [t1,t2,...]"""
import base64, io, sys, json
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
S = Path(__file__).resolve().parent.parent
TS = [float(x) for x in (sys.argv[1] if len(sys.argv) > 1 else '0.5,1.8,2.6,3.4,4.4,6.0,6.9,8.5').split(',')]
SEM = json.loads((S / 'tools/cob_sementes.json').read_text())
du = lambda f: 'data:image/webp;base64,' + base64.b64encode((S / 'assets/hero' / f).read_bytes()).decode()
pares = [[du(f'{k}-a.webp'), du(f'{k}-d.webp'), c] for k, c in SEM]
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 600, 'height': 800})
    g.set_content('<body style="margin:0;background:#000"><canvas id=c style="width:432px;height:540px"></canvas></body>')
    g.add_script_tag(content=(S / 'assets/js/cob.js').read_text(encoding='utf8'))
    g.evaluate("""async(P)=>{const L=async s=>{const m=new Image();m.src=s;await m.decode();return m};
      const ps=[];for(const p of P){ps.push([await L(p[0]),await L(p[1]),p[2]])}
      window.C=cobHero(document.getElementById('c'),ps,{guardar:true,tam:[432,540]})}""", pares)
    qs = []
    for t in TS:
        d = g.evaluate(f"(C.desenha({t},1),document.getElementById('c').toDataURL('image/jpeg',.9))")
        qs.append(Image.open(io.BytesIO(base64.b64decode(d.split(',', 1)[1]))))
    out = Image.new('RGB', (432 * 4, 540 * ((len(qs) + 3) // 4)))
    for i, q in enumerate(qs): out.paste(q, ((i % 4) * 432, (i // 4) * 540))
    out.save(S.parent / '_ref/cob-tira.jpg', quality=86)
    b.close()
