# Veríssimo Tattoo Artist · prévia

Site de apresentação do Alexandre Veríssimo (@verissimotattoo), realismo colorido, preto e cinza e coberturas, com estúdios em Maringá (PR) e Goiânia (GO). Feito por [L R G Z](https://lrgz.com.br).

**Conceito do hero (v4), "capa de revista":** cada cobertura é uma edição. O logotipo VERÍSSIMO fica no alto, em Antonio grande, por cima da peça; a peça recortada encosta no topo da tela e recebe a cobertura ao vivo (a tatuagem antiga, a tinta preta com borda molhada, o preto e cinza e a cor). Faixa de edição (Nº 01–04, Maringá · Goiânia) acima do logotipo; chamadas de capa espelhadas (75 prêmios, jurado Tattoo Week, destaque Inked 2025 / cobertura da edição com Antes · Cobrindo · Depois, Mast Pro Team 2026); na base, código de barras, botões e as 4 edições com progresso. A manchete e o número da edição entram com efeito de registro de impressão (CMY desalinhado que encaixa). Ordem: dragão, cerejeira, pastor-alemão, onça. No PC roda em WebGL com transparência (`assets/js/cob.js`); abaixo de 1100 px as chamadas laterais somem. No celular a capa vira coluna (faixa, logotipo por cima do alto da peça, MP4 `assets/video/cobertura.mp4` de 32 s em fundo #0a0a0b, manchete, botões e a faixa 75 prêmios | Tattoo Week); se o iPhone recusar o vídeo, o shader assume.

**Identidade:** símbolo oficial reconstruído em vetor com geometria exata e simétrica (`tools/logo.py`; o arquivo do meulink estava achatado 4%), preto do estúdio, marfim e o laranja do neon da fachada. Títulos em Antonio condensada (a mesma família do "TATTOO ARTIST" do letreiro), Lexend Exa no logotipo e no menu, Instrument Sans no texto, tudo self-hosted. Sobre com a foto de perfil atual do Instagram (ele tatuando). Favicon, ícones e manifest em `tools/montar.py`.

## Ferramentas
- `tools/fotos.py`: recortes 4:5 do portfólio, pares de cobertura, retrato e `assets/js/dados.js`.
- `tools/cob_hero.py`: pares do hero em 1080x1350 (`assets/hero/`); pontos de partida da tinta em `tools/cob_sementes.json`. `tools/capa_recorte.py`: amplia 4x com Real-ESRGAN (50% com Lanczos), recorta o corpo com rembg BiRefNet (birefnet-general-lite) e grava os pares RGBA 1440x1800 (originais em `../_ref/hero-rgb`). O `tools/recorte.py` (u2net) ficou só como histórico.
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
- Chamadas da capa: o que exatamente é o "Inked 2025" (capa, matéria, prêmio?) e se "75 prêmios em mais de 30 anos" está certo.
- Tropicalderm e Barbearia Navalhett: quer citar no site?
- Domínio; tirar `noindex` e `robots.txt` ao publicar.
