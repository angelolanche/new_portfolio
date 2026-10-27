# Revisão do processo de construção do Between Frames

Retrospectiva em 27 de outubro de 2026

## O diagnóstico principal

Você chegou a uma identidade visual consistente e a uma implementação tecnicamente ambiciosa. O principal problema do processo foi a ordem de redução das incertezas: partes da abertura receberam acabamento e engenharia antes de a entrada no portfólio, a navegação e a apresentação dos trabalhos estarem suficientemente definidas. Isso fez decisões posteriores exigirem adaptações em elementos que já pareciam prontos.

Seu melhor desempenho apareceu na direção de arte: identificar o que parecia falso, trazer referências, preservar partes aprovadas e ajustar parâmetros diretamente. Seu maior espaço de melhoria está em transformar essas percepções em critérios verificáveis antes de encomendar outra rodada de implementação. O assistente também deveria ter feito essa tradução melhor e mais cedo. Repetir um pedido porque a implementação não o cumpriu não é uma falha sua de direção.

O projeto ainda está em andamento. As páginas dos projetos e alguns detalhes permanecem por editar, conforme sua declaração nesta revisão. A experiência aprovada deve ser preservada enquanto esse trabalho continua.

## Como esta revisão foi construída

Foram examinados o histórico disponível do Git, as alterações locais, a documentação, os logs de validação e registros locais de conversas relacionados ao projeto. O código foi inspecionado nas áreas que explicam as decisões principais: carregamento, câmera, renderização da TV, água, agrupamento de objetos, vídeos, conteúdo e placas.

Há três tipos de afirmação neste documento:

- **Evidência:** algo registrado em uma mensagem, arquivo, teste ou log.
- **Interpretação:** a leitura do que esse registro indica sobre o processo.
- **Recomendação:** o que faria sentido mudar no método de trabalho.

Os registros recuperam boa parte da execução entre 18 e 27 de outubro e algumas referências ao planejamento anterior. Não fornecem uma gravação completa de todas as imagens, da concepção original ou de cada estado visual. Os commits consolidam etapas; suas datas não representam necessariamente quando cada objeto foi criado. Não há base para calcular horas desperdiçadas, economia exata de tokens ou ganho percentual de FPS.

As fontes estão identificadas no final. Não foi necessário consultar a internet para reconstituir este processo local.

## A sequência do projeto e seus pontos de virada

### A base e a preservação da identidade

No início dos registros, você já procurava uma documentação mínima para continuar em outro chat sem perder a estética. Também pediu que a solução respeitasse a estrutura existente e evitasse complexidade adicional. Isso foi uma direção correta: havia um conceito específico, e cada nova sessão precisava encontrá-lo sem reinventar o projeto.

O blockout, isto é, a cena simplificada usada para validar proporções e enquadramento, foi aprovado antes do acabamento. Os primeiros commits separaram a base Vite, a sala e a documentação. Essa sequência foi adequada. [E1, E2]

O limite foi que aprovar a composição da sala não resolvia a experiência inteira. Ainda faltava comprovar como essa abertura entregaria o visitante a um trabalho legível, e como ele voltaria à exploração depois de abrir uma página.

**Como melhorar:** aprovar o blockout e, em seguida, construir uma amostra completa: abertura simplificada, entrada no universo, um projeto, sua página e o retorno à mesma câmera. Só então detalhar a sala inteira.

### O copo e a água entre 18 e 21 de outubro

As primeiras solicitações pediam uma versão simples e coreografada. Logo apareceram problemas de reação lenta, tombamento artificial e água pouco convincente. Em 18 de outubro você escreveu que faltava física melhor tanto no copo quanto no líquido. Depois forneceu uma sequência temporal com vibração, perda de equilíbrio, derramamento e queda. [E3]

Esse é um exemplo de uma expectativa que estava mais precisa na sua percepção do que no contrato inicial. “Simples e coreografada” limitava a solução; “fisicamente plausível” exigia relações entre força, tempo, volume, contato e forma. O assistente deveria ter explicitado esse conflito e demonstrado uma pequena aproximação visual antes de ampliar a implementação.

O trabalho avançou quando você distinguiu problemas observáveis: cascata uniforme demais, gotas parecendo chuveiro, retângulos secos, água ultrapassando a borda e falta de continuidade entre a água da mesa e a queda. As duas referências de água e a GUI de parâmetros tornaram a conversa muito mais objetiva. O preset exportado e incorporado ao código encerrou a etapa de forma reproduzível. [E3, E4]

**O acerto:** você deixou de pedir apenas “mais realismo” e passou a descrever fases e defeitos visuais concretos.

**O custo evitável:** parte do acabamento aconteceu enquanto a água ainda era candidata a portal para o próximo universo. A decisão posterior de entrar pela TV reduziu a importância funcional dessa transição. A água continuou valiosa como acontecimento narrativo e referência de materiais, mas não precisava carregar toda a responsabilidade de conduzir ao portfólio.

**Na próxima vez:** testar primeiro o instante que precisa convencer no enquadramento final. Reservar o refinamento de fases que a câmera quase não mostra para depois dessa prova.

### A transição pela água e a mudança para a TV

Em 21 de outubro houve uma tentativa de congelamento onírico e aproximação da cascata. Você não gostou do resultado e pediu para desfazer essa etapa. Também identificou que os gráficos ainda não eram os desejados. Nos registros seguintes, a transição passou a acontecer pela tela da TV. [E5, E6]

Aqui houve uma exploração legítima de linguagem, mas ela estava acontecendo sobre uma implementação já detalhada. O ponto de desorientação foi tentar resolver simultaneamente a metáfora de entrada, a câmera, o tempo e o tratamento visual.

A TV foi uma direção mais clara porque já existia no enquadramento, tinha um sinal visual reconhecível e podia mostrar o destino antes da passagem. É uma interpretação do resultado e das suas aprovações posteriores, não uma prova de que a ideia da água seria inviável.

**Como chegar mais rápido:** comparar duas transições grosseiras, curtas e descartáveis antes de polir qualquer uma. Cada proposta deveria responder: onde o visitante olha, quando entende que mudou de espaço e quando recebe controle.

### O dither e a qualidade da sala

Você percebeu que a água tinha profundidade, contraste e brilho superiores ao resto da cena. Essa comparação foi útil: estabeleceu uma referência interna de qualidade. Depois pediu melhorias de forma, estampa, materiais e detalhes, mantendo atenção ao carregamento. [E7]

O dither, que transforma tons e cores em padrões de pontos ou células, ajudou a unificar a identidade. A GUI permitiu escolher intensidade, padrão e paleta; exportar o preset e remover o painel evitou manter controles de desenvolvimento na experiência final.

O risco estava em usar um tratamento global para resolver problemas locais de modelagem. Um sofá com silhueta errada, um casaco suspenso ou reflexos em forma de esfera continuam problemáticos sob outro dither. Você reconheceu esses defeitos e pediu correções específicas, o que foi acertado.

**Como melhorar:** aprovar separadamente silhueta, material sob iluminação representativa e tratamento final. O dither deve ser testado cedo porque altera a leitura; ele não substitui a validação das formas.

### O exterior e os objetos da sala

O exterior passou por espaço procedural, planeta com anéis, mudanças de escala e posição, arquitetura de varanda e, por fim, vídeo de buraco negro. Houve relatos de planeta irreconhecível, anéis invadindo a casa e elementos que não apareciam no campo de visão. Também houve um efeito de ofuscamento solicitado e depois rejeitado. [E8]

O problema recorrente foi julgar objetos isoladamente antes de garantir que seriam legíveis através da porta e da janela durante o percurso. Sua observação de que o invisível poderia ser simplificado foi uma das melhores decisões de produção do projeto.

Os detalhes domésticos deram identidade e presença humana à sala. Tênis, brinquedos, casaco, telefone, quadros e ferragens não foram trabalho inútil. Mas nem todos mereciam o mesmo investimento antes de as páginas dos trabalhos estarem demonstradas.

**Como melhorar:** avaliar cada adição em três perguntas: aparece no percurso aprovado, é reconhecível no tamanho projetado e contribui para a intenção da cena? Se não, simplificar ou adiar. Em um fundo distante com pouca interação, uma mídia de boa qualidade pode oferecer melhor resultado por unidade de esforço do que construir um universo procedural.

### O universo da TV e a apresentação dos trabalhos

A direção ganhou força quando você trouxe o portfólio existente, seus vídeos e sua identidade: chuvisco, formas brancas, fio vermelho e sol. Os registros mostram aprovações mais fortes depois da importação do conteúdo real e da distribuição espacial dos trabalhos. [E9]

Esse foi um ponto importante: o ambiente passou a ser desenhado em torno das obras, em vez de apenas preparar um palco vazio. Sua insistência em ver o conteúdo ainda de fora da TV também fortaleceu a continuidade.

Depois vieram vários ajustes de liberdade, sensibilidade, distância, scroll e placas. Parte disso era refinamento de preferência. Outra parte eram regressões: scroll dependendo de movimento do mouse, voo livre deixando de funcionar e placas se reposicionando fora do modo permitido. Esses casos são falhas de implementação e de cobertura do assistente, não apenas requisitos que você deveria ter explicado melhor. [E10, E11]

O contrato das placas finalmente ficou preciso: escolher abaixo ou ao lado na chegada guiada, salvar a posição relativa ao vídeo e não refazer esse encaixe ao olhar ao redor ou entrar em voo livre. Esse tipo de regra teria economizado várias rodadas se estivesse explícito no começo.

### Organização e encerramento de etapas

Você pediu nomes descritivos, módulos menores, separação de testes e um nome que distinguisse o universo da TV do objeto físico. Isso melhora manutenção e reduz a quantidade de código que uma tarefa precisa carregar. [E12]

Também houve consolidações tardias no Git. Os commits de 26 de outubro agrupam tooling, objetos, efeitos, integração e documentação depois de muitas iterações. Na inspeção desta revisão ainda havia uma quantidade grande de alterações locais, incluindo arquivos movidos para novos diretórios e conteúdo novo não rastreado. Um `git diff --stat` isolado parece mostrar grandes remoções porque não inclui o conteúdo dos arquivos novos; isso não prova perda de implementação. [E1]

Há ainda uma distinção importante no registro: você pediu que não houvesse tarefas daquela etapa em aberto, e a documentação passou a declarar escopo encerrado. Sua mensagem atual esclarece que o portfólio inteiro não terminou. Não é justo tratar isso simplesmente como um encerramento inventado pelo assistente; faltou registrar a diferença entre **etapa aprovada** e **produto pronto**. [E12]

## Onde você estava na direção certa

Seu critério visual foi ficando progressivamente mais útil para implementação. “A cascata parece um chuveiro” aponta um defeito de forma; “o casaco precisa tocar a poltrona” aponta uma relação espacial; “a câmera já deve alinhar X e Y antes da aproximação final” define um comportamento. Essas instruções reduziram a ambiguidade.

Você também acertou ao preservar explicitamente o que já estava bom. Em trabalhos visuais, uma revisão ampla pode destruir decisões difíceis de recuperar. Pedir alterações locais e salvar presets foi uma forma eficaz de conter esse risco.

Outra decisão boa foi não trazer dependências grandes para cada dificuldade. A implementação atual usa a base proposta, shaders próprios e soluções locais. Não há sinal de que fosse necessário acrescentar um motor completo de física ou um backend para alcançar o estágio atual.

Finalmente, você exigiu testes para os comportamentos que quebravam. Isso foi correto. A melhoria necessária é combinar esses testes com revisão visual e medição quando o problema envolve imagem ou desempenho.

## Onde faltou direção ou um método melhor

### Acabamento antes da prova do fluxo completo

O projeto investiu bastante na abertura antes de consolidar conteúdo, interação e retorno das páginas. Para um portfólio cujo objetivo declarado inclui emprego, a abertura tem valor autoral, mas o visitante precisa conseguir entender o trabalho e acessar informação profissional. Essa avaliação decorre dos próprios requisitos do produto. [E13]

Sua oportunidade é definir cedo o mínimo que prova esse resultado. Não significa eliminar a abertura; significa demonstrar que ela serve à descoberta dos trabalhos antes de expandir seu custo.

### Muitos pedidos sobre sistemas acoplados

Algumas rodadas misturaram sensibilidade, geometria, shader, tempo de entrada, texto e organização. Isso dificulta saber qual mudança corrigiu ou piorou a percepção.

Agrupar pequenos ajustes independentes é eficiente. Misturar ajustes que interagem com câmera e renderização exige uma verificação intermediária. O assistente deveria ter escolhido essas fronteiras sem exigir uma confirmação sua a cada alteração interna.

### Regras implícitas de estado

“Livre”, “parado”, “viajando” e “scroll” foram ganhando significado durante a implementação. Os bugs mostram o custo: um limite correto diante de uma obra podia ficar ativo no voo livre; um encaixe de placa podia continuar reagindo à câmera.

Antes de codificar, uma tabela pequena de estados e eventos teria sido mais útil do que várias descrições de sensação. Isso vale também para Pause, Replay, páginas abertas e movimento reduzido.

### Otimizar o processo com ferramentas sem provar a integração

Os registros do classificador de tarefas mostram tentativas de avisos, inicialização, suporte a diferentes ambientes e repetidos relatos de ausência do aviso. Mais tarde você pediu a exclusão do sistema porque não funcionava no VS Code. [E14]

A intenção de economizar recursos era razoável. O desvio foi investir na infraestrutura antes de demonstrar que o aviso funcionava no lugar e no momento necessários. Um classificador correto em teste não comprova uma integração útil na interface.

O wrapper de validação, por outro lado, resolve um problema local e observável: executa os checks, guarda os logs e reduz a saída rotineira. É uma otimização de escopo menor, com resultado mais fácil de verificar.

**Regra para a próxima vez:** antes de automatizar um fluxo externo, demonstrar uma única passagem completa. Se a integração não existe ou depende de contornos frágeis, limitar o experimento antes de construir o restante.

## As decisões técnicas principais explicadas

### React para a interface e Three.js para o espaço

React organiza conteúdo, diálogos e interface. Three.js representa câmera, objetos, materiais e renderização. React Three Fiber permite montar esse espaço com componentes React e atualizar movimento no ciclo de quadros por `useFrame`.

Isso é adequado para uma experiência que combina navegação espacial e páginas legíveis. No código, referências mutáveis guardam relógios e valores de movimento sem exigir uma atualização da interface React a cada quadro. O preço é coordenar dois ritmos: o estado da interface e a animação contínua.

TypeScript estrito ajuda a detectar incompatibilidades entre esses módulos. Ele não comprova enquadramento, sensação de movimento ou correção visual. Vite fornece o ambiente de desenvolvimento e o build. O lockfile permite repetir as versões resolvidas; as declarações `latest` no manifesto ainda tornam uma futura atualização deliberada menos restrita. Isso merece uma política de versões, sem presumir que seja a causa dos problemas observados. [E15]

### Arquitetura por responsabilidade

`Opening.tsx` compõe a interface, os diálogos e as URLs. `opening/` reúne canvas, câmera e entrada. `room/` contém a sala; `surfaces/`, materiais e agrupamento estático; `exterior/`, o fundo; `dither/`, o tratamento; `cup-spill/`, a água; `signal-world/`, o universo interno.

Dentro do universo, separar navegação, composição, mídia, placas e renderização permite investigar um problema sem ler tudo. Os testes de Opening também foram separados por comportamento. Essa é uma boa organização porque acompanha responsabilidades reais.

O cuidado é evitar fragmentar cada função em um arquivo. Um módulo deve ser pequeno o suficiente para entender sua responsabilidade e completo o suficiente para não exigir abrir dez arquivos para uma alteração local. O mapa de fontes em `docs/architecture.md` é parte importante dessa solução. [E16]

### Objetos procedurais e acabamento

Boa parte da sala é construída com geometrias e materiais definidos no código. Isso facilita ajustar proporções e evita depender de um pacote grande de modelos externos. Também torna várias relações geométricas testáveis.

O custo é que tecido, calçados e objetos orgânicos podem exigir muitas iterações para superar a aparência de blocos. A sua sequência de sofá, tênis e casaco mostra esse limite. No próximo projeto, vale testar um objeto representativo de cada categoria antes de escolher uma técnica para a sala inteira. Modelos externos poderiam ser uma alternativa para alguns itens, mas os registros não permitem afirmar que teriam sido menores ou mais rápidos sem comparação.

Compartilhar geometrias evita recriar a mesma forma. Agrupar malhas estáticas com materiais compatíveis reduz chamadas de desenho, isto é, pedidos da CPU para a GPU desenhar objetos. O agrupamento atual preserva índices da geometria e deixa de fora vidro, água, luzes e móveis animados.

Há um compromisso: grupos maiores tornam o descarte de partes fora de vista menos granular, e o agrupamento feito na montagem pode ficar desatualizado durante recarregamento parcial do desenvolvimento. O caso da janela corrigida após atualizar a página foi um falso alarme relevante: antes de refazer geometria, era preciso verificar uma montagem limpa. [E17]

### Água plausível com custo controlado

A água atual não é um simulador volumétrico completo. Ela combina tombamento coreografado, líquido interno simplificado, uma grade de água rasa na mesa, uma lâmina na borda e gotas com gravidade. A simulação avança em passos fixos de 1/120 de segundo; o desenho acompanha esse estado. [E4]

Isso permite proteger conservação de volume, obstáculos secos, recorte do tampo, Replay e independência da frequência de quadros. As gotas usam instâncias: muitas transformações compartilham geometria e material. As superfícies atualizam buffers de vértices, e as normais determinam como recebem iluminação.

A escolha foi adequada para uma ação dirigida, vista de um percurso conhecido. Ela teria sido menos adequada se o visitante precisasse derrubar objetos arbitrariamente e observar líquido de qualquer posição. A lição é escolher a simulação pela interação necessária, não pelo rótulo “física real”.

### Câmera e continuidade

Uma câmera tem posição, orientação e lente. Mover a posição suavemente não garante que o olhar ou o crescimento da TV no quadro pareçam suaves. A distância percebida também muda com a perspectiva.

Os pedidos de 24 de outubro foram esclarecendo isso: evitar mergulhar para o copo, alinhar antes de chegar e desacelerar sem uma correção brusca no fim. Depois a passagem entre universos precisava recuperar continuidade de movimento. Essas decisões não são contraditórias quando têm fases e instantes definidos; tornam-se difíceis quando tudo é descrito como “mais cinematográfico”. [E6]

Hoje os tempos compartilhados são 11,4 segundos de abertura e 2,2 segundos de avanço interno. A navegação guiada entre obras usa 2,8 segundos e uma curva de aceleração e frenagem; a orientação é combinada durante 0,9 segundo. O controle é liberado na passagem visual, sem esperar terminar o avanço interno. [E16]

Na próxima vez, especificar os marcos e a continuidade desejada: o que pode parar, o que deve atravessar a junção sem parar e qual objeto precisa permanecer visível. Testar posição, orientação e enquadramento em vários instantes e proporções de tela.

### O mesmo universo antes e depois da TV

O universo interno é desenhado em uma textura intermediária, chamada render target. Antes da entrada, essa imagem aparece na tela do aparelho; depois, a mesma composição ocupa o viewport. Isso evita mudar a aparência apenas porque a câmera cruzou o portal.

A diferença de cores que você apontou no fim era um problema do caminho de renderização. Preservar a mesma composição é uma correção mais estrutural do que ajustar as cores dos objetos separadamente nos dois lados.

Antes da entrada, um recorte de desenho, chamado scissor, limita o processamento de pixels à região necessária para a TV. A resolução do alvo é mantida. Depois, a sala deixa de ser renderizada sob o universo que cobre a tela. O estado do renderizador é restaurado inclusive em falhas. Isso reduz trabalho redundante sem exigir diminuir o detalhe aprovado. [E16]

### Vídeo para o exterior e para as obras

O exterior atual usa um vídeo comum sobre uma superfície curva distante. Porta, janela e varanda produzem oclusão e movimento relativo que ajudam a sensação espacial. Isso não transforma o vídeo em uma cena volumétrica; é uma solução visual adequada ao papel de fundo.

O vídeo do exterior tem cerca de **19,00 MB em unidades decimais**. É maior do que os arquivos JavaScript comprimidos, embora carregamento, cache e reprodução tenham comportamentos diferentes. Trocar um planeta procedural por vídeo simplifica a construção artística, mas introduz custo de mídia e decodificação. A implementação usa poster, acompanha Pause e Replay, não solicita o vídeo no modo de movimento reduzido e libera seu decoder na entrada da TV. [E18]

Nas obras, `VideoWork.tsx` usa previews e ativa vídeos pela proximidade no percurso; os distantes liberam a origem e o decoder. As mídias originais continuam no CDN do portfólio anterior. Isso economiza transferência e processamento concorrente, mas mantém dependência desses endereços e não comprova reprodução em todos os dispositivos. [E9]

### Conteúdo e páginas fora do WebGL

O conteúdo compartilhado permite abrir projetos e About por HTML e URLs próprias. A cena permanece montada durante os diálogos para preservar a exploração e permitir retorno à câmera anterior.

É uma boa decisão para tornar a experiência utilizável além da cena 3D. O conteúdo importado preserva títulos e mídia, mas há descrições vazias em `src/content/projects.ts`. Uma rota funcionando não equivale a uma página de projeto editorialmente concluída. Sua observação de que ainda faltam páginas é compatível com esse estado. [E9, E13]

## Como reduzir latência sem confundir os problemas

### Primeiro identificar qual espera está acontecendo

| Sintoma                            | O que investigar                                     | O que não comprova a solução      |
| ---------------------------------- | ---------------------------------------------------- | --------------------------------- |
| A página demora a aparecer         | HTML, CSS e JavaScript inicial                       | Apenas FPS depois de carregar     |
| A sala demora a ficar pronta       | Download 3D, construção, texturas e primeiro desenho | Apenas duração do build           |
| O começo dá saltos                 | Tempo dos primeiros quadros, inicialização e relógio | Apenas diminuir o tempo da câmera |
| O movimento parece lento           | Curva, distância projetada e tempo narrativo         | Apenas FPS médio                  |
| Há engasgos durante a navegação    | Quadros longos, CPU, GPU e vídeos concorrentes       | Apenas testes de matemática       |
| O trabalho com o assistente demora | Escopo, exploração, saídas e verificações repetidas  | Apenas mensagens mais curtas      |

O pedido de 27 de outubro reconhecia corretamente a dúvida entre queda de FPS e progresso não fluido da câmera. O método ideal teria sido registrar um perfil do mesmo trecho antes de escolher a correção. [E19]

### O que já foi implementado

- **Carregamento separado do canvas:** o HTML não precisa importar toda a cena para existir. `React.lazy` adia o módulo 3D; não elimina sua transferência nem sua construção.
- **Aquecimento antes do movimento:** a abertura espera dois quadros completos da sala e CRT e descarta o intervalo inicial. Isso evita consumir o percurso durante a preparação, mas não prova que a GPU ficará rápida depois.
- **Menos trabalho por quadro:** reaproveitamento de cálculos e vetores, agrupamento estático, buffers ativos da água e interrupção de trabalho da sala coberta.
- **Menos processamento invisível:** recorte do universo antes da entrada e liberação de vídeos distantes.
- **Resolução controlada:** o canvas limita o fator de resolução a uma faixa de 1 a 1,5. O número de pixels cresce com o quadrado desse fator; a qualidade aprovada não deve ser alterada sem comparação.

Essas medidas têm mecanismos técnicos concretos. Os logs disponíveis não demonstram quanto cada uma melhorou o tempo de carregamento ou o FPS. [E16]

### O que os números permitem afirmar

O build anterior à revisão de desempenho registrava um único JavaScript de **1.256,15 kB**, com **346,83 kB gzip**. O log posterior disponível no início desta revisão registrava entrada de **245,62 kB**, com **77,24 kB gzip**, e canvas de **1.055,31 kB**, com **284,04 kB gzip**. [E20]

Isso demonstra separação do pacote inicial. Não demonstra redução do total: nessa fotografia os dois JavaScripts somam aproximadamente 1.300,93 kB, e houve acréscimo de funcionalidades entre os registros. Também não demonstra uma redução proporcional da espera, pois o canvas é necessário logo no começo da experiência.

O aviso de chunk acima de 500 kB continua sendo um sinal para investigar. Alterar o limite do aviso apenas o esconderia. Criar mais chunks só ajuda quando muda de forma útil o que é solicitado e quando.

### Como medir na próxima rodada

Usar o build de produção e registrar o mesmo percurso em um computador de referência e um celular real. Comparar uma execução com cache vazio e outra com cache disponível. Registrar separadamente: primeira interface útil, sala pronta, início do movimento, entrada na TV e primeira obra utilizável.

Para fluidez, observar tempo de quadro e picos durante início, derramamento e passagem. Como referência matemática, 60 quadros por segundo deixam cerca de 16,7 ms por quadro; 30 deixam cerca de 33,3 ms. Isso não é uma meta já aprovada para o projeto. O dispositivo e a meta precisam ser escolhidos antes da comparação.

Mudar um mecanismo por vez, repetir o percurso e guardar o resultado. Se o tempo de quadro permanecer estável enquanto o movimento incomoda, investigar a curva e o enquadramento. Se houver picos, localizar o trabalho que ocupa aquele intervalo antes de mudar a direção artística.

## O que os testes acertaram e o que deixaram escapar

Os testes protegem invariantes importantes: conservação da água, obstáculos, limites geométricos, continuidade da câmera, navegação, Replay, URLs, retorno, reprodução e estado do renderizador. Isso é uma base de engenharia valiosa.

Mesmo assim, houve correções repetidas de scroll, placas, cor na passagem e enquadramento. Há duas explicações que precisam permanecer separadas: alguns requisitos evoluíram; outros já tinham sido pedidos e ainda falhavam. Um teste pode cobrir a função de encaixe de uma placa e não cobrir o momento errado em que o sistema volta a chamá-la.

Para regras de estado, o teste mais útil é a sequência completa. Por exemplo: chegar à obra A, salvar sua placa, olhar ao redor, iniciar voo livre, abrir e fechar a página e confirmar que o encaixe continua igual. Depois viajar até B e confirmar que apenas a chegada relevante atualiza a placa correspondente.

Para imagem e sensação, revisar o navegador continua necessário. O histórico registra limitações de acesso ao browser e de revisão visual. As aprovações manuais que você deu têm valor, mas não substituem uma verificação repetível de todas as proporções e dispositivos.

O log disponível antes desta revisão mostrava **200 testes em 40 arquivos**, além dos logs de lint, TypeScript e build. O README ainda mencionava uma verificação anterior de 183 testes. Isso ilustra por que números copiados em documentação envelhecem; cada resultado deve ter data e escopo. [E20]

## Um método mais eficiente para a próxima vez

### Primeiro estabelecer o resultado que o visitante precisa alcançar

Escrever em poucas linhas quem visita, o que deve entender e a ação principal. Escolher uma quantidade pequena de trabalhos prioritários para a primeira versão. Definir qual informação real cada página precisa conter e como ela será acessada sem depender da abertura inteira.

Separar o que está fechado do que está em exploração. “Sala aprovada” deve indicar enquadramento e aparência; não deve proibir uma correção necessária para evitar colisão da câmera. “Etapa encerrada” deve preservar o estado sem afirmar que o portfólio inteiro está pronto.

### Depois demonstrar uma experiência completa com pouco acabamento

Construir um percurso que vai da entrada até um projeto, abre sua página e retorna. Usar conteúdo real, uma mídia representativa e controles reais. Conferir desktop, retrato, teclado, touch quando disponível, movimento reduzido e falha de WebGL.

Esse protótipo revela cedo a arquitetura necessária e o custo básico. É o melhor momento para comparar transições e rejeitar ideias sem carregar todo o acabamento junto.

### Em seguida resolver as incertezas mais caras

Neste projeto seriam: água suficientemente convincente no quadro, passagem pela TV, navegação entre obras e comportamento das placas. Cada experimento precisa de um limite claro e de uma pergunta. Não precisa resolver uma categoria inteira de física ou de arte para demonstrar a solução.

Usar GUI quando várias decisões são de gosto e dependem de números. Salvar o preset, incorporar os valores e remover a ferramenta quando sua função acabar. Trazer referências visuais junto com a primeira solicitação de realismo, não apenas depois de várias tentativas.

### Só então expandir o acabamento

Priorizar o que é visível e contribui para a cena. Revisar o conjunto sob o tratamento gráfico final antes de multiplicar detalhes. Registrar uma imagem aprovada por marco e um commit recuperável correspondente.

Comparar a experiência inteira a cada grande adição. Um telefone melhor não deve causar um início perceptivelmente pior sem que esse custo seja identificado.

### Trabalhar com marcos recuperáveis

Fazer commits enquanto as etapas estão sendo concluídas: comportamento com seus testes e documentação relevante. Consolidações posteriores ajudam a organizar, mas não reconstroem com fidelidade cada estado aprovado.

Ao concluir uma etapa, registrar apenas resultado, restrições, verificação e continuação. Manter decisões atuais na fonte principal; guardar história suficiente para evitar regressões, sem obrigar toda tarefa a reler a investigação inteira.

## Como formular pedidos que evitam novas rodadas

Um bom pedido pode ser curto, desde que contenha resultado, reprodução, limites e critério de aceite. Não é necessário listar arquivos se você não sabe onde o comportamento vive; localizar a implementação é trabalho do assistente.

Exemplo baseado no problema das placas:

> Ao terminar a viagem guiada para uma obra, escolha uma posição abaixo ou ao lado do vídeo que caiba no enquadramento. Salve esse encaixe relativo ao vídeo. Olhar ao redor, entrar em voo livre, redimensionar e abrir ou fechar a página não devem refazer o encaixe. Uma nova chegada guiada pode atualizar apenas sua obra de destino. Replay limpa os encaixes. Preserve os tamanhos e as cores aprovados. Teste a sequência de mudança de modos e revise em paisagem e retrato.

Exemplo para a câmera:

> No trecho entre a passagem pelo sofá e a entrada na TV, há sensação de travamento. Primeiro diferencie picos de tempo de quadro de uma curva que desacelera demais. Preserve a ação do copo e o enquadramento aprovado. Corrija a causa identificada, teste continuidade e ausência de interseção com o sofá, e compare o trecho após recarregar a cena por completo. Relate separadamente o que foi medido e o que foi avaliado visualmente.

Para revisão visual, incluir instante, imagem atual, referência e diferença desejada é mais útil do que aumentar o tamanho do pedido. “Mais realista” pode abrir uma direção; precisa depois virar forma, material, iluminação, movimento ou composição.

## Como economizar trabalho e contexto

A economia mais importante vem de reduzir tentativas inválidas. Um pedido um pouco maior com critérios corretos pode custar menos no processo inteiro do que várias correções curtas. Não há proporção fixa que possa ser calculada pelos registros.

O que funcionou aqui foi manter instruções gerais pequenas, um mapa de fontes, arquivos por responsabilidade, testes focados durante iteração e validação completa no fechamento de código. O wrapper guarda detalhes em logs e mostra um resumo utilizável. Isso reduz ruído sem dispensar verificações.

O que merece contenção são leituras repetidas de arquivos grandes, reconstrução de contexto a cada ajuste pequeno e construção de ferramentas auxiliares sem integração comprovada. Um novo chat faz sentido em uma nova etapa coerente, acompanhado de um resumo factual. Trocar de chat não resolve requisitos contraditórios nem compensa um estado não registrado no repositório.

Não vale remover a revisão visual de todo trabalho gráfico apenas por seu custo. A alternativa é revisar marcos e defeitos específicos, com poucas capturas bem escolhidas, evitando navegação exploratória longa. Quando a ferramenta não consegue validar, isso deve aparecer claramente no resultado e ser coberto por uma revisão manual sua.

## O que eu faria agora neste projeto

1. **Preservaria a cena aprovada como base recuperável.** Revisaria o diff existente antes de organizar qualquer commit, incluindo os arquivos novos. Esta revisão não fez commits nem alterou a aplicação.
2. **Definiria uma página de projeto completa com conteúdo verdadeiro.** Objetivo, contexto, sua contribuição, mídias e créditos disponíveis. Nenhuma descrição pessoal ou profissional deve ser inventada para preencher lacunas.
3. **Usaria essa página como padrão para as demais.** Validaria legibilidade sobre o universo, URL direta, voltar/avançar, fechar e restauração da exploração.
4. **Faria uma revisão visual com montagem limpa.** Paisagem, retrato e os trechos críticos já conhecidos, inclusive entrada, sofá e placas. O episódio da janela mostra por que uma atualização completa faz parte desse roteiro.
5. **Mediria antes de outra rodada de otimização ampla.** Começo, entrada na TV e mídia em dispositivo real. Evitaria sacrificar o visual com base apenas em impressão ou aviso de build.
6. **Atualizaria o estado do produto.** Etapas visuais aprovadas e preservadas; páginas e detalhes ainda em desenvolvimento; critérios de conclusão definidos. Antes de publicar, verificar também a entrega direta das URLs no ambiente de hospedagem escolhido.

Esses itens são recomendações desta retrospectiva. Não foram executados nem representam autorização presumida para mudar a experiência.

## A lição que vale levar

Você não precisava ter todas as respostas no começo. Precisava organizar melhor os experimentos para que uma resposta nova não invalidasse tanto trabalho anterior.

Sua direção ficou mais forte quando se apoiou em referências, conteúdo real e relações observáveis. O processo ficaria mais rápido com uma prova completa do fluxo antes do acabamento, estados de interação explícitos, medições separadas de sensação e commits próximos das aprovações. O assistente deveria assumir mais responsabilidade por essas traduções e por demonstrar a correção, em vez de deixar você descobrir cada regressão na próxima rodada.

## Verificação feita nesta revisão

Uma nova execução de `npm.cmd run --silent validate:ai` passou: 200 testes em 40 arquivos, lint, TypeScript estrito e build de produção. Os tamanhos dos arquivos gerados coincidiram com os valores posteriores apresentados acima; o aviso sobre o chunk 3D permanece. Não foi feita uma nova revisão visual no navegador nem uma medição de desempenho em dispositivos. A aplicação e as decisões aprovadas não foram alteradas; o único arquivo de entrega criado foi esta retrospectiva em Markdown.

## Fontes e rastreabilidade

Os horários das conversas são armazenados em UTC; as datas narrativas foram consideradas no fuso de São Paulo. Identificadores abaixo permitem localizar os registros sem reproduzir conversas completas ou dados de configuração pessoais.

| Referência | Evidência consultada                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1         | `git log --all` e `git status --short`; commits `cd5855b`, `dfaa151`, `2b989f6`, `7b8a5cd`, `8e96f59`, `b47ffeb`, `cc58324`, `e535e26`, `55050ba`                                                                      |
| E2         | `docs/history/setup-and-blockout.md`; sessão `01a14d7f-20de-72e3-af62-735223078121`                                                                                                                                    |
| E3         | Sessão `01a14dec-ccdb-7c22-95ac-c79a2951dc3f`; pedidos e revisões do copo e da água                                                                                                                                    |
| E4         | `src/features/world/cup-spill/README.md`, `GlassSpill.tsx`, alterações locais e testes de água; sessão `01a150f9-414d-7b61-a697-43bdab3af800`                                                                          |
| E5         | Sessão `01a15c76-8430-7b81-9475-dbfd41c138a4`; proposta, rejeição e reversão da transição pela água                                                                                                                    |
| E6         | Sessões `01a16652-af9f-7d00-a322-99cfbc1c872c` e `01a16fcf-8571-72d1-9857-fa7bff361fad`; caminho da câmera e entrada pela TV                                                                                           |
| E7         | Sessões `01a170bf-0339-7923-8d01-a340cf33ac9d`, `01a170e7-7a09-77d2-b7ae-5d5136432162` e `01a1711a-56f3-7630-9032-16aef5f3dcb3`; qualidade da sala e GUI de dither                                                     |
| E8         | Sessões `01a173fe-6781-7730-96ba-0a815741d945`, `01a1750b-d77a-7dc1-aaa7-9607aba675a3` e `01a17525-321e-7521-980d-6a7ad8c06e75`; exterior e detalhes                                                                   |
| E9         | `docs/portfolio-source.md`, `src/content/projects.ts`, `signal-world/media/VideoWork.tsx`; sessão `01a179a3-c802-7cb3-9e9c-0e2c9c321dc2`                                                                               |
| E10        | Sessão `01a17a18-9ad0-7be2-9598-3708f5f6df8d`; scroll, voo livre e sol                                                                                                                                                 |
| E11        | Sessões `01a17af0-16bf-7451-af6b-44a2feee4941` e `01a17b3b-b192-7d40-b963-d8a04091b0a5`; evolução e correções das placas; `plaques/plaquePlacement.ts`                                                                 |
| E12        | Sessões `01a176df-8886-7222-91eb-a10b01898f0f` e `01a17b8d-0f2a-70a0-9ab4-8128562cd90e`; organização, commits e encerramento da etapa                                                                                  |
| E13        | `docs/product-requirements.md`, `src/content/projects.ts` e sua solicitação desta retrospectiva                                                                                                                        |
| E14        | Sessão `01a164ab-f155-7303-8f77-bc337a14d735` e registros relacionados ao classificador; relatos de falha no aviso e pedido posterior de remoção                                                                       |
| E15        | `package.json`, `vite.config.ts`, `docs/history/setup-and-blockout.md`                                                                                                                                                 |
| E16        | `docs/architecture.md`; `opening/OpeningCanvas.tsx`, `opening/CameraMove.tsx`, `opening/timing.ts`, `signal-world/rendering/TelevisionStatic.tsx`, `surfaces/staticRoomBatch.ts`                                       |
| E17        | Sessão `01a17bb3-0b7e-7581-9855-0fa731b22200`; confirmação de janela correta após atualização; contrato de agrupamento em `docs/architecture.md`                                                                       |
| E18        | `exterior/RealisticSpace.tsx`, `public/media/exterior/`, `docs/architecture.md`; tamanho local de `black-hole.mp4`: 19.001.643 bytes                                                                                   |
| E19        | Sessão `01a17b95-738b-7a13-87b8-3d4a4a0a4587`; relato de início lento, transição e substituição do exterior                                                                                                            |
| E20        | `.logs/review/build.before.log`, `.logs/test.log`, `.logs/lint.log`, `.logs/typecheck.log`, `.logs/build.log`, README e `scripts/ai-validate.mjs`; números históricos capturados antes da nova validação desta revisão |
