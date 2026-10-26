# BETWEEN FRAMES — contexto criativo

Fonte de verdade para decisões criativas duráveis. Consulte somente a seção ligada à tarefa. O código e os testes definem medidas e comportamento atuais; este documento define intenção, prioridades e limites. Quando uma decisão mudar, substitua-a aqui e registre a anterior apenas se ela evitar uma regressão provável.

## Visão aprovada

Portfólio 3D imersivo em inglês. Uma sala de estar dos anos 90, como uma memória ou um sonho: o chuvisco da televisão ligada dá acesso a outra dimensão. O portfólio existe dentro desse outro lugar tridimensional no mundo dos chuviscos da TV.

Sequência narrativa:

1. Sala brasileira dos anos 90, de madrugada, vista por uma câmera baixa e lateral.
2. Um impacto fora de quadro faz a mesa vibrar e o copo tombar; a causa não é mostrada.
3. A água cruza o tampo e apenas parte escapa pela borda.
4. A câmera avança continuamente até o chuvisco da TV CRT preencher o quadro.
5. Em etapa futura, o chuvisco dará acesso ao universo micro–macro e às anomalias que representam projetos.

O cachorro permanece uma possibilidade narrativa discreta, não uma implementação aprovada. Não inventar colisão visível, causa explícita ou conclusão da queda.

## Direção visual e emocional

- Referências emocionais: **Mundo da Lua / Lucas Silva e Silva**, **Zathura** e a memória do sofá brasileiro dos anos 90. Evocar infância, estranhamento e descoberta sem copiar cenas ou identidades.
- Estética: **nostalgia surreal + sci-fi analógica + anti-design espacial**.
- Linguagem: composição escura, cinematográfica e assimétrica; luz âmbar com acentos ciano; CRT, interferência, tecidos floridos, madeira envelhecida, metal, plástico translúcido, água e refração.
- Revisão solicitada em 2026-10-24: a água é a referência de profundidade, contraste, brilho e reflexos para o restante da sala. Reduzir a aparência cartunesca e melhorar formas dos móveis sem aumentar o custo de carregamento.
- O tratamento analógico deve preservar textura, gradações de luz e brilho. O preset vigente está descrito em “Acabamento e desempenho”; não restaurar versões anteriores.
- Sofá floral em creme, rosa e verde, com encosto arqueado, braços apoiados e almofadas abauladas. Poltrona, palhinha e pedestal da mesa devem ter construção legível, evitando blocos e cápsulas aparentes.
- Legibilidade, hierarquia, conteúdo e desempenho têm prioridade sobre ornamentação. Interface, páginas de projeto e fallback devem pertencer à mesma linguagem sem aplicar efeitos que prejudiquem o texto.
- As primeiras imagens aprovadas e o primeiro storyboard são a referência principal de composição. Não gerar novas imagens nem reinterpretar a direção sem necessidade.

Referências locais relevantes: `references/between-frames-composition.png`, `references/maxresdefault.jpg`, `references/noise.gif`, `references/sofa.jpg`, `references/zathura.webp` e `references/zathura.jpg`. Algumas imagens iniciais aprovadas não estão no repositório; não inventar detalhes ausentes.

## Cena atual aprovada

**Estado consolidado e aprovado pelo proprietário em 2026-10-25**, incluindo o último ajuste dos brinquedos, dos tênis e do casaco. Preservar o conjunto; alterações futuras devem se limitar ao pedido do usuário.

### Sala e objetos

- Sala compacta com sofá floral cortado à esquerda, TV CRT e estante de madeira ao fundo, mesa redonda à direita, cadeira de palhinha parcialmente sob a mesa e poltrona voltada à TV. Manter circulação, enquadramento e proporções definidos no código.
- Sofá com encosto arqueado e almofadas abauladas; estampa baseada em `references/sofa.jpg`, fundo marfim, ramagens oliva, rosas salmão e flores azuladas. Tecido sem emissão própria; nenhum pé, perna ou meia do menino visível.
- Um único tapete principal com borda. Blocos e carrinho detalhados ficam sobre ele, próximos da TV. Preservar suas formas aprovadas.
- Quatro pares de tênis de lona de cano alto atrás do sofá: dois grandes e dois pequenos, com biqueiras claras, costuras e cadarços. Disposição levemente desorganizada, com um tênis grande e um pequeno deitados de lado. Formato, quantidade e disposição aprovados.
- Casaco leve apoiado no encosto da poltrona: painéis finos acompanham a superfície curva, com pequenas dobras, mangas apoiadas, gola, bolso, bainhas e zíper. Não suspender o tecido longe do estofado nem restaurar mangas rígidas. O teste geométrico protege contato e ausência de penetração.
- Quadros com molduras em camadas, passe-partout, vidro discreto e pinturas procedurais; retratos na estante são ilustrações fictícias sem identidade atribuída. Nichos, VHS e porcelanas não obstruem TV ou antena.
- Mesa com telefone de disco, copo, bloco espiralado, caneta e abajur âmbar. Telefone com disco numerado, aros, batente, juntas, grelhas e apoios. Abajur com base torneada, frisos, forro, pregas alinhadas e ferragens. Preservar posições, luz e relação com os obstáculos da água.
- Plantas com folhas curvadas, nervuras e bordas finas; janela e peitoril livres de plantas. A planta maior fica à direita da estante. Abajur junto à TV com base torneada, aros e cúpula plissada.

- TV CRT com seletores serrilhados e marcas radiais, grelha de alto-falante, chave liga/desliga, tomada de fone, parafusos, respiros laterais e superiores, junta da carcaça, pés e colares da antena telescópica. Preservar abertura, vidro, chuvisco e chegada da câmera.

### Exterior e iluminação

- Porta esquerda aberta para fora e janela com aberturas reais na parede. Varanda compartilhada com piso de madeira, colunas claras, guarda-corpo, degraus e beiral visível. Sem toldo, cortinas ou varão.
- Janela com profundidade, peitoril, caixilho, frisos, juntas, dobradiças e parafusos. A arquitetura produz oclusão e paralaxe naturais sem bloquear a vista exterior.
- Saturno e anéis em geometria 3D distante, com globo ligeiramente menor, faixas e divisões legíveis nos anéis. Enquadramento aprovado mostra anéis pela porta e parte do planeta pela janela. Todo o conjunto permanece além da varanda, com margem mínima de 2 m; não ocultar interseções por recorte de shader. Testes protegem limites contínuos, malhas renderizadas e visibilidade nas duas aberturas.
- Exterior inspirado na referência enviada em 2026-10-25: planeta dourado com faixas finas e terminador marcado, anéis claros com partículas de gelo, campo estelar denso e nebulosas de poeira em tons azulados, violeta e âmbar. Manter posição e envelope geométrico do planeta e dos anéis. Céu e partículas não são fontes de luz interna.
- Luz do planeta restrita ao exterior da casa; alcance da luz da varanda termina antes da parede. Sem pulso de brilho ou ofuscamento da câmera: efeito removido a pedido do proprietário.
- Lustre aprovado com braços curvos, cúpulas de perfil torneado, bordas, soquetes e ferragens. Uma lâmpada âmbar acesa mantém intensidade e cortes breves de mau contato; o balanço responde ao impacto. Preservar geometria e funcionamento, controlados pelo relógio compartilhado de Play/Pause, Replay e movimento reduzido.
- Teto interno opaco, escuro e fosco, sem reflexo de ambiente, impede que estrelas apareçam sobre a sala.

### Acabamento e desempenho

- Dither aprovado: preset exportado `between-frames-dithering (1).json`, incorporado em `ditherSettings.ts`. Padrão checker; valores completos pertencem ao código. Painel de ajustes removido da apresentação; manter Play/Pause e Replay.
- Chuvisco procedural animado em preto e branco, inspirado em `references/tv.mp4`, recortado na tela e composto depois do tratamento da sala. Independe da paleta e do dither; acompanha os controles de reprodução e movimento reduzido.
- Geometrias repetidas compartilhadas, superfícies estáticas compatíveis agrupadas e sombras direcionais com mapa único. Reflexos sólidos usam um campo procedural compartilhado, sem captura dinâmica ou HDR externo; a água mantém material próprio. Medir desempenho localmente, sem prometer tempo universal de carregamento.

Fontes de implementação em `src/features/world/`: composição em `room/Room.tsx`, interface em `Opening.tsx` e medidas em `sceneLayout.ts`; exterior em `WindowSpace.tsx`, `EntryPorch.tsx` e `exteriorLayout.ts`; objetos em `LivedInDetails.tsx`, `CanvasShoes.tsx`, `DrapedJacket.tsx`, `FramedArtwork.tsx` e `TabletopDetails.tsx`; lustre em `room/CeilingFixture.tsx`, `FixtureDetails.tsx`, `fixtureShade.ts`, `fixtureLight.ts` e `fixtureMotion.ts`. Medidas e parâmetros devem ser consultados no código, não duplicados aqui.

## Câmera e interação atuais

- **Estado aprovado pelo proprietário em 2026-10-26:** entrada no universo contínuo de chuviscos, ANGELOAOSOL em 3D com flick 5× e tempos iguais entre preto, vermelho e azul, e retomada do controle de olhar dentro da TV. Preservar este conjunto nas próximas etapas.
- **Versão de 14,5 s aprovada pelo proprietário em 2026-10-24**, incluindo a desaceleração visual da aproximação final até o chuvisco preencher o quadro. Preservar esta coreografia como base da próxima etapa.
- O impacto ocorre em **2,2 s**, enquanto a câmera ainda se move. O copo deve permanecer visível até o tombamento.
- A trajetória aprovada até **5,5 s** é preservada. Enquanto passa pelo sofá, a posição começa a se alinhar em X e Y à TV; o olhar centraliza progressivamente a tela sem mergulhar em direção à mesa.
- O alinhamento X/Y termina suavemente aos **8,3 s**, com a área da tela ainda inteira no enquadramento. Os últimos 6,2 s avançam somente pelo eixo Z: tanto a velocidade física quanto o crescimento da imagem projetada diminuem até zero. A lente se estabiliza antes desse trecho. A parada acontece assim que a área do chuvisco cobre o quadro, a uma distância calculada para paisagem, 4:3 e retrato; substitui a aproximação até poucos centímetros do vidro que terminava aos 11,5 s. As curvas encontram posição, velocidade e aceleração sem salto em seus pontos de junção.
- Após a aproximação de 14,5 s, a mesma cena vista na TV ocupa o quadro e a câmera avança no universo interno. ANGELOAOSOL aparece em letras 3D antes da entrada. O flick usa velocidade 5×, com fases preta, vermelha e azul de igual duração (0,38 s cada); as fases coloridas mantêm o deslocamento de glitch.
- O universo interno usa o mesmo sinal procedural do CRT como fundo infinito em todas as direções, sem paredes, piso, teto, horizonte ou emendas. Preservar grão, cadência de 24 Hz, movimento das linhas e faixa de tracking durante a passagem. O texto permanece geometria 3D independente.
- Mouse/trackpad desviam suavemente apenas o olhar, até 8° na horizontal e 5° na vertical. A influência diminui de 9,5 s a 11,5 s, deixando a passagem pelo CRT centralizada. Ao entrar no universo, aos 14,5 s, o controle retorna suavemente durante 1,2 s e permanece disponível, inclusive após o fim do avanço automático. Sair da cena e usar Replay recentralizam. Toque não ativa esse acompanhamento.
- Play/Pause, Replay e `prefers-reduced-motion` devem continuar funcionando. Navegação touch completa permanece futura.

Fontes de implementação: `src/features/world/cameraPath.ts`, `TelevisionStatic.tsx`, `televisionSnow.ts` e `televisionWorld.ts`; proteção da câmera: `cameraPath.test.ts` e `cameraLook.test.ts`.

## Copo e água atuais

- Um solavanco transitório move mesa e objetos juntos. O copo reage, tomba para a esquerda, ressalta levemente e rola em arco curto, sempre sobre o tampo.
- A água começa dentro do copo, escoa pela boca, contorna telefone/bloco/caneta/abajur, forma uma poça recortada pelo tampo circular e cai pela borda.
- O início é aberto, assimétrico e impulsivo; depois o fluxo converge para um corpo principal mais estreito, arredondado e coeso, com poucos fragmentos soltos. Não deve parecer um chuveiro de esferas.
- A fase intermediária da queda é a principal referência para a futura entrada no Between Frames. A experiência final não deve mostrar o fim da queda.
- A implementação é uma aproximação determinística: corpo rígido coreografado, líquido interno simplificado, camada rasa no tampo, lâmina na borda e gotas balísticas. Não é simulação volumétrica nem promessa de fotorrealismo.
- O preset final escolhido em 2026-10-21 está em `cup-spill/spillSettings.ts`. A GUI de ajuste foi removida; não a restaurar. Play/Pause e Replay foram preservados.
- Preservar conservação/continuidade, determinismo, obstáculos secos, recorte circular, normais válidas e independência da cadência de quadros.

Implementação e manutenção: `src/features/world/cup-spill/` e seu `README.md`.

## Apresentação dos projetos

Fluxo: **descoberta → aproximação → conteúdo**. Anomalias despertam curiosidade; aproximar revela um projeto e oferece acesso a conteúdo legível. A metáfora espacial serve ao trabalho, nunca o esconde.

Projetos previstos:

- BMW: quatro projetores, APIs, WebSocket e TouchDesigner.
- Cérebro LED interativo.
- Instalações sensoriais.
- Projetos web.

Não inventar descrições, resultados, créditos, dados pessoais ou contato. Requisitos duráveis de produto — URLs compartilháveis, páginas 2D, restauração da câmera, navegação direta/toque e fallback HTML — ficam em `docs/product-requirements.md`.

## Limites de implementação

- Preferir 3D em tempo real; animações coreografadas são aceitáveis. Vídeo não é a solução principal.
- Não adicionar dependências, shaders complexos ou arquitetura sem necessidade comprovada.
- Tratar medidas, presets, contagens de testes e estado de implementação como fatos do código atual, não deste documento.

## Próximas decisões

- Refinamento da entrada e do universo de chuvisco conforme revisão visual.
- Forma, comportamento e associação de cada anomalia aos projetos.
- Navegação dentro do universo e transição para páginas legíveis.
- Orçamento de desempenho, especialmente em dispositivos touch.
- Conteúdo real dos projetos, tipografia e acabamento da interface/fallback.

Preservar a continuidade entre a imagem do CRT e o universo interno. Não reabrir composição, água ou dither sem evidência de que bloqueiam essa etapa.

## Decisões substituídas — não restaurar

- Abertura parada de 5 s e durações intermediárias: substituídas pela coreografia atual de 14,5 s.
- Queda direta do copo para fora da mesa e versão com somente três gotas: substituídas pelo copo retido no tampo e pelo escoamento atual.
- GUIs **Water controls** e **Tabletop water controls**: removidas após fixar o preset final.
- Rota de comparação Original/Color dither e sua interface demonstrativa: removidas após aprovação do dither global.

- Porta fechada, toldo, cortinas, planeta projetado num plano, lustre totalmente apagado ou com falha de meio segundo: substituídos pelo exterior 3D e iluminação atuais.
- Dither Bayer/16 níveis, quantização rígida em dez cores e painel de ajustes: substituídos pelo preset checker sem GUI.

## Proveniência

Consolidado a partir da conversa “Conceito do portfólio 3D” (`6ad44d64-088c-83e9-bf91-fa15c4ec84fe`) e das revisões e aprovações do proprietário até 2026-10-25. Referências técnicas usadas na água: [Physical Pendulum (MIT OCW)](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter24.pdf), [height-field fluids](https://matthias-research.github.io/pages/publications/hfFluid.pdf) e [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html).
