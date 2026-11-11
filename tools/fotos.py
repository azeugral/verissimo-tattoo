# -*- coding: utf-8 -*-
"""Recorta as fotos do Instagram (_ref/hd) em 4:5 e gera WebP grande + miniatura,
os pares de cobertura, o retrato e as pecas quadradas do hero. Escreve assets/js/dados.js.
Uso: python tools/fotos.py"""
import json
from pathlib import Path
from PIL import Image, ImageEnhance
S = Path(__file__).resolve().parent.parent
R = S.parent / '_ref'
D = json.load(open(R / 'ig/dados.json', encoding='utf8'))
src = lambda k: R / 'hd' / D[int(k.split('.')[0])]['imgs'][int(k.split('.')[1])]['f']

def crop45(im, fy=.5, fx=.5, zoom=1.0):
    W, H = im.size
    w = min(W, H * 4 / 5) / zoom; h = w * 5 / 4
    x = (W - w) * fx; y = (H - h) * fy
    return im.crop((round(x), round(y), round(x + w), round(y + h)))

def salva(im, nome, larg):
    out = S / 'assets/img' / nome; out.parent.mkdir(parents=True, exist_ok=True)
    im.resize((larg, round(larg * im.height / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=84, method=6)

# id, slug, titulo, categoria, cobertura, fy, zoom
TRAB = [
 ('3.0', 'leao-chamas', 'Leão em chamas', 'cor', 0, .32, 1.0),
 ('93.1', 'rosto-cosmico', 'Rosto cósmico', 'cor', 0, .45, 1.0),
 ('61.1', 'olho-fe', 'Olho com a cruz', 'cor', 0, .55, 1.0),
 ('86.0', 'dragao-verde', 'Dragão oriental', 'cor', 1, .4, 1.0),
 ('97.0', 'retrato-asas', 'Retrato com asas', 'pc', 0, .5, 1.0),
 ('85.0', 'tigre', 'Tigre e ondas', 'cor', 0, .5, 1.0),
 ('99.1', 'cobras-costas', 'Najas nas costas', 'pc', 0, .5, 1.0),
 ('77.0', 'samurai-cor', 'Samurai', 'cor', 0, .5, 1.0),
 ('80.0', 'harpia', 'Harpia', 'pc', 0, .5, 1.0),
 ('107.0', 'ayrton-senna', 'Ayrton Senna', 'cor', 0, .42, 1.0),
 ('79.0', 'sao-miguel', 'São Miguel Arcanjo', 'pc', 0, .5, 1.0),
 ('101.0', 'arara', 'Arara e mata', 'cor', 1, .5, 1.0),
 ('87.0', 'santa-rita', 'Santa Rita de Cássia', 'pc', 0, .42, 1.0),
 ('72.0', 'jesus-cor', 'Jesus e Harley-Davidson', 'cor', 0, .5, 1.0),
 ('52.0', 'urso', 'Urso das florestas do Canadá', 'pc', 0, .38, 1.0),
 ('105.0', 'itachi', 'Itachi Uchiha', 'cor', 0, .5, 1.0),
 ('83.0', 'indigena', 'Indígena', 'pc', 0, .5, 1.0),
 ('57.1', 'aguia', 'Águia e medalha', 'cor', 0, .5, 1.0),
 ('69.0', 'pastor-alemao', 'Pastor-alemão', 'pc', 1, .5, 1.0),
 ('10.0', 'caravela', 'Caravela', 'cor', 1, .42, 1.0),
 ('24.0', 'samurai-pc', 'Samurai', 'pc', 0, .5, 1.0),
 ('96.0', 'cerejeira', 'Flores de cerejeira', 'cor', 1, .5, 1.0),
 ('102.0', 'musico', 'Músico e guitarra', 'pc', 0, .5, 1.0),
 ('9.0', 'rinoceronte', 'Rinoceronte branco', 'pc', 0, .45, 1.0),
]
dados = []
for k, slug, tit, cat, cob, fy, z in TRAB:
    im = crop45(Image.open(src(k)).convert('RGB'), fy=fy, zoom=z)
    salva(im, f'trab/{slug}.webp', min(1080, im.width)); salva(im, f'trab/{slug}-p.webp', 540)
    dados.append({'s': slug, 't': tit, 'c': cat, 'k': cob})

# coberturas: antes -> depois
PARES = [('dragao', '86.3', '86.0', 'Dragão antigo virou dragão oriental', .45, .4),
         ('cerejeira', '96.3', '96.0', 'Flores de cerejeira sobre tatuagem antiga', .4, .5),
         ('pastor', '69.3', '69.0', 'Retrato do pastor-alemão sobre a caveira', .5, .5),
         ('onca', '101.7', '101.3', 'Onça antiga virou onça e mata', .5, .6)]
pares = []
for slug, a, b, tit, fa, fb in PARES:
    salva(crop45(Image.open(src(a)).convert('RGB'), fy=fa), f'cob/{slug}-antes.webp', 720)
    salva(crop45(Image.open(src(b)).convert('RGB'), fy=fb), f'cob/{slug}-depois.webp', 720)
    pares.append({'s': slug, 't': tit})

# retrato: foto de perfil atual do Instagram (ele tatuando), 4:5
r = Image.open(R / 'perfil-1080.jpg').convert('RGB'); r = r.crop((108, 0, 972, 1080)); salva(r, 'verissimo.webp', 864)
e = Image.open(src('103.1')).convert('RGB'); salva(e.crop((0, 225, 1440, 1575)), 'estudio.webp', 1440)

(S / 'assets/js/dados.js').parent.mkdir(parents=True, exist_ok=True)
(S / 'assets/js/dados.js').write_text('window.TRAB=' + json.dumps(dados, ensure_ascii=False) + ';window.COB=' + json.dumps(pares, ensure_ascii=False) + ';', encoding='utf8')
print(len(dados), 'trabalhos', len(pares), 'pares')
