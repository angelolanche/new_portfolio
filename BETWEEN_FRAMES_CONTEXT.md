# BETWEEN FRAMES — contexto criativo

Fonte de verdade para decisões criativas duráveis. Consulte somente a seção ligada à tarefa. O código e os testes definem medidas e comportamento atuais; este documento define intenção, prioridades e limites. Quando uma decisão mudar, substitua-a aqui e registre a anterior apenas se ela evitar uma regressão provável.

## Visão aprovada

Portfólio 3D imersivo em inglês. Uma sala de estar dos anos 90, como uma memória ou um sonho: o chuvisco da televisão ligada dá acesso a outra dimensão. O portfólio existe dentro desse outro lugar tridimensional no mundo dos chuviscos da TV.

Sequência narrativa:

1. Sala brasileira dos anos 90, de madrugada, vista por uma câmera baixa e lateral.
2. Um impacto fora de quadro faz a mesa vibrar e o copo tombar; a causa não é mostrada.
3. A água cruza o tampo e apenas parte escapa pela borda.
4. A câmera avança continuamente até o chuvisco da TV CRT preencher o quadro.
5. O chuvisco dá acesso a um espaço abstrato de geometrias brancas e projetos, atravessado por uma linha vermelha que termina no sol vermelho.

O cachorro permanece uma possibilidade narrativa discreta, não uma implementação aprovada. Não inventar colisão visível, causa explícita ou conclusão da queda.

## Direção visual e emocional

- Referências emocionais: **Mundo da Lua / Lucas Silva e Silva**, **Zathura** e a memória do sofá brasileiro dos anos 90. Evocar infância, estranhamento e descoberta sem copiar cenas ou identidades.
- Estética: **nostalgia surreal + sci-fi analógica + anti-design espacial**.
- Linguagem: composição escura, cinematográfica e assimétrica; luz âmbar com acentos ciano; CRT, interferência, tecidos floridos, madeira envelhecida, metal, plástico translúcido, água e refração.
- Revisão de desempenho solicitada em 2026-10-27: simplificar a aparência da água para combinar com a sala, sem exigir tanto realismo. Preservar sua física, remover gotículas visuais e reduzir moderadamente o custo da refração, mantendo-a perceptível. Substitui a orientação de usar a água como referência de realismo para toda a sala.
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
- **Exterior aprovado pelo proprietário em 2026-10-27:** vídeo realista de buraco negro NASA/JPL-Caltech/R. Hurt (IPAC), SVS 14619, servido localmente, sem dither, em superfície curva distante com profundidade aparente e imagem estática de fallback. Substitui Saturno, anéis, partículas e nebulosas procedurais. Preservar esta direção nas próximas etapas. Fonte e créditos em `public/media/exterior/CREDITS.md`.
- Um único fundo curvo 3D distante serve à porta e à janela, sem imagem colada aos vidros. A oclusão e a paralaxe em relação à casa e à varanda, junto com a órbita já animada do vídeo, dão profundidade. O arquivo é vídeo comum, sem profundidade volumétrica ou estereoscopia. Preservar caixilhos, varanda e suas aberturas. Testes protegem distância da arquitetura, cobertura das aberturas e margens da imagem no percurso inteiro.
- Exterior sem dither, preservando cor e detalhe do vídeo; casa mantém seu preset. Uma máscara na renderização exclui a mídia do tratamento sem adicionar outra renderização da sala. Vídeo mudo acompanha o relógio da cena e a suspensão por diálogos; movimento reduzido usa somente a imagem estática, e a entrada na TV libera o decoder. Luz fria da varanda permanece restrita ao exterior, sem pulso de brilho ou ofuscamento da câmera.
- Lustre aprovado com braços curvos, cúpulas de perfil torneado, bordas, soquetes e ferragens. Uma lâmpada âmbar acesa mantém intensidade e cortes breves de mau contato; o balanço responde ao impacto. Preservar geometria e funcionamento, controlados pelo relógio compartilhado da cena, suspensão por diálogos e movimento reduzido.
- Teto interno opaco, escuro e fosco, sem reflexo de ambiente, impede que estrelas apareçam sobre a sala.

### Acabamento e desempenho

- Dither aprovado: preset exportado `between-frames-dithering (1).json`, incorporado em `dither/ditherSettings.ts`. Padrão checker; valores completos pertencem ao código. Painel de ajustes removido. Interface em tela inteira, sem cabeçalho, rodapé, legenda ou painel de navegação; apenas Work index e About ficam sobre o canvas. Não há controles nem atalhos de pausa ou replay; a cena avança automaticamente.
- Chuvisco procedural animado em preto e branco, inspirado em `references/tv.mp4`, recortado na tela e composto depois do tratamento da sala. Independe da paleta e do dither; acompanha os controles de reprodução e movimento reduzido.
- Geometrias repetidas compartilhadas, superfícies estáticas compatíveis agrupadas por regiões de 1,5 m e sombras direcionais com mapa único. O agrupamento inclui materiais padrão dos detalhes dos tênis e da estante, preservando geometria, texturas e materiais; espelhamentos corrigem a orientação dos triângulos. Caixas fechadas, estofados fechados e o corpo fechado dos tênis dispensam desenho traseiro; tecidos abertos, palhinha e superfícies finas continuam com duas faces. Reflexos sólidos usam o campo procedural compartilhado, sem captura dinâmica ou HDR externo; sua qualidade e intensidade foram preservadas, pois reduzir apenas a intensidade não elimina o custo do shader. A água mantém material próprio. Medir desempenho localmente, sem prometer tempo universal de carregamento.

Fontes de implementação em `src/features/world/`: composição em `room/Room.tsx`, interface em `Opening.tsx` e medidas em `room/sceneLayout.ts`; exterior em `exterior/RealisticSpace.tsx`, `exterior/exteriorPlayback.ts`, `exterior/WindowSpace.tsx`, `exterior/EntryPorch.tsx` e `exterior/exteriorLayout.ts`; objetos em `room/details/LivedInDetails.tsx`, `room/details/CanvasShoes.tsx`, `room/details/DrapedJacket.tsx`, `room/details/FramedArtwork.tsx` e `room/details/TabletopDetails.tsx`; lustre em `room/lighting/CeilingFixture.tsx`, `room/lighting/FixtureDetails.tsx`, `room/lighting/fixtureShade.ts`, `room/lighting/fixtureLight.ts` e `room/lighting/fixtureMotion.ts`. Medidas e parâmetros devem ser consultados no código, não duplicados aqui.

## Câmera e interação atuais

- **Estado atual aprovado pelo proprietário em 2026-10-27:** canvas em tela inteira com apenas Work index e About; universo visível desde fora da TV; câmera livre, sensibilidade reduzida e controles liberados na passagem; aproximação dos projetos a 8,5 unidades; vídeos em blocos 3D flutuantes, formas brancas e fios com margem livre. A aprovação final desta etapa inclui scroll vertical leve por obra, viagens suaves de 2,8 s, entrada de 11,4 s e avanço interno de 2,2 s; mouse nas paradas com olhar até ±45° em cada eixo e recentralização no próximo scroll; setas no voo livre com WASD/QE; texturas esticadas nas laterais/traseira dos blocos, flutuação ampliada, sol elevado com shader vermelho infernal animado e fio afastado por raio de exclusão 65 para liberar o enquadramento final. A aprovação abrange também o estado detalhado em “Apresentação dos projetos”. A aprovação inclui os ajustes finais de continuidade das cores e iluminação dos blocos na entrada da TV, margens laterais brancas discretamente menores no ANGELOAOSOL, janela ampliada em direção à porta com o quadro deslocado para perto dela e percurso sem atravessar o sofá. Aproximação final de 11,4 s, preservando o avanço interno de 2,2 s. O proprietário confirmou a janela correta após recarregar a página; a atualização automática do Vite podia manter a geometria antiga no preview. A última validação técnica completa passou com 208 testes, lint, TypeScript e build. Os testes protegem geometria e continuidade do caminho de renderização; não equivalem a comparação visual automatizada de pixels. Preservar este conjunto nas próximas etapas, alterando somente o que for solicitado.
- ANGELOAOSOL segue a referência local `references/aosol-efeito.mp4`: letras sans-serif regulares pretas em faixa branca e deslocamento cromático vermelho/azul. `SignalTitle.tsx` aplica o próprio loop de 1,6 s a uma superfície com espessura no universo 3D; não restaurar os traços irregulares nem o antigo flick por fases de cor. O bloco tem mais respiro branco nas laterais e escala responsiva para caber na entrada. O material remove o pequeno detalhe cinza no canto inferior direito da referência, tanto no vídeo quanto na imagem estática usada para movimento reduzido e falha de reprodução.
- **Ajuste de fluidez solicitado em 2026-10-27:** entrada de 11,4 s seguida de avanço interno de 2,2 s. A câmera mantém velocidade e aceleração contínuas na passagem pelo CRT, sem quase parar antes de reiniciar o avanço. A animação começa após o aquecimento inicial de renderização. Substitui a entrada anterior de 12,5 + 4,5 s; preservar cobertura e composição.
- O impacto ocorre em **2,2 s**, enquanto a câmera ainda se move. O copo deve permanecer visível até o tombamento.
- A trajetória aprovada até **5,5 s** é preservada. A passagem seguinte faz um arco lateral suave para manter distância do sofá, incluindo a margem do plano próximo da câmera. Enquanto passa pelo sofá, a posição começa a se alinhar em X e Y à TV; o olhar centraliza progressivamente a tela sem mergulhar em direção à mesa.
- O alinhamento X/Y termina suavemente aos **8,3 s**, com a área da tela ainda inteira no enquadramento. Os últimos 4,2 s avançam somente pelo eixo Z: tanto a velocidade física quanto o crescimento da imagem projetada diminuem até zero. A lente se estabiliza antes desse trecho. A parada acontece assim que a área do chuvisco cobre o quadro, a uma distância calculada para paisagem, 4:3 e retrato; substitui a aproximação até poucos centímetros do vidro que terminava aos 11,5 s. As curvas encontram posição, velocidade e aceleração sem salto em seus pontos de junção.
- Após a aproximação de 11,4 s, a mesma cena vista na TV ocupa o quadro e a câmera avança no universo interno. As formas mantêm o mesmo tratamento de cor e iluminação antes e depois da passagem: o universo continua sendo composto pela mesma textura intermediária, agora em tela inteira. A faixa ANGELOAOSOL tem margens laterais brancas discretamente menores e aparece antes da entrada, ligeiramente elevada para liberar a vista. Seu loop cromático acompanha o relógio da cena e a suspensão por diálogos, preservando a cadência original da referência.
- O universo interno usa o mesmo sinal procedural do CRT como fundo infinito em todas as direções, sem paredes, piso, teto, horizonte ou emendas. Preservar grão, cadência de 24 Hz, movimento das linhas e faixa de tracking durante a passagem. O texto permanece geometria 3D independente.
- Na sala, mouse/trackpad desviam suavemente apenas o olhar, com amplitude de 8° na horizontal e 5° na vertical antes do fator adicional de sensibilidade de 0,85. A influência diminui de 8,4 s a 10,4 s, deixando a passagem pelo CRT centralizada. Aos 11,4 s, o controle retorna durante 1,2 s. Scroll e deslocamento livre são liberados no mesmo instante da passagem visual: não esperar o avanço automático interno, agora de 2,2 s. Dentro da TV, o mouse controla o olhar nas paradas diante do ANGELOAOSOL, de cada obra e do sol final, com o mesmo limite de ±45° por eixo. Ao iniciar WASD/QE ou sair da posição da parada, o voo livre volta a permitir voltas horizontais ilimitadas e visão vertical até ±90°, preservando o ângulo horizontal de saída. No voo livre, as setas controlam o olhar continuamente enquanto pressionadas e o mouse não gira a câmera. Mouse, touch e setas recebem mais 15% de redução da sensibilidade de olhar. Sair da área mantém a direção; na sala, ainda recentraliza. No mobile, botões navegam pelos pontos e um arraste de um dedo controla o olhar na sala e dentro da TV; ao soltar, a câmera volta devagar ao centro. A lente mobile é mais ampla e aproxima os enquadramentos no título, nas obras e no sol. R reinicia; Locate recentraliza o olhar e aproxima o projeto escolhido.
- A suspensão por diálogos e `prefers-reduced-motion` continuam funcionando sem botões no canvas. Movimento reduzido abre diretamente o sinal estático, sem exigir Play para sair da sala. Scroll, botões mobile e teclado percorrem a mesma trajetória; movimento reduzido elimina deriva e amortecimento da navegação. Fechar/voltar em páginas de conteúdo e controles nativos dos vídeos permanecem disponíveis dentro das páginas.

Fontes de implementação: `src/features/world/opening/cameraPath.ts`, `signal-world/rendering/TelevisionStatic.tsx`, `signal-world/rendering/televisionSnow.ts` e `signal-world/rendering/televisionWorld.ts`; proteção da câmera: `opening/cameraPath.test.ts` e `opening/cameraLook.test.ts`.

## Copo e água atuais

- Um solavanco transitório move mesa e objetos juntos. O copo reage, tomba para a esquerda, ressalta levemente e rola em arco curto, sempre sobre o tampo.
- A água começa dentro do copo, escoa pela boca, contorna telefone/bloco/caneta/abajur, forma uma poça recortada pelo tampo circular e cai pela borda.
- O início é aberto, assimétrico e impulsivo; depois o fluxo converge para um corpo principal mais estreito e coeso. Gotículas separadas não são mais desenhadas. Os registros físicos de volume que escapa pela borda continuam alimentando a cascata.
- A fase intermediária da queda é a principal referência para a futura entrada no Between Frames. A experiência final não deve mostrar o fim da queda.
- A implementação é uma aproximação determinística: corpo rígido coreografado, líquido interno simplificado, camada rasa no tampo e lâmina na borda. A poça e o fluxo usam transparência simples e o reflexo procedural da sala; a refração permanece no líquido interno e no aro do copo, com alvo interno a 75% da resolução linear. Não é simulação volumétrica nem promessa de fotorrealismo.
- O preset final escolhido em 2026-10-21 está em `cup-spill/spillSettings.ts`. A GUI de ajuste foi removida; não a restaurar. Pausa manual e Replay foram removidos, incluindo seus atalhos e a lógica de reinício.
- Preservar conservação/continuidade, determinismo, obstáculos secos, recorte circular, normais válidas e independência da cadência de quadros.
- A física continua fora de quadro, mas as malhas invisíveis deixam de ser reconstruídas. O descarte usa limites conservadores por efeito e a câmera atual, sem excluir regiões permanentemente ou por tempo fixo; olhar de volta restaura a geometria atualizada. Testes percorrem cinco proporções de tela e extremos do olhar para proteger a passagem nas bordas do enquadramento.

Implementação e manutenção: `src/features/world/cup-spill/` e seu `README.md`.

## Apresentação dos projetos

Fluxo: **descoberta → aproximação → conteúdo**. Anomalias despertam curiosidade; aproximar revela um projeto e oferece acesso a conteúdo legível. A metáfora espacial serve ao trabalho, nunca o esconde.

- Direção solicitada em 2026-10-26: espaço antidesign, caótico, analógico e assimétrico, sem piso, paredes ou arquitetura. Formas brancas têm escalas e orientações variadas; o fio vermelho conecta os núcleos e conduz ao sol vermelho final. O sol agora fica elevado em Y=90, com núcleo esférico e raios longos tridimensionais conforme a referência fornecida pelo proprietário (`references/sun-reference.png`); a chegada final sobe e olha para ele. Substitui o disco plano com listras. Shader solar aprovado: shader próprio com convecção, granulação, manchas, plasma nos raios e halo atmosférico, para separar graficamente o sol do universo analógico. A animação usa o relógio compartilhado e respeita pausa, páginas de conteúdo e movimento reduzido. O plasma agora evolui cerca de 7 vezes mais rápido, com pulsação, raios ondulantes e paleta infernal em vermelho escuro/escarlate, reduzindo laranja e amarelo. O fio termina antes de uma esfera de exclusão de raio 26 ao redor do sol, deixando folga além dos raios; nunca deve tocar o núcleo ou a corona. Evitar galeria convencional, realismo e ficção científica genérica.
- Cada gesto de scroll ou swipe vertical conduz até a próxima obra (ou anterior no sentido inverso), sem paradas intermediárias. Scroll aceita deslocamentos verticais mínimos, ignora gestos predominantemente horizontais e Shift+wheel, e é capturado globalmente mesmo sobre controles/rótulos. A chegada libera o primeiro novo gesto sem depender do mouse; eventos durante a viagem não alteram o destino. Cada viagem dura 2,8 s, com aceleração e frenagem suaves e término exato; o olhar gira gradualmente por 0,9 s e então mantém o centro animado da obra de destino no centro da tela e suspende desvios do olhar e voo livre; ao chegar, o controle livre e o próximo scroll são liberados sem exigir movimento do mouse. WASD e Q/E voltam a deslocar a câmera na direção do olhar, sem recentralização forçada durante o voo. PageUp/PageDown seguem as mesmas paradas; as setas ficam reservadas ao olhar livre. Ao parar diante de uma obra, o mouse permite variar o olhar até ±45° em cada eixo, sem acumular entrada além dos limites. O próximo scroll recentraliza o olhar; fora das paradas diante das obras, o controle livre aprovado continua disponível. As formas giram e derivam discretamente. Objetos e rótulos abrem páginas 2D com URLs `/projects/:slug`; fechar ou voltar pelo navegador retoma a posição anterior. O índice permite abrir qualquer trabalho e localizá-lo no sinal, além de permanecer disponível sem WebGL.
- Conteúdo extraído de `https://www.angeloaosol.xyz/` e `/about` em 2026-10-26: 12 trabalhos, 14 vídeos únicos e About original. Dados, textos e URLs ficam em `src/content/projects.ts` e `src/content/about.ts`; o checklist humano está em `docs/portfolio-content-inventory.md`. Preservar grafia dos títulos, sem inventar descrições ou créditos.
- Revisão solicitada: vídeos dos trabalhos distribuídos por todo o espaço em 360°, com profundidades, alturas e inclinações variadas. O scroll desloca e gira a câmera ao redor deles. Formas brancas ficam soltas como contrapesos visuais, sem representar projetos. Aumentar bastante linhas vermelhas e formas independentes.
- Conteúdo, formas e fios existem desde o primeiro quadro na tela da TV, sem revelação condicionada à passagem pelo letreiro. Todos os fios são interrompidos antes dos trabalhos e retomados depois, com margem ao redor de toda a superfície do vídeo; nenhum deve atravessar seu centro.
- Composição ampliada: obras e trama mais afastadas, mantendo a distribuição em 360°. O percurso agora chega bem mais perto dos trabalhos antes de girar para o próximo: distância de aproximação reduzida de 18 para 8,5 unidades, sem aproximar as obras umas das outras. Além do percurso por scroll, WASD desloca livremente na direção do olhar, Q/E desce/sobe, Shift acelera. Scroll/Locate recentraliza suavemente o deslocamento; R restaura tudo.
- Formas brancas originais mantidas, com blocos sólidos adicionais em diferentes formatos e escalas, incluindo volumes grandes. Formas e vídeos flutuam e inclinam discretamente em ciclos fechados de 24–40 s, retornando à posição original sem deriva acumulada. Páginas de projeto e o índice congelam o movimento; movimento reduzido mantém a pose de origem. Fios preservam margem mesmo durante a flutuação.
- A amplitude de flutuação dos vídeos passou de 0,28 para 0,38, mantendo ciclos e inclinações. Vídeos aplicados como texturas às faces de blocos 3D com profundidades variadas, flutuando com o mesmo movimento suave. Laterais e traseira usam a própria textura do vídeo esticada em linhas; manter proporção, qualidade e conteúdo dos vídeos. A margem dos fios considera a profundidade dos blocos, além da flutuação.
- Páginas de projeto e About mantêm a cena por trás, com transparência, chuvisco e entrada espacial; o vídeo é o foco do projeto. Movimento reduzido desativa a animação da interface. Previews silenciosos carregam apenas na vizinhança do percurso; as páginas oferecem os vídeos originais com controles de áudio. Nas páginas de todos os trabalhos, a tipografia ampliada do cabeçalho "Between Frames / Transmission", do botão "Back to signal", da categoria e de "The work" foi aprovada pelo proprietário em 2026-10-30, incluindo o ajuste para telas estreitas.
- **Placas 3D dos trabalhos aprovadas pelo proprietário em 2026-10-27:** brancas, com espessura e tipografia menor que os boxes HTML anteriores. A cada chegada concluída por scroll/Locate, somente a placa da obra de destino escolhe uma posição abaixo ou ao lado do vídeo, conforme o espaço da tela naquele instante; pode reduzir a escala, mas nunca fica acima. Depois, posição, orientação e escala permanecem fixas em relação ao vídeo nos dois modos, acompanhando apenas sua flutuação. Olhar ao redor, voar, trocar de modo, redimensionar a tela ou abrir/fechar um projeto não recalculam a placa. Placas já visitadas preservam o arranjo escolhido; as demais ficam abaixo dos respectivos vídeos. Uma nova chegada guiada pode recalcular apenas seu destino. Não há corte por distância, acompanhamento contínuo da câmera, posição de reserva na tela ou prioridade especial de desenho/clique: são objetos 3D com profundidade normal. Categoria/local têm fonte um pouco maior, preto puro, sem efeito e sem numeração; o nome mantém tamanho e separação cromática vermelha/azul duas vezes mais forte, na cadência de 1,6 s, pelo relógio compartilhado e sem decodificadores extras. As placas não acrescentam setas. O ANGELOAOSOL mantém o efeito aprovado. As placas abrem os projetos pelo mesmo raycasting dos vídeos. Work index mantém links HTML acessíveis e disponíveis sem WebGL.

Referências anteriores de conteúdo (o inventário importado do site é a fonte atual dos títulos):

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

- Orçamento de desempenho, especialmente em dispositivos touch.
- Descrições detalhadas e créditos além do conteúdo disponível no site; tipografia e acabamento da interface/fallback.

Preservar a continuidade entre a imagem do CRT e o universo interno. Não reabrir composição, água ou dither sem evidência de que bloqueiam essa etapa.

## Decisões substituídas — não restaurar

- Abertura parada de 5 s e durações intermediárias: substituídas pela coreografia atual de 11,4 s.
- Queda direta do copo para fora da mesa e versão com somente três gotas: substituídas pelo copo retido no tampo e pelo escoamento atual.
- GUIs **Water controls** e **Tabletop water controls**: removidas após fixar o preset final.
- Rota de comparação Original/Color dither e sua interface demonstrativa: removidas após aprovação do dither global.

- Porta fechada, toldo, cortinas, antigo planeta projetado num plano, Saturno com anéis e partículas e nebulosas procedurais: substituídos pelo exterior fotográfico atual. Lustre totalmente apagado ou com falha de meio segundo: substituído pela iluminação atual.
- Dither Bayer/16 níveis, quantização rígida em dez cores e painel de ajustes: substituídos pelo preset checker sem GUI.

## Proveniência

Consolidado a partir da conversa “Conceito do portfólio 3D” (`6ad44d64-088c-83e9-bf91-fa15c4ec84fe`) e das revisões e aprovações do proprietário até 2026-10-25. Referências técnicas usadas na água: [Physical Pendulum (MIT OCW)](https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter24.pdf), [height-field fluids](https://matthias-research.github.io/pages/publications/hfFluid.pdf) e [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html).
