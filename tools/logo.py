# -*- coding: utf-8 -*-
"""Reconstroi o simbolo oficial (circulo + picos + V) com geometria exata e simetrica,
medida sobre o logo do meulink (que estava achatado 4%). Gera assets/img/simbolo.svg via potrace.
Unidades: raio externo = 1. Uso: python tools/logo.py"""
import numpy as np, potrace
from pathlib import Path
S = Path(__file__).resolve().parent.parent
N = 2400; E = 1.16                      # grade N x N cobrindo [-E,E]
u = np.linspace(-E, E, N); U, V = np.meshgrid(u, u)
T = 0.211                               # espessura (anel, picos e V)
RI = 1 - T
BAND = (-0.105, 0.215)                  # faixa do nome (v cresce para baixo)
# pico: lado interno reto saindo do apice sobre o circulo externo
VA = -0.898; UA = -np.sqrt(1 - VA**2)*0 - 0.431
K = 0.308                               # du/dv da reta
k = np.hypot(1, K)
L1 = lambda v: UA + K*(v - VA)
L2 = lambda v: L1(v) - T*k              # paralela (borda do furo)
# V inferior
KV = 0.321; VAP = 1.105                 # inclinacao e apice
Vout = lambda v: -KV*(VAP - v)          # borda externa do braco esquerdo (u<0)
Vin = lambda v: Vout(v) + T*np.hypot(1, KV)
G = 0.062*np.hypot(1, KV)               # canal entre anel e V
r = np.hypot(U, V); A = np.abs(U)
cima = V < BAND[0]; baixo = V > BAND[1]
disco = r <= 1; furo = r < RI
pico = cima & disco & (-A <= -0) & (-A < L1(V)) & ~(furo & (-A < L2(V)))
pico = cima & disco & (-A < L1(V)) & ~(furo & (-A < L2(V)))
x = -A                                   # trabalha no lado esquerdo e espelha
vbraco = baixo & (x >= Vout(V)) & (x <= Vin(V)) | baixo & (x >= Vout(V)) & (Vin(V) >= 0)
canal = (x >= Vout(V) - G) & (x < Vout(V))
anel = baixo & disco & ~furo & ~canal & ~(x >= Vout(V))
M = pico | anel | vbraco
M = M | M[:, ::-1]
bm = potrace.Bitmap(~M)
path = bm.trace(turdsize=2, alphamax=0.0, opticurve=False)
def p2(pt):
    X = pt.x / N * 2*E - E; Y = -(pt.y / N * 2*E - E)
    return f'{X*100:.2f} {-Y*100:.2f}'
d = []
for c in path:
    d.append('M' + p2(c.start_point))
    for s in c:
        if s.is_corner: d.append('L' + p2(s.c) + 'L' + p2(s.end_point))
        else: d.append('C' + p2(s.c1) + ' ' + p2(s.c2) + ' ' + p2(s.end_point))
    d.append('Z')
D = ''.join(d)
(S / 'assets/img').mkdir(parents=True, exist_ok=True)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-116 -116 232 232"><path fill="currentColor" fill-rule="evenodd" d="{D}"/></svg>'
(S / 'assets/img/simbolo.svg').write_text(svg, encoding='utf8')
(S / 'tools/simbolo-path.txt').write_text(D, encoding='utf8')
from PIL import Image
Image.fromarray((M*255).astype('uint8')).resize((600, 600), Image.LANCZOS).save(S.parent / '_ref/simbolo-teste.png')
print(len(D), 'chars')
