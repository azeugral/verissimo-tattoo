# -*- coding: utf-8 -*-
"""Grava o hero em MP4 para o celular (1080x1080, 4 pecas x 6,5 s = 26 s, 30 fps, loop perfeito),
o poster (leao em cor) e a capa 1200x630 para redes. Uso: python tools/gerar_video.py"""
import base64, io, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
S = Path(__file__).resolve().parent.parent
NOMES = ['leao', 'olho', 'dragao', 'itachi']
LADO, FPS, P = 1080, 30, 6.5
b64 = lambda f: 'data:image/webp;base64,' + base64.b64encode((S / f).read_bytes()).decode()
(S / 'assets/video').mkdir(exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 400, 'height': 400})
    g.set_content('<body style="margin:0"><canvas id=c></canvas></body>')
    g.add_script_tag(content=(S / 'assets/js/hero.js').read_text(encoding='utf8'))
    g.evaluate("""async(a)=>{window.H=veroHero(document.getElementById('c'),{guardar:true});
      for(let i=0;i<a.length;i++){const m=new Image();m.src=a[i];await m.decode();H.textura(i,m)}}""", [b64(f'assets/hero/{n}.webp') for n in NOMES])
    quadro = lambda t, q=.95: Image.open(io.BytesIO(base64.b64decode(g.evaluate(
        f"(H.desenha({t},{LADO},1),document.getElementById('c').toDataURL('image/jpeg',{q}))").split(',', 1)[1]))).convert('RGB')
    pst = quadro(4.4, .97); pst.save(S / 'assets/img/hero-poster.webp', quality=86, method=6)
    n = int(P * len(NOMES) * FPS)
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-tune', 'film',
                           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', str(FPS * 2),
                           '-movflags', '+faststart', '-an', str(S / 'assets/video/hero.mp4')], stdin=subprocess.PIPE)
    for k in range(n):
        d = g.evaluate(f"(H.desenha({k / FPS},{LADO},1),document.getElementById('c').toDataURL('image/jpeg',.94))")
        ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
        if k % 120 == 0: print(k, '/', n, flush=True)
    ff.stdin.close(); ff.wait(); b.close()

# capa 1200x630: lente no centro, preto, simbolo nao (texto na imagem fica a cargo do og:title)
capa = Image.new('RGB', (1200, 630), (10, 10, 11))
D = 500; m = Image.new('L', (D * 4, D * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, D * 4 - 1, D * 4 - 1), fill=255)
m = m.resize((D, D), Image.LANCZOS)
capa.paste(pst.resize((D, D), Image.LANCZOS), (350, 65), m)
ImageDraw.Draw(capa).ellipse((349, 64, 851, 566), outline=(255, 90, 31), width=2)
capa.save(S / 'assets/img/capa.jpg', quality=88)
print('mp4', round((S / 'assets/video/hero.mp4').stat().st_size / 1e6, 2), 'MB')
