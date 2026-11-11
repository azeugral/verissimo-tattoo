# -*- coding: utf-8 -*-
"""Grava o hero (capa de revista) em MP4 para o celular (864x1080, 4 coberturas x 8 s = 32 s, 30 fps, loop perfeito):
fundo preto, símbolo em linha laranja (círculo de 640 px no centro, igual ao .simb-g do CSS) e a peça
recortada a 82%, centrada e apoiada na base, (igual ao scale(.82) do CSS do celular) com a cobertura por cima. Também refaz a capa 1200x630. Uso: python tools/gerar_video.py"""
import base64, json, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
S = Path(__file__).resolve().parent.parent
SEM = json.loads((S / 'tools/cob_sementes.json').read_text())
W, H, FPS, P, DS, ESC = 864, 1080, 30, 8.0, 640, 1.0
du = lambda f: 'data:image/webp;base64,' + base64.b64encode((S / 'assets/hero' / f).read_bytes()).decode()
pares = [[du(f'{k}-a.webp'), du(f'{k}-d.webp'), c] for k, c in SEM]
D = (S / 'tools/simbolo-path.txt').read_text(encoding='utf8')
svg = lambda px: ('data:image/svg+xml;base64,' + base64.b64encode((f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-116 -116 232 232" width="{px}" height="{px}">'
       f'<path d="{D}" fill="none" stroke="#ff5a1f" stroke-width=".5" stroke-linejoin="round" opacity=".92"/></svg>').encode()).decode())
saida = S / 'assets/video/cobertura.mp4'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 400, 'height': 400})
    g.set_content(f'<body style="margin:0"><canvas id=c style="width:{W}px;height:{H}px"></canvas><canvas id=o width={W} height={H}></canvas></body>')
    g.add_script_tag(content=(S / 'assets/js/cob.js').read_text(encoding='utf8'))
    g.evaluate(f"""async(a)=>{{const L=async s=>{{const m=new Image();m.src=s;await m.decode();return m}};
      const ps=[];for(const p of a.P){{ps.push([await L(p[0]),await L(p[1]),p[2]])}}
      window.C=cobHero(document.getElementById('c'),ps,{{guardar:true,tam:[{W},{H}]}});
      const sb=await L(a.s), fx=document.getElementById('o').getContext('2d');
      window.FUNDO=(x,w,h,d)=>{{x.fillStyle='#0a0a0b';x.fillRect(0,0,w,h)}};
      window.QUADRO=(t)=>{{C.desenha(t,1);FUNDO(fx,{W},{H},{DS});fx.drawImage(document.getElementById('c'),{W}*(1-{ESC})/2,{H}*(1-{ESC}),{W}*{ESC},{H}*{ESC});
        return document.getElementById('o').toDataURL('image/jpeg',.94)}};
      const cv=document.createElement('canvas');cv.width=1200;cv.height=630;const k=cv.getContext('2d');FUNDO(k,1200,630,600);
      k.drawImage(ps[0][1],348,0,504,630);window.CAPA=cv.toDataURL('image/jpeg',.9)}}""", {'P': pares, 's': svg(DS)})
    n = int(round(P * len(pares) * FPS))
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-vf', 'scale=in_range=full:out_range=limited', '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-tune', 'film',
                           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', str(FPS * 2),
                           '-movflags', '+faststart', '-an', str(saida)], stdin=subprocess.PIPE)
    for k in range(n):
        d = g.evaluate(f"QUADRO({k / FPS})")
        ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
        if k % 240 == 0: print(k, '/', n, flush=True)
    ff.stdin.close(); ff.wait()
    (S / 'assets/img/capa.jpg').write_bytes(base64.b64decode(g.evaluate('CAPA').split(',', 1)[1]))
    b.close()
print('mp4', round(saida.stat().st_size / 1e6, 2), 'MB')
