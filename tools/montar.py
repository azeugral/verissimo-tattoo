# -*- coding: utf-8 -*-
"""Monta index.html a partir de tools/index.tpl.html (simbolo inline) e gera os favicons.
Uso: python tools/montar.py"""
import io, json
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
S = Path(__file__).resolve().parent.parent
D = (S / 'tools/simbolo-path.txt').read_text(encoding='utf8')
(S / 'index.html').write_text((S / 'tools/index.tpl.html').read_text(encoding='utf8').replace('{{SIMBOLO}}', D), encoding='utf8')

# favicon: simbolo marfim sobre preto, quadrado com respiro; versao svg adaptavel
fav = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-128 -128 256 256">'
       '<rect x="-128" y="-128" width="256" height="256" fill="#0a0a0b"/>'
       f'<path fill="#efe9e0" fill-rule="evenodd" transform="scale(.88)" d="{D}"/></svg>')
(S / 'assets/img/favicon.svg').write_text(fav, encoding='utf8')
mask = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-160 -160 320 320">'
        '<rect x="-160" y="-160" width="320" height="320" fill="#0a0a0b"/>'
        f'<path fill="#efe9e0" fill-rule="evenodd" transform="scale(.82)" d="{D}"/></svg>')
def png(svg, lado):
    g.set_viewport_size({'width': lado, 'height': lado})
    g.set_content(f'<body style="margin:0">{svg.replace("<svg", f"<svg width={lado} height={lado}")}</body>')
    return Image.open(io.BytesIO(g.screenshot()))
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); g = b.new_page()
    png(fav, 180).save(S / 'assets/img/apple-touch-icon.png')
    png(mask, 192).save(S / 'assets/img/icon-192.png')
    png(mask, 512).save(S / 'assets/img/icon-512.png')
    grande = png(fav, 256)
    grande.save(S / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    b.close()
(S / 'site.webmanifest').write_text(json.dumps({
    'name': 'Veríssimo Tattoo Artist', 'short_name': 'Veríssimo', 'start_url': './', 'display': 'standalone',
    'background_color': '#0a0a0b', 'theme_color': '#0a0a0b',
    'icons': [{'src': 'assets/img/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any maskable'},
              {'src': 'assets/img/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]},
    ensure_ascii=False, indent=1), encoding='utf8')
print('ok')
