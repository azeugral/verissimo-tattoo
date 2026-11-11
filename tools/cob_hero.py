# -*- coding: utf-8 -*-
"""Pares de cobertura do hero em 4:5 (1080x1350): antes e depois enquadrados no mesmo ponto
da tatuagem, para a tinta nova cobrir a antiga no mesmo lugar. Uso: python tools/cob_hero.py"""
import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
S = Path(__file__).resolve().parent.parent
import json
R = S.parent / '_ref'
D = json.load(open(R / 'ig/dados.json', encoding='utf8'))
src = lambda k: R / 'hd' / D[int(k.split('.')[0])]['imgs'][int(k.split('.')[1])]['f']
# slug, antes, depois, (cx, cy, largura) em fração da foto para antes e depois
PARES = [
 ('dragao', '86.3', '86.0', (.50, .52, 1.0), (.50, .50, 1.0)),
 ('arara', '101.5', '101.0', (.50, .55, 1.0), (.50, .50, 1.0)),
 ('cerejeira', '96.3', '96.0', (.50, .50, 1.0), (.50, .50, 1.0)),
 ('pastor', '69.3', '69.0', (.50, .52, 1.0), (.50, .50, 1.0)),
]
def corta(im, cx, cy, z):
    W, H = im.size
    w = min(W, H * 4 / 5) * z; h = w * 5 / 4
    x = min(max(cx * W - w / 2, 0), W - w); y = min(max(cy * H - h / 2, 0), H - h)
    return im.crop((round(x), round(y), round(x + w), round(y + h))).resize((1080, 1350), Image.LANCZOS)
out = S / 'assets/hero'; out.mkdir(exist_ok=True)
folha = Image.new('RGB', (8 * 270, 338))
for i, (slug, a, b, pa, pb) in enumerate(PARES):
    for j, (k, p, suf) in enumerate([(a, pa, 'a'), (b, pb, 'd')]):
        im = Image.open(src(k)).convert('RGB'); print(slug, suf, im.size)
        c = corta(im, *p); c.save(out / f'{slug}-{suf}.webp', 'WEBP', quality=86, method=6)
        folha.paste(c.resize((270, 338)), ((i * 2 + j) * 270, 0))
folha.save(S.parent / '_ref/cob-hero.jpg')
