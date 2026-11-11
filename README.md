# Veríssimo Tattoo Artist · prévia

Site de apresentação do Alexandre Veríssimo (@verissimotattoo), realismo colorido, preto e cinza e coberturas, com estúdios em Maringá (PR) e Goiânia (GO). Feito por [L R G Z](https://lrgz.com.br).

**Conceito do hero, "valores primeiro, depois a cor":** numa lente circular, cada tatuagem dele surge em preto e cinza e a cor se espalha do centro, como na pintura realista. "Preto e cinza" e "Colorido" ficam espelhados dos dois lados e acendem conforme a fase; o aro laranja mostra o avanço da cor. No PC roda em WebGL (`assets/js/hero.js`); no celular, o MP4 gerado do mesmo shader (`assets/video/hero.mp4`, 26 s em loop).

**Identidade:** símbolo oficial reconstruído em vetor com geometria exata e simétrica (`tools/logo.py`; o arquivo do meulink estava achatado 4%), preto do estúdio, marfim e o laranja do neon da fachada. Fontes Lexend Exa (próxima do logotipo) e Instrument Sans, self-hosted. Favicon, ícones e manifest em `tools/montar.py`.

## Ferramentas
- `tools/fotos.py`: recortes 4:5 do portfólio, pares de cobertura, retrato, peças do hero e `assets/js/dados.js`.
- `tools/logo.py`: símbolo em SVG. `tools/montar.py`: gera `index.html` a partir de `tools/index.tpl.html` + favicons.
- `tools/gerar_video.py`: MP4 do hero, pôster e capa (og). `tools/ver_hero.py`: tira de quadros do shader.
- `tools/auditar.py`: 13 tamanhos, transbordo e eixo no celular (tudo ok na publicação). `tools/telas.py`, `tools/secoes.py`: prints.

## CONFIRMAR com o Veríssimo
- WhatsApp 44 99176-1485 para orçamento (o meulink tem 44 9176-1485 sem o 9).
- "+75 prêmios" (arte da Tattoo Week) e "30+ anos": manter?
- Anos da trajetória: 1994 (Brasília), 1996 (Guará), Inked 2025, júri 2025/2026, Mast Pro Team 2026. Ano de abertura de Maringá e Goiânia.
- Horários: Google mostra Maringá até 18h e Goiânia até 20h; no site ficou "horário marcado".
- Autorização dos clientes para fotos e para as 3 avaliações do Google (Marcelo J., Donnie B., Highilander S.).
- Foto do estúdio: qual cidade? Retrato vindo do post de dicas (trocar por foto profissional se tiver).
- Tropicalderm e Barbearia Navalhett: quer citar no site?
- Domínio; tirar `noindex` e `robots.txt` ao publicar.
