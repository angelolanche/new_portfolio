# BETWEEN FRAMES — contexto de continuidade

## Aprovado

### Conceito e narrativa

Portfólio 3D imersivo: um instante cotidiano se abre em um universo de projetos entre escalas micro e macro. A experiência acontece dentro da pequena quantidade de água que escapa da mesa em direção ao chão; o tempo fica suspenso e a cena inicial nunca se resolve.

1. **Sala brasileira dos anos 90, de madrugada.** Sofá florido visto de costas; menino quase invisível, identificado apenas por pés pequenos, parte das pernas e meias brancas. TV CRT ligada com chuvisco. Mesa redonda de madeira com telefone antigo e copo de água mais para dentro do tampo (revisão aprovada em 2026-10-18).
2. **Câmera lenta e contida.** Abertura de 5 segundos. Começa com parte do sofá cortada e aproxima-se da mesa; o final preserva a TV inteira e um olhar próximo ao ângulo inicial, sem inclinar tanto para baixo.
3. **Acontecimento sutil.** Um gato passa discretamente ao fundo ou em um canto e sai de quadro. O copo pode tombar sobre o tampo; a água escorre pela mesa e só uma pequena quantidade escapa em direção ao chão. O copo não precisa sair da mesa; não foi definida uma causa explícita.
4. **Travessia.** A câmera se aproxima das gotas/partículas de água. A queda se torna um universo micro-macro com gotas em diferentes escalas e anomalias que representam projetos. O portfólio se desenvolve nesse instante, sem concluir a queda.

### Direção emocional e visual

- Referências emocionais: **Mundo da Lua / Lucas Silva e Silva**, **Zathura** e a memória do sofá brasileiro dos anos 90. Evocar infância, estranhamento e descoberta, sem copiar literalmente cenas ou identidades.
- Estética aprovada: **nostalgia surreal + sci-fi analógica + anti-design espacial**.
- Materiais: tecidos floridos, madeira envelhecida, metais, plástico translúcido, água e refração.
- Linguagem: ruído CRT, linhas e interferências; luz âmbar com acentos ciano; composição escura, cinematográfica e assimétrica.
- Preservar legibilidade, hierarquia e acesso ao conteúdo mesmo com experimentação visual.
- As primeiras imagens aprovadas são a principal referência, inclusive de composição. **O primeiro storyboard foi preferido ao segundo.** Não gerar novas imagens desnecessariamente nem reinterpretar a direção a cada etapa.

### Apresentação dos projetos

Fluxo proposto: **descoberta → aproximação → conteúdo**. As anomalias despertam curiosidade; a aproximação revela o projeto e permite acessar informações legíveis. A metáfora espacial deve servir à apresentação do trabalho.

Projetos a contemplar:

- BMW: quatro projetores, APIs, WebSocket e TouchDesigner.
- Cérebro LED interativo.
- Instalações sensoriais.
- Projetos web.

### Implementação e continuidade

- Usar e preservar ao máximo a estrutura existente do projeto **New Portfolio**. Inspecionar a base antes de propor mudanças.
- Preferir **3D em tempo real com Three.js**. GSAP, shaders e GLSL são possibilidades bem-vindas conforme a necessidade; não adicionar dependências ou arquitetura antes de avaliar a base.
- Animações pré-definidas são possíveis; não é necessário simular fisicamente tudo. A intenção é uma experiência 3D, não um vídeo como solução principal.
- Manter documentação mínima e consumo de tokens eficiente: este arquivo concentra decisões; consultar apenas os arquivos e referências necessários à etapa e atualizar somente decisões relevantes, sem duplicar contexto.

## Base verificada (2026-10-18)

- Base existente: Vite, React, TypeScript estrito, Three.js e React Three Fiber; npm e lockfile presentes. GSAP não consta nas dependências atuais.
- A interface ainda é um placeholder. Preservar os requisitos do AGENTS.md: conteúdo público em inglês, navegação direta e por toque, páginas 2D de projetos com URL própria, restauração da câmera e fallback HTML.
- Referências locais: references/zathura.webp, references/zathura.jpg, references/sofa.jpg e references/noise.gif. As primeiras imagens geradas e o storyboard preferido não foram localizados nessa pasta.

## Em aberto

- Recursos 3D disponíveis e limites de desempenho, especialmente em dispositivos móveis.
- Duração e controle da abertura, transições de câmera e forma de navegação/interação.
- Técnica para água, gotas, refração e suspensão do tempo; shader específico e equilíbrio entre animação pré-definida e comportamento em tempo real.
- Forma de cada anomalia, associação com cada projeto e apresentação final do conteúdo.
- Assets, tipografia, parâmetros de luz e efeitos: definir a partir das referências aprovadas, preservando legibilidade.

## Primeiro passo no próximo chat

Ler este contexto, avaliar a estrutura existente de New Portfolio e propor a menor etapa implementável que valide a direção aprovada. Não reabrir decisões estéticas sem necessidade.

**Origem:** conversa “Conceito do portfólio 3D” (`6ad44d64-088c-83e9-bf91-fa15c4ec84fe`) e consolidação solicitada pelo usuário. As imagens não estão incorporadas neste Markdown; consultar os originais quando for necessário comparar composição, sem inventar detalhes ausentes.

## Blockout atual (2026-10-18, aguardando revisão)

- Referência explícita de composição fornecida pelo proprietário: `references/between-frames-composition.png`. Sofá cortado à esquerda, TV no fundo, mesa entrando pela direita, câmera lateral baixa. Telefone substitui o vaso por decisão posterior. Preservar início, alinhamentos e itens aprovados; não reabrir a composição sem necessidade.
- Sala mais compacta, agora com parede direita e rodapé; tapete, estante de madeira mais alta/encorpada, portas com relevo, puxadores, nichos, fitas, VHS, quadros abstratos, abajur, janela lateral com cortina longa/pregas/bandô, planta em vaso e antena na TV. Modelos e materiais continuam simples. Arredondamento da CRT fica para acabamento.
- Revisão atual: duração reduzida para 5 segundos, copo mais para dentro do tampo. Final a 1,85 m de altura, com inclinação menor e campo de visão abrindo suavemente de 42° para 50°, preservando a TV inteira e a área do tampo. Pequena correção de direção no percurso vertical para manter a TV visível. Posição/direção iniciais preservadas.
- Nova narrativa autorizada: copo tomba sobre a mesa, água atravessa o tampo, pequena quantidade escapa e dá acesso ao universo. Substitui a preparação anterior de queda direta do copo para fora da mesa. Somente envelopes de enquadramento nos testes; nenhuma queda/água/gota animada foi implementada.
- 15 testes passam: TV completa com antena no quadro, inclinação final moderada, início preservado, sofá/TV alinhados, distribuição da referência, copo dentro do tampo, percurso futuro da água visível em 21 momentos e três proporções, duração, continuidade e parada. Testes antigos de copo junto à borda/queda direta foram atualizados conforme a revisão autorizada. TypeScript, lint e build verificados; aviso de bundle grande persiste.
- Revisão visual da composição e do movimento pendente pelo proprietário. O navegador integrado não conseguiu acessar o servidor local nas tentativas anteriores. Sem novas imagens/dependências e sem implementar ainda queda/universo.

Revisão atual: proprietário aprovou o restante da composição, câmera e alinhamentos; pode rever a posição do copo futuramente. Acrescentados somente bloco de notas espiralado com páginas em branco, caneta ao lado do telefone e abajur pequeno na parte posterior da mesa, com luz âmbar local. Copo e câmera preservados. Inspeção visual desses novos itens pendente.

Após aprovação do bloco/caneta/abajur, acrescentadas três plantas: vaso maior no canto direito, vaso pequeno no peitoril e outro na extremidade da estante da TV. Planta original preservada (quatro no total). Câmera, copo e demais objetos preservados. Os 15 testes existentes passam; revisão visual dos novos vasos pendente.

Acrescentados poltrona na extremidade direita do tapete, levemente voltada à TV, e pequeno lustre de três braços em metal envelhecido com cúpulas foscas. Lustre apagado: sem fonte de luz nem emissão. Câmera, copo e demais alinhamentos preservados; revisão visual pendente.

Reposicionamento da poltrona solicitado: deslocada para a frente e para a direita, na borda direita do tapete, orientada diretamente à TV. Mesa e câmera preservadas. Três testes adicionais protegem direção da poltrona, passagem mínima até a mesa e ausência de obstrução da TV ao longo do movimento horizontal/vertical (18 testes no total). Nova revisão visual pendente.

Mesa redonda reduzida de 2,10 m para 1,96 m de diâmetro, mantendo os objetos e o copo. Cadeira de madeira com encosto de palhinha vazado acrescentada à frente da mesa, mais próxima da câmera e voltada para dentro. Câmera, poltrona e composição aprovadas preservadas. Dois testes adicionais protegem orientação, separação da mesa e ausência de obstrução do copo/TV (20 testes no total); os testes anteriores não foram enfraquecidos. Revisão visual pendente.

Mesa novamente reduzida, agora com 1,64 m de diâmetro. Cadeira deslocada à direita e aproximada, voltada ao centro, com cerca de 10 cm do assento sob o tampo e encosto para fora. Objetos reacomodados: copo mais para dentro, bloco/caneta e abajur ajustados ao tampo menor; envelope futuro da água acompanha a nova borda. Câmera preservada. Teste da cadeira atualizado para o encaixe solicitado (substitui a separação anterior), mantendo verificações de direção e ausência de obstrução; 20 testes passam. Revisão visual pendente.

Móvel da TV convertido em estante grande de madeira, com 3,13 m de altura (teto implícito a 3,20 m), nichos laterais, moldura superior e vão central livre para TV/antena. Acrescentados vasos, bule, xícaras e pratos decorativos de porcelana em formas simples. VHS em nicho inferior; abajur lateral reposicionado para não atravessar a estante. Câmera e TV preservadas. Teste adicional protege as linhas de visão da TV/antena contra os painéis da estante durante todo o movimento (21 testes). Revisão visual pendente.

Nova trajetória autorizada: o antigo plano final vira exatamente o início (posição, direção e lente de 50°). Em 5 segundos, câmera avança em direção à TV e desce de 1,85 m para 1,30 m, tornando o olhar mais horizontal. Close final mantém o copo no quadrante direito, com cerca de metade da altura do quadro horizontal. Objetos preservados. No vertical, enquadramento mais aberto (lente final 58°) preserva a TV inteira e amplia menos o copo. Testes do plano geral anterior substituídos por início idêntico ao antigo final, descida/olhar para cima monotônicos, avanço em direção à TV e crescimento do copo à direita. Preservadas checagens de TV/antena, obstruções, continuidade, duração e parada; envelope da água verificado no novo início, enquanto o final é close do copo. 20 testes passam; revisão visual pendente.

Compactação solicitada: sala agora com 6,70 × 8,60 m (antes 7,80 × 10 m), cerca de 26% menos área. Sofá aproximado da TV em 1,05 m; estante deslocada à direita e parede direita aproximada, reduzindo vão lateral de cerca de 2,39 m para 0,94 m. Mesa/cadeira, poltrona, plantas e abajur reacomodados para caber e preservar circulação. Início da câmera preservado; final vira um pouco mais à esquerda, mantendo copo grande à direita e TV visível. Teste adicional protege dimensões compactas, proximidade sofá/TV, vão da estante e mesa dentro da sala. 21 testes passam; revisão visual pendente.

Recuo leve do sofá: 20 cm em direção à câmera, mantendo a sala compacta. Porta de entrada fechada acrescentada na parede esquerda, em madeira com painéis e maçaneta; aparece parcialmente na borda do plano inicial horizontal e sai de quadro naturalmente até cerca de 3 segundos da aproximação, sem animação própria. Câmera e demais itens preservados. Teste adicional verifica presença inicial e saída de quadro da porta; 22 testes passam. Revisão visual pendente.

Correção da porta conforme revisão: afastada mais 45 cm da janela em direção ao primeiro plano; largura aumentada 20% e altura 15% (folha de aproximadamente 1,08 × 2,53 m). Apenas a borda da porta aparece no início, com centro fora do quadro; sai naturalmente na aproximação. Resto da cena aprovado e preservado. Teste atualizado protege escala maior, afastamento e recorte periférico; 22 testes passam. Revisão visual pendente.

Ajuste lateral solicitado: porta levada mais 30 cm em direção ao primeiro plano, atrás do encosto do sofá e quase fora do limite esquerdo inicial. Janela reduzida 15% em largura e 10% em altura, deslocada 40 cm para o fundo, com o vaso do peitoril acompanhando. Espaço livre entre cortina e batente agora superior a 1 m; câmera e restante da cena preservados. Teste existente ampliado para verificar posição atrás do sofá, separação e proporção menor da janela; 22 testes passam. Revisão visual pendente.

Último ajuste: somente a porta afastada mais 54 cm da janela, exatamente metade da largura de 1,08 m da folha. Câmera e todo o restante preservados. Com essa posição, a porta fica fora do quadro inicial; isso substitui o recorte de borda anterior em favor da distância pedida. Teste atualizado protege o deslocamento exato e o afastamento maior, mantendo verificações da cena; 22 testes passam. Revisão visual pendente.

Ajuste final solicitado: porta afastada mais 21,6 cm (20% da largura da folha), posição longitudinal final 2,706 m. Restante da cena preservado. Teste protege o deslocamento adicional exato; etapa encerrada para revisão do proprietário.

Checkpoint Git: etapa aprovada organizada por entregas — base Vite/React validada isoladamente, blockout completo com câmera/testes, e documentação/referências. Ajustes visuais individuais não tinham snapshots Git e não foram reconstruídos como histórico fictício. Próxima etapa deve ocorrer em outro chat: tombamento do copo e água sobre a mesa, ainda sem universo.
