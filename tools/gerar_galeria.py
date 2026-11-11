# -*- coding: utf-8 -*-
"""Grava o hero "galeria no chão" em MP4 para o celular (800x1000, composição GALERIA.cel do galeria.js, 30 fps).
O vídeo abre com os quadros pousando no chão (INTRO = 2,4 s) e depois roda um ciclo inteiro de 52 s; no site, ao
terminar, ele volta para INTRO (estado idêntico ao do fim), então o laço não tem emenda. Também grava o pôster.
Precisa do servidor local: python -m http.server 8767 --bind 127.0.0.1. Uso: python tools/gerar_galeria.py"""
import base64, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
S = Path(__file__).resolve().parent.parent
W, H, FPS, INTRO, CICLO = 800, 1000, 30, 2.4, 52.0
URL = 'http://127.0.0.1:8767/'
saida = S / 'assets/video/galeria.mp4'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    g = b.new_page(viewport={'width': 400, 'height': 400})
    g.goto(URL + 'assets/galeria/galeria.json')
    g.evaluate("document.documentElement.innerHTML='<body style=margin:0><canvas id=c></canvas></body>'")
    g.add_script_tag(url=URL + 'assets/js/galeria.js')
    g.evaluate(f"""async()=>{{const meta=await (await fetch('/assets/galeria/galeria.json')).json();const imgs={{}};
      const Q=GALERIA.cel.map(q=>Object.assign({{}},q));const ns=new Set();
      Q.forEach(q=>q.cob!=null?['dragao','cerejeira','pastor','onca'].forEach(n=>{{ns.add(n+'-a');ns.add(n+'-d')}}):q.arts.forEach(n=>ns.add(n)));
      for(const n of ns){{const m=new Image();m.src='/assets/galeria/'+n+'.webp';await m.decode();imgs[n]=m}}
      const cv=document.getElementById('c');window.G=galeria(cv,{{imgs,meta,quadros:Q,fundo:[.9,1],guardar:true,tam:[{W},{H}]}});
      window.QUADRO=t=>{{G.desenha(t,1,[0,0]);return cv.toDataURL('image/jpeg',.94)}}}}""")
    (S / 'assets/video/galeria.jpg').write_bytes(base64.b64decode(g.evaluate('QUADRO(11)').split(',', 1)[1]))
    n = int(round((INTRO + CICLO) * FPS))
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-vf', 'scale=in_range=full:out_range=limited', '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-tune', 'film',
                           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', str(FPS * 2),
                           '-force_key_frames', str(INTRO), '-movflags', '+faststart', '-an', str(saida)], stdin=subprocess.PIPE)
    for k in range(n):
        d = g.evaluate(f"QUADRO({k / FPS})")
        ff.stdin.write(base64.b64decode(d.split(',', 1)[1]))
        if k % 300 == 0: print(k, '/', n, flush=True)
    ff.stdin.close(); ff.wait()
    b.close()
print('mp4', round(saida.stat().st_size / 1e6, 2), 'MB')
