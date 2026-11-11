# Veríssimo Tattoo Artist · prévia

Site de apresentação do Alexandre Veríssimo (@verissimotattoo), realismo colorido, preto e cinza e coberturas, com estúdios em Maringá (PR) e Goiânia (GO). Feito por [L R G Z](https://lrgz.com.br).

**Conceito do hero (v3), "cobertura ao vivo" sobre o símbolo:** o símbolo oficial dele se desenha atrás, em linha laranja fina e enorme. Na frente, a peça recortada (só o corpo, sem quarto nem camiseta) recebe uma cobertura real: a tatuagem antiga aparece, a tinta preta avança com a borda molhada, entra o preto e cinza e a cor vem logo atrás. Passa pelas 4 coberturas do Instagram (dragão, cerejeira, pastor-alemão e, por último, a onça), com barras de progresso e "Antes / Cobrindo / Depois" no topo e o nome VERÍSSIMO na base. No PC roda em WebGL com transparência (`assets/js/cob.js`), com colunas espelhadas (Realismo e Coberturas à esquerda, Desde 1994 e Estúdios à direita). No celular, o MP4 do mesmo shader já com o símbolo (`assets/video/cobertura.mp4`, 32 s em loop) de ponta a ponta; se o iPhone recusar o vídeo, o shader assume com o símbolo em SVG no mesmo lugar.

**Identidade:** símbolo oficial reconstruído em vetor com geometria exata e simétrica (`tools/logo.py`; o arquivo do meulink estava achatado 4%), preto do estúdio, marfim e o laranja do neon da fachada. Títulos em Antonio condensada (a mesma família do "TATTOO ARTIST" do letreiro), Lexend Exa no logotipo e no menu, Instrument Sans no texto, tudo self-hosted. Sobre com a foto de perfil atual do Instagram (ele tatuando). Favicon, ícones e manifest em `tools/montar.py`.

## Ferramentas
- `tools/fotos.py`: recortes 4:5 do portfólio, pares de cobertura, retrato e `assets/js/dados.js`.
- `tools/cob_hero.py`: pares do hero em 1080x1350 (`assets/hero/`); pontos de partida da tinta em `tools/cob_sementes.json`. `tools/recorte.py`: recorta o corpo com rembg (u2net_human_seg) e grava os pares com alfa (originais em `../_ref/hero-rgb`).
- `tools/logo.py`: símbolo em SVG. `tools/montar.py`: gera `index.html` a partir de `tools/index.tpl.html` + favicons.
- `tools/gerar_video.py`: MP4 do hero, pôster e capa (og). `tools/ver_cob.py`: tira de quadros do shader.
- `tools/auditar.py`: 13 tamanhos, transbordo e eixo no celular (tudo ok na publicação). `tools/telas.py`, `tools/secoes.py`: prints.

## CONFIRMAR com o Veríssimo
- WhatsApp 44 99176-1485 para orçamento (o meulink tem 44 9176-1485 sem o 9).
- "+75 prêmios" (arte da Tattoo Week) e "30+ anos": manter?
- Anos da trajetória: 1994 (Brasília), 1996 (Guará), Inked 2025, júri 2025/2026, Mast Pro Team 2026. Ano de abertura de Maringá e Goiânia.
- Horários: Google mostra Maringá até 18h e Goiânia até 20h; no site ficou "horário marcado".
- Autorização dos clientes para fotos e para as 3 avaliações do Google (Marcelo J., Donnie B., Highilander S.).
- Foto do estúdio: qual cidade? Retrato = foto de perfil atual do Instagram.
- Autorização dos 4 clientes das coberturas que aparecem no hero.
- Tropicalderm e Barbearia Navalhett: quer citar no site?
- Domínio; tirar `noindex` e `robots.txt` ao publicar.
