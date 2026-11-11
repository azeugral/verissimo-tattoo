# -*- coding: utf-8 -*-
"""Hero "galeria no chão": prepara as obras que entram nos quadros.
- Realismo: as melhores peças do portfólio (assets/img/trab/<peça>.webp, 1080x1350), recortadas com BiRefNet
  e gravadas em RGBA 720x900 (o quadro põe um fundo de estúdio por trás).
- Coberturas: os pares antes/depois já recortados do hero (assets/hero/<par>-a|d.webp, 1440x1800) em 880x1100.
Saída: assets/galeria/*.webp e _ref/capa/galeria.jpg (folha). Uso: python tools/galeria.py"""
from pathlib import Path
import numpy as np
from PIL import Image
from rembg import remove, new_session

S = Path(__file__).resolve().parent.parent
O = S / 'assets/galeria'; O.mkdir(exist_ok=True)
REAL = ['leao-chamas', 'urso', 'santa-rita', 'indigena', 'itachi', 'jesus-cor', 'ayrton-senna', 'musico',
        'retrato-asas', 'tigre', 'rosto-cosmico', 'samurai-pc']
COB = ['dragao', 'cerejeira', 'pastor', 'onca']
ses = new_session('birefnet-general-lite')
lst = []
for k in REAL:
    rgb = Image.open(S / 'assets/img/trab' / f'{k}.webp').convert('RGB')
    m = remove(rgb, session=ses, only_mask=True).convert('L')
    a = np.clip((np.asarray(m, np.float32) / 255 - .04) / .9, 0, 1)
    x = np.linspace(0, 1, rgb.width)[None, :]
    ss = lambda v: np.clip(v, 0, 1) ** 2 * (3 - 2 * np.clip(v, 0, 1))
    a *= ss(x / .07) * ss((1 - x) / .07)
    im = rgb.copy(); im.putalpha(Image.fromarray((a * 255 + .5).astype(np.uint8)))
    im.resize((720, 900), Image.LANCZOS).save(O / f'{k}.webp', 'WEBP', quality=84, method=6)
    lst.append(O / f'{k}.webp'); print(k, flush=True)
for c in COB:
    for s in 'ad':
        Image.open(S / 'assets/hero' / f'{c}-{s}.webp').resize((880, 1100), Image.LANCZOS).save(O / f'{c}-{s}.webp', 'WEBP', quality=84, method=6)
        lst.append(O / f'{c}-{s}.webp')
F = Image.new('RGB', (10 * 144, 2 * 180), (22, 20, 19))
for i, f in enumerate(lst):
    im = Image.open(f).convert('RGBA').resize((144, 180)); bg = Image.new('RGB', (144, 180), (22, 20, 19)); bg.paste(im, (0, 0), im)
    F.paste(bg, ((i % 10) * 144, (i // 10) * 180))
F.save(S.parent / '_ref/capa/galeria.jpg', quality=88)
print('total', round(sum(f.stat().st_size for f in lst) / 1e6, 2), 'MB')
