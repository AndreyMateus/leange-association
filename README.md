# Le Ange Creators

Landing page de captação de creators pet para as unidades Le Ange Serra e Le Ange Mar. A abertura apresenta a história da marca e um carrossel com sete fotografias. As rotas `/serra` e `/mar` servem páginas próprias renderizadas no servidor; o formulário de candidatura fica na própria landing (seção final), com a unidade escolhida no próprio formulário; `/candidatura/serra` redireciona para `/serra?secao=candidatura` e `/candidatura/mar` continua existindo como página avulsa.

## Tecnologias e versões

As versões abaixo são as instaladas e registradas em `package-lock.json`:

| Tecnologia | Versão |
| --- | ---: |
| Node.js usado para gerar o build | 24.18.0 |
| React | 19.3.1 |
| React DOM | 19.3.1 |
| Vite | 7.3.8 |
| Tailwind CSS | 4.3.5 |
| Plugin React para Vite | 5.2.0 |
| Plugin Tailwind CSS para Vite | 4.3.5 |

Em produção, `server.mjs` responde com Brotli ou gzip quando o navegador aceita.

O `package-lock.json` preserva as versões exatas para novas instalações com `npm ci`. O projeto requer Node.js 20.19 ou superior (ou 22.12 ou superior).

Para produção, configure `PUBLIC_SITE_URL` com a origem pública real da landing (por exemplo, `https://parcerias.seudominio.com.br`). Essa configuração habilita URL canônica, endereço Open Graph e o sitemap; sem um domínio definido, o servidor não inventa URLs públicas.

### SSR e build

Esta versão usa React com SSR pelo servidor de desenvolvimento e pela build SSR do Vite. Next.js e Vite são responsáveis por pipelines de build distintos; como a solicitação pede uma build otimizada pelo Vite, o Vite é o compilador usado neste projeto. Next.js não faz parte deste scaffold.

## Como rodar

No PowerShell, abra a pasta `le-ange-parceiros` e siga estes passos:

1. Confira se o Node.js está instalado:

   ```powershell
   node --version
   npm --version
   ```

2. Instale as dependências de acordo com o arquivo de versões:

   ```powershell
   npm ci
   ```

3. Inicie o servidor local com renderização no servidor:

   ```powershell
   npm run dev
   ```

4. Abra [http://localhost:4173](http://localhost:4173) no navegador. A raiz encaminha para `/serra`; a opção Mar abre `/mar`.

5. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Build otimizada

Gere os arquivos de produção:

```powershell
npm run build
```

A build separa os arquivos otimizados do navegador em `dist/client` e o bundle de renderização no servidor em `dist/server`. Para servir a versão de produção localmente:

```powershell
npm start
```

Depois, abra [http://localhost:4173](http://localhost:4173). O servidor aceita a variável `PORT` para usar outra porta.

## Identidade visual e design system

### Paleta

| Token CSS | Valor | Uso principal |
| --- | --- | --- |
| `--color-green` | `#CAD766` | Destaques, seleções e botões claros |
| `--color-green-f` | `#979957` | Rótulos, ícones e acentos sobre fundos claros |
| `--color-black` | `#4D4D4D` | Texto principal e botões escuros |
| `--color-blue` | `#7AC4F3` | Acentos suaves |
| `--color-white` | `#FBFBFB` | Superfícies e texto em fundos escuros |
| `--color-blue-f` | `#04808c` | Links, foco de teclado e realces com bom contraste |

`--color-green-text` (`#65683c`) é um tom complementar para texto e ícones pequenos: preserva a identidade verde, mantendo contraste legível sobre superfícies claras. `--color-green-f` permanece disponível para detalhes visuais.

Tons auxiliares de papel, creme e verde-escuro aparecem como variáveis complementares em `src/styles.css`.

### Tipografia

- Títulos e marca: Comfortaa (`--font-comfortaa: "Comfortaa", sans-serif`).
- Texto, formulários e navegação: Urbanist (`--font-avenir: "Urbanist", sans-serif`).
- As fontes carregam pelo Google Fonts com fallback sans-serif; nenhuma fonte local foi criada.

### Componentes e regras

- Botões: cantos de `3px` (`--border-radius-btn`), área de toque confortável e estados de hover e foco.
- Campos: rótulos visíveis, entradas nativas, estados de foco e mensagens claras sobre o próximo passo.
- Navegação: cápsula flutuante com a marca, três links (Quem somos, Parceria, Dúvidas) num trilho com indicador verde que desliza até a seção visível, e o botão "Seja parceiro" com moeda. No celular ficam só os três links, sem menu escondido. Atalho para pular ao conteúdo.
- Rolagem: os itens do menu são botões que rolam por JavaScript até a seção marcada com `data-scroll-section` (sem `href` com âncora); toda navegação interna é feita em JavaScript (`scrollToSection` / `animateScrollTo` em `src/App.jsx`), sem âncoras `#id` na URL. Os links levam `data-scroll-to` e um `href` de reserva (`/serra?secao=duvidas`); ao abrir uma URL com `?secao=` (ou um `#id` antigo), a página rola até a seção e limpa o endereço. A animação desconta o menu fixo, para se a pessoa rolar por conta própria e respeita movimento reduzido.
- Rodapé: quatro colunas (Le Ange Creators, Precisa de mais informações?, Também estamos nas redes, Fale com a gente) com divisórias pontilhadas e linha final com a marca, o selo da parceria e o copyright.
- Cartões e imagens: bordas suaves, fotografia ampla e legendas com contraste. Os tratamentos de imagem respeitam a proporção e se ajustam ao espaço disponível.
- Movimento: animações de entrada na rolagem feitas com a [DOM Flowt](https://github.com/Staviro/dom-flowt) 2.1.0 (MIT), copiada em `src/vendor/dom-flowt/` (não há pacote npm). Os elementos usam `dom-flowt-is-visible`, `dom-flowt-type`, `dom-flowt-duration` e `dom-flowt-repeat` pelo helper `flowt()` de `src/App.jsx`; `DomFlowt.watch()` é chamado uma vez após a hidratação. Com `prefers-reduced-motion` ou sem JavaScript, o conteúdo aparece sem animação. O atributo `dom-flowt-delay` da documentação não é lido pela v2.1.0; o atraso usa `animation-delay`.
- Regra de negócio: creators podem ser remunerados por divulgar a Le Ange. Isso aparece na faixa verde do topo (`.paid-ribbon`), nos destaques do hero (`.hero__perks`), na lista da seção de parceria (`.partnership-points`) e no rodapé.
- Layout: mobile-first, largura fluida, tipografia com `clamp()` e regras de adaptação em 360, 480, 700, 850, 1100 e 1600 px, além dos breakpoints padrão do Tailwind (`sm`, `md`, `lg`, `xl`, `2xl`).
- Acessibilidade: HTML semântico, hierarquia de títulos, nomes acessíveis, texto alternativo, formulário associado a rótulos, seleção nativa de unidade e indicadores de foco visíveis.

## Resumo das seções

1. **Quem é a Le Ange** — título principal da página (h1) "Torne-se um parceiro da Le Ange", com a origem em 2018, a expansão para Búzios em 2023, o convite para creators remunerados e o botão "Quero ser parceiro". À direita, um celular ilustrado grava um vídeo na unidade (REC com cronômetro) enquanto chegam notificações de pagamento, moedas sobem e o saldo da parceria cresce. Os valores aparecem mascarados (`R$ ••••`), porque a remuneração é combinada caso a caso.
2. **Um pouco do que somos** — título grande e grade 2 × 2 nivelada (coluna da esquerda um pouco mais larga) com 4 fotos: duas da unidade da página e duas da outra, com legenda e texto alternativo. Ao clicar numa foto, ela se expande com animação (técnica FLIP) e ocupa quase toda a grade, com descrição e botão de fechar; as outras viram um menu de miniaturas ao lado (embaixo, no celular). Esc ou × fecham.
3. **Convite para creators (slides na rolagem)** — a seção ocupa a tela inteira e fica presa enquanto a rolagem leva da Le Ange Serra para a Le Ange Mar, com um corte diagonal e barra de progresso "01 · Serra — 02 · Mar". Cada slide tem foto de fundo, resumo, destaques, o botão "Quero criar na Serra / no Mar" e a política pet. Depois do Mar, a página continua. Sem JavaScript ou com movimento reduzido, os dois slides aparecem um embaixo do outro.
4. **Parceria remunerada** — o "Creator Pass" resume os dois passos (você divulga, você é remunerado) e, abaixo dele, uma faixa infinita passa cartões dos creators parceiros (capa e avatar na cor da rede social escolhida, com o ícone dela, a partir de `network` em `creators.js`; sem rede reconhecida, a cor da unidade; avatar, @, pet, depoimento e link do perfil), com botão para pausar. Abaixo dela, uma segunda faixa, no sentido inverso, mostra os ícones das redes usadas para marketing em vídeo com creators (Instagram, TikTok, YouTube, Facebook, Pinterest e Snapchat), definidos em `src/data/social-networks.js` a partir do [Simple Icons](https://simpleicons.org) (CC0). O Kwai, relevante para vídeo no Brasil, não tem ícone no Simple Icons e ficou de fora. Os nomes vêm de `src/data/creators.js`; só inclua quem autorizou a divulgação. Cada creator pode ter um `quote` (depoimento real, com autorização); com ele o cartão vira um depoimento. Com a lista vazia, `npm run dev` mostra uma prévia fictícia (`src/data/creators.demo.js`, marcada "Prévia · fictício", sem fotos de pessoas) e a build de produção mostra cartões "Exemplo de layout"; a prévia nunca vai para produção.
5. **Dúvidas frequentes** — nove respostas nativas em dropdown (`#duvidas`), incluindo remuneração, entregas, custos, pagamento, uso de conteúdo e regras pet.
6. **CTA final** — leva à página separada de candidatura da unidade selecionada.
7. **Formulário de candidatura** — última seção da landing, com campo "Unidade de interesse" (os botões "Quero criar na Serra / no Mar" já deixam a unidade selecionada); prepara uma mensagem de WhatsApp para revisão e envio, com link de retorno caso a abertura da nova aba seja bloqueada.
8. **Chatbot** — ao abrir, mostra um menu de opções pré-definidas (ou "Quero escrever minha dúvida"). Depois da escolha, o chat fica livre: a pessoa digita e envia mensagens, com sugestões em linha e indicador de digitação. As mensagens passam por `askAssistant` em `src/chat/assistant.js`, o ponto de integração da IA; enquanto ela não existe, a resposta é um aviso honesto com botão para enviar a mesma mensagem pelo WhatsApp. O arquivo explica como ligar a IA por uma rota no servidor (a chave da API nunca vai para o navegador).

## Conteúdo e contatos

- A unidade Serra usa as coordenadas que vieram com a solicitação. O texto da região se baseia nas informações do [Circuito Araras–Videiras](https://circuitoararasvideiras.com.br/regiao/) e da página oficial da [Le Ange Serra](https://www.pousadaleange.com.br/serra).
- As informações de Búzios, da Praia Rasa, piscina e suítes se baseiam na página oficial da [Le Ange Mar](https://www.pousadaleange.com.br/mar).
- As fotografias servidas pelo CDN oficial da Le Ange precisam de conexão com a internet. A seção do mapa foi removida.
- O ícone da marca no cabeçalho/rodapé e o favicon usam o arquivo de imagem fornecido pelo CDN da Le Ange.
- O formulário não grava dados em uma base própria: ele prepara uma mensagem para o WhatsApp oficial. A candidatura só é enviada quando a pessoa confirma e envia essa mensagem no WhatsApp.
- As rotas de candidatura usam `noindex, follow`; o sitemap contém as páginas principais Serra e Mar. Canonical e sitemap só são gerados quando `PUBLIC_SITE_URL` aponta para o domínio público correto.

## Desempenho

- Animações infinitas (celular gravando, faixas de creators e redes, moeda e brilho dos botões) pausam quando o bloco sai da tela.
- No celular: entradas da DOM Flowt viram um deslize vertical curto (380 ms), o menu não usa desfoque de fundo, o celular gravando não faz zoom contínuo e tem menos moedas, o Creator Pass não usa filtro de sombra, e os slides Serra/Mar têm percurso menor e sem escala nas fotos.
- Em telas de toque, efeitos que dependem de hover ficam desligados.
- CSS sem regras de seções que não existem mais (sobre, localização, mapa).

## Deploy (Netlify)

O site é publicado como arquivos estáticos pré-renderizados: `npm run build` compila com o Vite e, em seguida, `scripts/prerender.mjs` grava o HTML completo de `/serra`, `/mar` e `/candidatura/mar` (além de `robots.txt`, `sitemap.xml` e `404.html`) em `dist/client`. Título, descrição e Open Graph vêm de `scripts/pages.mjs`, o mesmo módulo usado pelo `server.mjs` local.

| Campo no Netlify | Valor |
| --- | --- |
| Base directory | vazio |
| Build command | `npm run build` |
| Publish directory | `dist/client` |
| Node | 22 (definido em `netlify.toml`) |

Os redirecionamentos (`/` → `/serra` e `/candidatura/serra` → `/serra?secao=candidatura`) e o cache de `/assets/*` estão em `netlify.toml`. O domínio para canonical e sitemap vem de `PUBLIC_SITE_URL` ou, no Netlify, da variável `URL` definida automaticamente. O `server.mjs` continua servindo só o desenvolvimento local (`npm run dev` e `npm start`).
