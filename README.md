# Veríssimo Tattoo Artist · prévia

Site de apresentação do Alexandre Veríssimo (@verissimotattoo), realismo colorido, preto e cinza e coberturas, com estúdios em Maringá (PR) e Goiânia (GO). Feito por [L R G Z](https://lrgz.com.br).

**Conceito do hero (v5), "galeria no chão":** obras do Veríssimo em quadros estilizados (laca preta com passe-partout marfim, nogueira com passe-partout preto, filete de bronze) largados num chão de concreto escuro sob luz quente, com sombra, vidro e leve paralaxe do mouse. Em cada quadro uma obra cobre a anterior com tinta (borda molhada, preto e cinza, depois a cor), em onda, um quadro depois do outro (13 s por troca). No quadro do centro alternam coberturas reais e os dois posts mais virais dele: dragão (cobertura), Ayrton Senna, pastor-alemão (cobertura), músico; cerejeira e onça saíram por recorte fraco. Nos outros, realismo do portfólio (leão, Jesus, Santa Rita, tigre, Itachi, retrato com asas, indígena, rosto cósmico, samurai, urso). Embaixo, no eixo e sem nada por cima: VERÍSSIMO, a linha "Tattoo artist desde 1994 · Realismo e coberturas · Maringá e Goiânia" e os dois botões. No PC roda em WebGL (`assets/js/galeria.js`, composições `GALERIA.pc` e `GALERIA.baixa` para celular deitado); no celular em pé, MP4 4:5 `assets/video/galeria.mp4` (abre com os quadros pousando e volta para 2,4 s no fim, laço sem emenda); se o iPhone recusar o vídeo, o shader assume. A v4 (capa de revista, `cob.js`) ficou só como histórico.

**Identidade:** símbolo oficial reconstruído em vetor com geometria exata e simétrica (`tools/logo.py`; o arquivo do meulink estava achatado 4%), preto do estúdio, marfim e o laranja do neon da fachada. Títulos em Antonio condensada (a mesma família do "TATTOO ARTIST" do letreiro), Lexend Exa no logotipo e no menu, Instrument Sans no texto, tudo self-hosted. Sobre com a foto de perfil atual do Instagram (ele tatuando). Favicon, ícones e manifest em `tools/montar.py`.

## Ferramentas
- `tools/fotos.py`: recortes 4:5 do portfólio, pares de cobertura, retrato e `assets/js/dados.js`.
- `tools/cob_hero.py`: pares do hero em 1080x1350 (`assets/hero/`); pontos de partida da tinta em `tools/cob_sementes.json`. `tools/capa_recorte.py`: amplia 4x com Real-ESRGAN (50% com Lanczos), recorta o corpo com rembg BiRefNet (birefnet-general-lite) e grava os pares RGBA 1440x1800 (originais em `../_ref/hero-rgb`). O `tools/recorte.py` (u2net) ficou só como histórico.
- `tools/logo.py`: símbolo em SVG. `tools/montar.py`: gera `index.html` a partir de `tools/index.tpl.html` + favicons.
- `tools/galeria.py`: recorta as obras dos quadros (BiRefNet) em `assets/galeria/`; enquadramento de cada uma em `assets/galeria/galeria.json` ([cx, cy, zoom]). `tools/gerar_galeria.py`: MP4 do celular e pôster (precisa do servidor local na 8767). `tools/gerar_video.py` e `tools/ver_cob.py` são da v4.
- `tools/auditar.py`: 13 tamanhos, transbordo e eixo no celular (tudo ok na publicação). `tools/telas.py`, `tools/secoes.py`: prints.

## CONFIRMAR com o Veríssimo
- WhatsApp 44 99176-1485 para orçamento (o meulink tem 44 9176-1485 sem o 9).
- "+75 prêmios" (arte da Tattoo Week) e "30+ anos": manter?
- Anos da trajetória: 1994 (Brasília), 1996 (Guará), Inked 2025, júri 2025/2026, Mast Pro Team 2026. Ano de abertura de Maringá e Goiânia.
- Horários: Google mostra Maringá até 18h e Goiânia até 20h; no site ficou "horário marcado".
- Autorização dos clientes para fotos e para as 3 avaliações do Google (Marcelo J., Donnie B., Highilander S.).
- Foto do estúdio: qual cidade? Retrato = foto de perfil atual do Instagram.
- Autorização dos 4 clientes das coberturas que aparecem no hero.
- Autorização das peças de realismo que aparecem nos quadros do hero (mesmos clientes do portfólio).
- Tropicalderm e Barbearia Navalhett: quer citar no site?
- Domínio; tirar `noindex` e `robots.txt` ao publicar.
