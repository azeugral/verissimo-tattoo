# -*- coding: utf-8 -*-
"""Grava o hero "cobertura ao vivo" em MP4 para o celular (864x1080, 4 coberturas x 8 s = 32 s,
30 fps, loop perfeito) e a capa 1200x630 para redes. Uso: python tools/gerar_video.py"""
import base64, io, json, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageFilter
S = Path(__file__).resolve().parent.parent
SEM = json.loads((S / 'tools/cob_sementes.json').read_text())
W, H, FPS, P = 864, 1080, 30, 8.0
du = lambda f: 'data:image/webp;base64,' + base64.b64encode((S / 'assets/hero' / f).read_bytes()).decode()
pares = [[du(f'{k}-a.webp'), du(f'{k}-d.webp'), c] for k, c in SEM]
(S / 'assets/video').mkdir(exist_ok=True)
saida = S / 'assets/video/cobertura.mp4'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 400, 'height': 400})
    g.set_content(f'<body style="margin:0"><canvas id=c style="width:{W}px;height:{H}px"></canvas></body>')
    g.add_script_tag(content=(S / 'assets/js/cob.js').read_text(encoding='utf8'))
    g.evaluate(f"""async(P)=>{{const L=async s=>{{const m=new Image();m.src=s;await m.decode();return m}};
      const ps=[];for(const p of P){{ps.push([await L(p[0]),await L(p[1]),p[2]])}}
      window.C=cobHero(document.getElementById('c'),ps,{{guardar:true,tam:[{W},{H}]}})}}""", pares)
    n = int(round(P * len(pares) * FPS))
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-tune', 'film',
                           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', str(FPS * 2),
                           '-movflags', '+faststart', '-an', str(saida)], stdin=subprocess.PIPE)
    for k in range(n):
        d = g.evaluate(f"(C.desenha({k / FPS},1),document.getElementById('c').toDataURL('image/jpeg',.94))")
        ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
        if k % 150 == 0: print(k, '/', n, flush=True)
    ff.stdin.close(); ff.wait(); b.close()

# capa 1200x630: o dragão pronto no eixo, laterais com a mesma foto desfocada
dep = Image.open(S / 'assets/hero/dragao-d.webp').convert('RGB')
capa = dep.resize((1200, 1500), Image.LANCZOS).crop((0, 435, 1200, 1065)).filter(ImageFilter.GaussianBlur(30))
capa = Image.blend(capa, Image.new('RGB', capa.size, (10, 10, 11)), .62)
capa.paste(dep.resize((504, 630), Image.LANCZOS), (348, 0))
capa.save(S / 'assets/img/capa.jpg', quality=88)
print('mp4', round(saida.stat().st_size / 1e6, 2), 'MB')
