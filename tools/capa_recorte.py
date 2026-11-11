# -*- coding: utf-8 -*-
"""Hero "capa de revista": recortes em alta das fotos de cobertura (antes e depois).
1) amplia 4x com Real-ESRGAN e mistura 50% com Lanczos (nitidez sem cara de plástico);
2) recorta o corpo com BiRefNet (rembg birefnet-general-lite), bem melhor que o u2net no cabelo e no ombro;
3) o topo fica sem degradê (a foto encosta no alto da tela); só as laterais que tocam a borda da foto somem suave.
Entrada: _ref/hero-rgb/<peça>-a|d.webp (1080x1350). Saída: assets/hero/<peça>-a|d.webp RGBA 1440x1800.
Uso: python tools/capa_recorte.py"""
import subprocess, tempfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

S = Path(__file__).resolve().parent.parent
R = S.parent / '_ref'
ESR = S.parent.parent / '_ferramentas/realesrgan'
W, H = 1440, 1800
ses = new_session('birefnet-general-lite')
folha = Image.new('RGB', (8 * 240, 300), (10, 10, 11))
for i, k in enumerate(['dragao-a', 'dragao-d', 'cerejeira-a', 'cerejeira-d', 'pastor-a', 'pastor-d', 'onca-a', 'onca-d']):
    rgb = Image.open(R / 'hero-rgb' / f'{k}.webp').convert('RGB')
    with tempfile.TemporaryDirectory() as td:
        ent, sai = Path(td) / 'e.png', Path(td) / 's.png'
        rgb.save(ent)
        subprocess.run([str(ESR / 'realesrgan-ncnn-vulkan.exe'), '-i', str(ent), '-o', str(sai), '-n', 'realesrgan-x4plus', '-m', str(ESR / 'models')],
                       check=True, capture_output=True)
        x4 = Image.open(sai).convert('RGB').resize((W, H), Image.LANCZOS)
    lz = rgb.resize((W, H), Image.LANCZOS)
    alta = Image.blend(x4, lz, .5).filter(ImageFilter.UnsharpMask(1.2, 40, 2))
    m = remove(rgb, session=ses, only_mask=True).convert('L').resize((W, H), Image.LANCZOS)
    a = np.asarray(m, np.float32) / 255
    a = np.clip((a - .04) / .9, 0, 1)
    x = np.linspace(0, 1, W)[None, :]
    ss = lambda v: np.clip(v, 0, 1) ** 2 * (3 - 2 * np.clip(v, 0, 1))
    a *= ss(x / .09) * ss((1 - x) / .09)
    out = alta.copy(); out.putalpha(Image.fromarray((a * 255 + .5).astype(np.uint8)))
    out.save(S / 'assets/hero' / f'{k}.webp', 'WEBP', quality=84, method=6)
    bg = Image.new('RGB', (W, H), (10, 10, 11)); bg.paste(out, (0, 0), out)
    folha.paste(bg.resize((240, 300)), (i * 240, 0))
    print(k, round((S / 'assets/hero' / f'{k}.webp').stat().st_size / 1e3), 'KB', flush=True)
folha.save(R / 'capa/recortes.jpg', quality=88)
