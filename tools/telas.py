# -*- coding: utf-8 -*-
"""Telas para revisao: hero em varios tamanhos + pagina inteira em PC e celular. Saida: _ref/telas/.
Uso: python tools/telas.py [url]"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
S = Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else (S / 'index.html').as_uri()
O = S.parent / '_ref/telas'; O.mkdir(parents=True, exist_ok=True)
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=ARGS)
    for w, h, cel in [(1440, 900, 0), (1920, 1080, 0), (1280, 720, 0), (390, 844, 1), (320, 640, 1), (768, 1024, 1), (844, 390, 1)]:
        g = b.new_page(viewport={'width': w, 'height': h}, is_mobile=bool(cel), has_touch=bool(cel), device_scale_factor=1)
        g.goto(URL, wait_until='load'); g.wait_for_timeout(3600)
        g.screenshot(path=str(O / f'hero-{w}x{h}.png'))
        if (w, h) in [(1440, 900), (390, 844)]:
            g.evaluate("document.querySelectorAll('.rev,.card,.revela,.passos').forEach(e=>e.classList.add('vis'))")
            g.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
            g.wait_for_timeout(1500)
            g.screenshot(path=str(O / f'pagina-{w}.png'), full_page=True)
        g.close()
    b.close()
