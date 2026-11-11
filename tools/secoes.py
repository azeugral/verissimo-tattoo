# -*- coding: utf-8 -*-
"""Print de cada secao num tamanho (padrao 390x844 celular). Uso: python tools/secoes.py [larg] [alt]"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
w = int(sys.argv[1]) if len(sys.argv) > 1 else 390; h = int(sys.argv[2]) if len(sys.argv) > 2 else 844
O = Path(__file__).resolve().parent.parent.parent / '_ref/telas'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    m = w < 860
    g = b.new_page(viewport={'width': w, 'height': h}, is_mobile=m, has_touch=m, device_scale_factor=1)
    g.goto('http://127.0.0.1:8765/', wait_until='load')
    g.evaluate("document.querySelectorAll('.rev,.card').forEach(e=>e.classList.add('vis'));document.querySelectorAll('img').forEach(i=>i.loading='eager')")
    g.wait_for_timeout(2500)
    ims = []
    for s in ['.numeros', '#trabalhos', '#coberturas', '#metodo', '#sobre', '#depoimentos', '#estudios', '#orcamento', '.rodape']:
        f = O / f'sec-{w}-{s.strip(".#")}.png'; g.locator(s).screenshot(path=str(f)); ims.append(Image.open(f))
    # monta em colunas
    cols = 5 if m else 2; esc = 1 if m else .5
    ims = [i.resize((int(i.width * esc), int(i.height * esc))) for i in ims]
    linhas = [ims[k:k + cols] for k in range(0, len(ims), cols)]
    W = max(sum(i.width for i in l) for l in linhas) + 10 * cols
    H = sum(max(i.height for i in l) for l in linhas)
    out = Image.new('RGB', (W, H), (60, 60, 60)); y = 0
    for l in linhas:
        x = 0
        for i in l: out.paste(i, (x, y)); x += i.width + 10
        y += max(i.height for i in l)
    out.save(O / f'secoes-{w}.jpg', quality=80)
    b.close()
