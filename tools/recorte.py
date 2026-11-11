# -*- coding: utf-8 -*-
"""Recorta o corpo (braço, ombro, perna) das fotos de cobertura do hero: sai o quarto, a camiseta
de fundo e o piso; a tatuagem fica sobre transparência. Roda depois de tools/cob_hero.py.
Bordas retas do enquadramento (topo e laterais da foto) somem num degradê de alfa.
Saída: assets/hero/<slug>-a.webp e -d.webp em RGBA. Uso: python tools/recorte.py"""
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter
from rembg import remove, new_session
S = Path(__file__).resolve().parent.parent
H = S / 'assets/hero'
ses = new_session('u2net_human_seg')
folha = Image.new('RGB', (8 * 216, 270), (10, 10, 11))
for i, k in enumerate(['dragao-a', 'dragao-d', 'cerejeira-a', 'cerejeira-d', 'pastor-a', 'pastor-d', 'onca-a', 'onca-d']):
    rgb = Image.open(S.parent / '_ref/hero-rgb' / f'{k}.webp').convert('RGB') if (S.parent / '_ref/hero-rgb' / f'{k}.webp').exists() else Image.open(H / f'{k}.webp').convert('RGB')
    (S.parent / '_ref/hero-rgb').mkdir(exist_ok=True); rgb.save(S.parent / '_ref/hero-rgb' / f'{k}.webp', quality=95)
    m = remove(rgb, session=ses, only_mask=True).convert('L')
    a = np.asarray(m.filter(ImageFilter.GaussianBlur(1.6)), np.float32) / 255
    a = np.clip((a - .08) / .84, 0, 1)
    h, w = a.shape
    y = np.linspace(0, 1, h)[:, None]; x = np.linspace(0, 1, w)[None, :]
    ss = lambda e0, e1, v: np.clip((v - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((v - e0) / (e1 - e0), 0, 1))
    a *= ss(0, .3, y) * ss(0, .05, 1 - y) * ss(0, .05, x) * ss(0, .05, 1 - x)
    out = rgb.copy(); out.putalpha(Image.fromarray((a * 255 + .5).astype(np.uint8)))
    out.save(H / f'{k}.webp', 'WEBP', quality=88, method=6)
    bg = Image.new('RGB', rgb.size, (10, 10, 11)); bg.paste(out, (0, 0), out)
    folha.paste(bg.resize((216, 270)), (i * 216, 0))
    print(k, round((H / f'{k}.webp').stat().st_size / 1e3), 'KB')
folha.save(S.parent / '_ref/recorte/folha-final.jpg', quality=88)
