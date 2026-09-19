# Campus Fácil — PWA mobile-first, mapa interativo do câmpus Francisco Beltrão (UTFPR)

## Contexto

Criar do zero um PWA em pt-BR centrado em um **mapa interativo** do câmpus Francisco Beltrão da UTFPR. O mapa é o hub: pinos por bloco/local, salas com horários, avisos de professores (prova/troca de sala/aula cancelada) destacados em laranja, chamados de infraestrutura com prioridade, e o RU com cardápio dentro do mapa. Consulta 100% pública; login institucional só para reportar, publicar aviso (professor) e acessar o Painel (estagiário).

O projeto atual é um template shadcn/React/Vite/TS sem backend. Será necessário: habilitar Enter Cloud (Postgres + Auth), react-leaflet, PWA (manifest + service worker), Auth com e-mail institucional e 8 telas/áreas.

## Decisões técnicas

- **Backend**: habilitar **Enter Cloud** (`supabase_enable`) — banco + auth explicitamente pedidos. Carregar o skill `enter_cloud` antes de escrever SQL/auth. Seed completo via migração SQL, incluindo usuários de demonstração.
- **Idioma**: 100% pt-BR (idioma único), strings direto nos componentes. Remover `import "./i18n/config"` do `main.tsx`, definir `<html lang="pt-BR">`. Arquivos de i18n do template ficam intocados.
- **Mapa**: `react-leaflet@^5` (React 19) + `leaflet` + `@types/leaflet`; camadas OSM (padrão) e Esri World Imagery (satélite) com atribuição; pinos via `L.divIcon` (SVG amarelo, letra do bloco no pino) — evita problemas de assets de ícone; animação de pulso CSS para pino de bloco com aviso ativo.
- **Login institucional**: e-mails `@alunos.utfpr.edu.br` → papel `aluno`, `@utfpr.edu.br` → papel `professor`; outros domínios rejeitados no front-end E no trigger do banco (que cria `profiles`). Papel `estagiario` definido manualmente. Confirmação de e-mail desativada.
- **PWA**: `manifest.webmanifest` + `sw.js` estáticos em `public/`; ícone (pin de mapa amarelo) gerado por IA; botão "Instalar app" via `beforeinstallprompt`.
- **Design tokens**: `index.css`/`tailwind.config.ts` — amarelo `#FFC107` (primary/destaque), verde `#22C55E` (confirmação/resolvido), **laranja `#F97316` exclusivo para avisos de alteração/prova**, vermelho `#EF4444` exclusivo para prioridade alta, fundo `#F9FAFB`, texto `#1F2937`, Inter (Google Fonts), radius 2xl, altura mínima de botão 48px, container `max-w-[480px]` centralizado.
- **Identidade/dispositivo**: sessão via `supabase.auth`; sem contagem por dispositivo neste escopo.

## Banco de dados (Enter Cloud)

Tabelas + RLS (leitura pública sem login para consulta):

- `profiles(id uuid PK ref auth.users, nome, email, papel text check in (aluno, professor, estagiario), criado_em)` — criado por trigger `handle_new_user` no `auth.users` (papel derivado do domínio do e-mail). RLS: SELECT/UPDATE só do próprio registro; trigger `prevent_role_change` impede o usuário de alterar o próprio papel.
- `locais(id, nome, categoria[Blocos|RU|Biblioteca|Coordenação|Informática], descricao, lat, lng)` — SELECT público.
- `salas(id, local_id FK locais, nome, tipo, andar)` — SELECT público.
- `horarios(id, sala_id FK salas, dia_semana[1..5], inicio, fim, disciplina, professor, turma)` — SELECT público.
- `avisos(id, sala_id FK salas, tipo[Prova|Mudança de sala|Aula cancelada], data_evento, horario, nova_sala_id FK salas null, mensagem, criado_por FK profiles, criado_em)` — SELECT público; INSERT apenas professor (policy checa `profiles.papel`).
- `chamados(id, categoria, sala_id FK salas null, local_texto, descricao, foto_url null, prioridade[alta|normal], status[aberto|em_andamento|resolvido], criado_por FK profiles, criado_em, atualizado_em)` — INSERT autenticado (trigger `set_chamado_prioridade` define `alta` se criador é professor, senão `normal`; status inicial `aberto`); SELECT do próprio (aluno/professor) ou todos (estagiário); UPDATE somente estagiário (transições de status).
- `cardapio(data, refeicao[almoco|janta], prato_principal, guarnicao, salada, sobremesa, vegetariana, alterado bool, observacao, abre, fecha, atualizado_em, PK(data, refeicao))` — SELECT público.

**Seed** (migração SQL): usuários demo com senha conhecida (criptografia via `auth.users.encrypted_password` com `crypt()`): 2 professores, 3 alunos, 1 estagiário (papel manual) — senhas documentadas na demonstração; locais reais com coordenadas provisórias próximas ao centro de Francisco Beltrão–PR (~`-26.082, -53.053`, todas editáveis em `locais`): Bloco A, Bloco B, Bloco C, RU, Biblioteca, Coordenação, Laboratório de Informática; 4–6 salas por bloco (~14 salas); horários reais de Seg a Sex (2 turnos) para 3 salas; 3 avisos (prova com mudança de sala, aula cancelada, mudança de sala) com datas futuras; 8 chamados (3 de professor = prioridade alta, 5 de aluno, status variados); cardápio de hoje (almoço e janta, ex.: arroz, feijão, frango grelhado, salada, fruta) com horários de abertura/fechamento.

## Estrutura de arquivos

Modificar:
- `package.json` — adicionar `leaflet`, `react-leaflet`, `@types/leaflet`.
- `index.html` — lang pt-BR, título/meta, `theme-color #FFC107`, manifest, Inter, apple-touch-icon.
- `src/index.css` / `tailwind.config.ts` — tokens (amarelo/laranja/verde/vermelho/fundo/texto), pulso de pino, foco visível.
- `src/router.tsx` — layout com `<Outlet/>` + rotas: `/` (Mapa), `/avisos`, `/reportar`, `/perfil`, `/painel`, `/sala/:id`, catch-all.
- `src/main.tsx` — remover i18n, registrar service worker (produção).
- `src/pages/Index.tsx` — reescrever como tela Mapa.

Criar:
- `src/lib/supabase.ts` (client), `src/lib/format.ts` (tempo relativo pt-BR, datas/horários), `src/lib/constants.ts` (categorias de locais, tipos de aviso, categorias de chamado, cores).
- `src/components/layout.tsx` (AppShell `max-w-[480px]` + `<Outlet/>` + BottomNav), `src/components/bottom-nav.tsx` (Mapa, Avisos, Reportar, Perfil + item "Painel" se estagiário; ativo amarelo).
- `src/components/auth-modal.tsx` — modal com abas "Entrar"/"Criar conta", validação de domínio institucional, fluxo "voltar para a ação pendente" (reportar/publicar aviso/painel).
- `src/components/page-header.tsx`, `chip.tsx`, `empty-state.tsx`, `priority-badge.tsx`, `status-steps.tsx` (etapas coloridas do chamado).
- `src/hooks/use-auth.ts` (sessão + profile + refresh), `use-query.ts` (locais/salas/horarios/avisos/chamados/cardapio via react-query).
- `src/components/map/campus-map.tsx` — Leaflet: tiles OSM/satélite, marcadores por categoria (pin SVG), pino laranja pulsante + badge para bloco com aviso ativo, busca (blocos+salas) com `flyTo`, chips de filtro (Todos, Blocos, RU, Biblioteca, Coordenação, Informática), botões "Legenda" e "Minha localização" (geolocalização).
- `src/components/sheets/local-sheet.tsx` — bottom sheet do pino (vaul, já no template): Bloco → lista de salas + botão "Ver salas do bloco"; RU → cardápio com abas Almoço|Janta (banners de alteração, "Atualizado às HH:MM").
- Páginas: `src/pages/MapaPage.tsx` (`/`), `src/pages/SalaPage.tsx` (`/sala/:id`), `src/pages/AvisosPage.tsx`, `src/pages/ReportarPage.tsx`, `src/pages/PerfilPage.tsx`, `src/pages/PainelPage.tsx`.
- `public/manifest.webmanifest`, `public/sw.js`, ícones PWA (gerados por IA).
- Migração SQL (schema + RLS + triggers + seed) via Enter Cloud.

## Telas (resumo dos requisitos-chave)

1. **Mapa (`/`, inicial)** — Leaflet fullscreen, centro ~`-26.082,-53.053`, zoom 17, toggle OSM/Satélite; busca sobre o mapa; chips de filtro; pinos coloridos por categoria (blocos mostram a letra; bloco com aviso → laranja pulsante + badge com nº de avisos); toque no pino abre bottom sheet (Bloco → salas + "Ver salas do bloco"; RU → cardápio); botões "Legenda" e "Minha localização"; botão discreto "Instalar app" (beforeinstallprompt).
2. **Bloco/salas** — bottom sheet com salas (nome, tipo em tag colorida, andar); sala com aviso ativo tem borda laranja + "Alteração"; tocar abre a sala.
3. **Sala (`/sala/:id`)** — título, bloco e tipo; seletor de dia (Seg a Sex, hoje selecionado) + aulas do dia (horário, disciplina, professor, turma); banner laranja se houver aviso ativo (tipo, data, horário, nova sala com botão "Ver a nova sala no mapa", mensagem, professor); botão outline "Reportar problema nesta sala" (abre `/reportar` pré-preenchido).
4. **Avisos (`/avisos`)** — lista de avisos ativos (card com borda laranja: tipo, sala, data, mensagem), ordenados por data; botão amarelo "＋ Publicar aviso" só para professor (aluno vê "Só professores podem publicar avisos"); formulário (tipo, sala original agrupada por bloco, data, horário, nova sala opcional, mensagem) → toast "Aviso publicado! Os alunos já podem ver no mapa."; avisos somem após `data_evento`.
5. **RU** — bottom sheet (pino e chip "RU"): abas Almoço|Janta com todos os pratos, horário de funcionamento, banner "Cardápio alterado hoje" + observação, "Atualizado às HH:MM"; dados de `cardapio` (editáveis via Enter Cloud/banco).
6. **Reportar (`/reportar`)** — exige login (AuthModal, retoma a ação após login). Form: categoria (Computador/Notebook, Projetor/Equipamento, Banheiro, Sala/Mobiliário, Iluminação, Wi-Fi/Internet, RU, Outro), local (bloco+sala ou "Área externa"), descrição, foto opcional, aviso de prioridade (professor = alta, aluno = normal) antes do envio, botão "Enviar chamado" → toast com o número do chamado.
7. **Perfil (`/perfil`)** — deslogado: "Entrar". Logado: nome, e-mail, badge de papel, lista "Meus chamados" com etapas (Aberto cinza → Em andamento amarelo → Resolvido verde), seção "Em breve" (2 cards desabilitados: "Personagens desbloqueáveis", "Localização em tempo real"), sair.
8. **Painel (`/painel`)** — só estagiário. Contadores (Abertos, Em andamento, Resolvidos hoje, Prioridade alta); lista ordenada: prioridade alta primeiro → abertos antes de resolvidos → mais antigos primeiro; chamado de professor: borda esquerda vermelha grossa + badge "PRIORIDADE ALTA – Professor" + fundo avermelhado (aluno: borda cinza); card com categoria, local, descrição, autor (nome+papel), há quanto tempo, foto, botões "Iniciar atendimento" e "Marcar como resolvido"; filtros por status, categoria e bloco.

## Componentes reutilizáveis

`Card`, `Button` (variantes amarela/verde/laranja/outline), `Chip`, `Toast` (sonner, já instalado), `EmptyState`, `BottomNav`, `BottomSheet` (vaul/drawer do template), `PriorityBadge`, `StatusSteps`, `Skeleton`. Loading com skeletons, erros em linguagem simples, toasts em toda ação.

## PWA

- `manifest.webmanifest`: "Campus Fácil", `theme_color #FFC107`, `display standalone`, ícones 192/512 (pin amarelo gerado por IA), `lang pt-BR`.
- `sw.js`: precache de `/` + assets, cache runtime de GETs do mesmo domínio (inclui cardápio p/ offline).
- Registro em `main.tsx` (produção) e botão "Instalar app" na tela do mapa quando disponível.

## Implementation checklist

- [ ] Habilitar Enter Cloud (`supabase_enable`) e carregar o skill `enter_cloud`; desativar confirmação de e-mail nas configurações de auth.
- [ ] Adicionar dependências `leaflet`, `react-leaflet`, `@types/leaflet`.
- [ ] Atualizar `index.html` (pt-BR, manifest, Inter, theme-color) e tokens em `index.css`/`tailwind.config.ts`.
- [ ] Criar `src/lib/supabase.ts`, `format.ts`, `constants.ts`, `hooks/use-auth.ts`, `hooks/use-query.ts`.
- [ ] Migração SQL via Enter Cloud: tabelas, RLS, triggers (`handle_new_user`, `set_chamado_prioridade`, `prevent_role_change`) e seed (usuários demo, 7 locais, ~14 salas, horários, 3 avisos, 8 chamados, cardápio de hoje).
- [ ] Layout + BottomNav (Mapa, Avisos, Reportar, Perfil, +Painel se estagiário) e rotas em `router.tsx`.
- [ ] `AuthModal`: abas Entrar/Criar conta, validação de domínio institucional com a mensagem exata, e retomada automática da ação pendente após login.
- [ ] Tela **Mapa**: react-leaflet (OSM/satélite), pinos customizados, pino laranja pulsante + badge de avisos, busca com `flyTo`, chips de filtro, Legenda, Minha localização, botão Instalar app.
- [ ] Bottom sheet do pino (bloco → salas; RU → cardápio com abas Almoço|Janta, banners e "Atualizado às HH:MM").
- [ ] Tela **Sala**: seletor de dia, aulas do dia, banner laranja de aviso com "Ver a nova sala no mapa", botão "Reportar problema nesta sala".
- [ ] Tela **Avisos**: lista de ativos, botão "＋ Publicar aviso" só professor, formulário e toast, expiração por data.
- [ ] Tela **Reportar**: exige login, formulário completo com foto opcional, prioridade calculada, toast com número do chamado.
- [ ] Tela **Perfil**: entrada/logout, meus chamados com etapas, seção "Em breve".
- [ ] Tela **Painel**: contadores, ordenação por prioridade/status/data, cards com destaque de professor, ações de status, filtros.
- [ ] PWA: manifest, sw.js, ícones, registro, botão de instalação.

## Verification checklist

- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm run build` sem erros.
- [ ] `get_console_logs` sem erros em todas as rotas.
- [ ] `website_screenshot` de `/`, `/avisos`, `/reportar`, `/perfil`, `/painel`, `/sala/:id` em `mobile_390` e `desktop_1280` (conteúdo ≤480px centralizado; bottom nav visível e não sobreposta).
- [ ] Sem login: mapa, blocos, salas, horários, avisos e RU acessíveis (sem tela de bloqueio).
- [ ] Login com e-mail de fora dos domínios institucionais é rejeitado com a mensagem exata; com `@alunos.utfpr.edu.br` entra como aluno e `@utfpr.edu.br` como professor; papel estagiário só via banco.
- [ ] Após login a partir de "Reportar"/"Publicar aviso"/"Painel", o fluxo retoma a ação pendente.
- [ ] Publicar aviso com conta de aluno é bloqueado (sem botão); com professor aparece toast e pino do bloco fica laranja com badge.
- [ ] Chamado criado por professor nasce com prioridade alta e badge correspondente; por aluno, normal.
- [ ] Painel: ordenação correta (prioridade alta → abertos → mais antigos) e botões mudam o status refletido na lista e em "Meus chamados".
- [ ] Avisos com data passada não aparecem.
- [ ] Toggle OSM/Satélite, "Minha localização" e "Legenda" funcionam sem erro.
- [ ] Manifest válido e `sw.js` registra sem erro no console; botão "Instalar app" visível quando o navegador permite.
