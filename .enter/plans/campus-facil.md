# Campus Fácil — PWA mobile-first para estudantes da UTFPR

## Contexto

Criar do zero um hub de serviços para estudantes da UTFPR em pt-BR: cardápio do RU, caronas, mapa do campus, projetos e relatos de problemas. O projeto atual é um template shadcn/React/Vite/TS sem backend — será necessário habilitar o Enter Cloud (banco de dados + autenticação), adicionar mapa Leaflet, PWA (manifest + service worker) e 6 telas + área do RU (admin).

## Decisões técnicas

- **Backend**: habilitar **Enter Cloud** (`supabase_enable`) — o usuário pediu explicitamente Supabase. Carregar o skill `enter_cloud` antes de escrever SQL/auth. Seed de dados de exemplo via migração SQL.
- **Idioma**: app 100% em pt-BR (idioma único). Strings escritas direto nos componentes; remover o import de `./i18n/config` do `main.tsx` e definir `<html lang="pt-BR">`. Arquivos de i18n ficam intocados (não usados).
- **Mapa**: `leaflet` + OpenStreetMap (sem chave de API). Usar `L.divIcon` com pin amarelo em SVG (evita problemas de assets de ícone do Leaflet). Adicionar dependências `leaflet` e `@types/leaflet`.
- **Senha do /admin**: verificada via função de backend (Enter Cloud) que lê o segredo `RU_ADMIN_PASSWORD` (guardado com `supabase_add_secret`, fallback `utfpr2026` se ausente) — cumpre "salva como variável de ambiente e verificada", sem depender de `VITE_*` (não suportado).
- **Identidade**: voto por dispositivo via `device_id` (uuid em localStorage). Sem cadastro.
- **PWA**: `manifest.webmanifest` + `sw.js` estáticos em `public/` (sem plugin), ícones gerados por IA (pin de mapa amarelo), botão "Instalar app" via evento `beforeinstallprompt`.
- **Design tokens**: atualizar `index.css`/`tailwind.config.ts` — amarelo `#FFC107` (primary), verde `#22C55E` (success), vermelho `#EF4444` (danger), fundo `#F9FAFB`, texto `#1F2937`, fonte Inter (Google Fonts), radius 2xl. Container centralizado com `max-w-[480px]`.

## Banco de dados (Enter Cloud)

Tabelas (todas com RLS: leitura pública anônima; inserção/atualização pública controlada; escrita do `cardapio` restrita ao fluxo /admin):

- `cardapio(id, data, refeicao[almoco|janta], prato_principal, guarnicao, salada, sobremesa, vegetariana, alterado bool, observacao, fechado bool, motivo_fechado, abre, fecha, atualizado_em)` — índice único `(data, refeicao)`.
- `avaliacoes_refeicao(id, data, refeicao, gostei bool, device_id, created_at)` — único `(data, refeicao, device_id)` (1 voto/dispositivo/refeição).
- `caronas(id, tipo[ofereco|procuro], nome, bairro, ponto_encontro, dias text[], horario, vagas, whatsapp, created_at)`.
- `locais(id, nome, categoria, descricao, latitude, longitude, horario)`.
- `projetos(id, nome, descricao, curso, tags text[], status[aberto|preenchido], whatsapp, created_at)`.
- `relatos(id, categoria, descricao, local, foto_url, status[recebido|em_andamento|resolvido], created_at)`.
- `votos_relatos(id, relato_id, device_id, created_at)` — único `(relato_id, device_id)`.

Seed via migração SQL: cardápio realista de hoje (arroz, feijão, frango grelhado, salada, fruta), 6 caronas variadas, 12 locais (categorias: Blocos, Alimentação, Biblioteca, Secretaria, Xerox, Banheiros, Ponto de ônibus, Estacionamento; coordenadas placeholder perto do centro do mapa ~ UTFPR Curitiba `-25.4418, -49.2752`), 4 projetos e 5 relatos com status variados.

## Estrutura de arquivos

Modificar:
- `index.html` — lang pt-BR, título/meta, theme-color `#FFC107`, link do manifest, Inter (Google Fonts), apple-touch-icon.
- `src/index.css` / `tailwind.config.ts` — tokens de cor, fonte, foco visível, altura mínima 48px.
- `src/router.tsx` — rota-pai com layout (Outlet) + rotas: `/` (Início), `/caronas`, `/mapa`, `/projetos`, `/reportar`, `/admin` (sem bottom nav) + catch-all.
- `src/main.tsx` — remover import i18n, registrar service worker.
- `src/pages/Index.tsx` — reescrever como tela Início.
- `package.json` — `leaflet`, `@types/leaflet`.

Criar:
- `src/components/layout.tsx` — AppShell: container `max-w-[480px]`, `<Outlet />`, `BottomNav`.
- `src/components/bottom-nav.tsx` — 5 itens (Início, Caronas, Mapa, Projetos, Reportar), ícone lucide + texto, ativo em amarelo, fixo embaixo (não cobre conteúdo: padding inferior).
- `src/components/page-header.tsx` — título + subtítulo (regra de UX 3).
- `src/components/chip.tsx`, `src/components/empty-state.tsx` (estado vazio com ação), `src/components/field.tsx` (label + input + validação em tempo real).
- `src/lib/supabase.ts`, `src/lib/device-id.ts`, `src/lib/format.ts` (tempo relativo pt-BR, máscara WhatsApp), `src/lib/constants.ts` (categorias, dias, turnos).
- `src/components/map/campus-map.tsx` — Leaflet + busca + chips de categoria + card inferior do marcador + "Como chegar" (Google Maps).
- `src/pages/home.tsx`, `caronas.tsx`, `mapa.tsx`, `projetos.tsx`, `reportar.tsx`, `admin.tsx`.
- `public/manifest.webmanifest`, `public/sw.js`, ícones PWA (gerados).
- Migração SQL de seed (via Enter Cloud) + função de backend `verificar-senha-ru`.

## Telas (resumo de requisitos-chave)

1. **Início** `/`: saudação; card grande Cardápio de hoje (abas Almoço|Janta, lista de pratos, banner vermelho "Cardápio alterado hoje" + observação, aviso amarelo "RU fechado hoje", "Atualizado às HH:MM"); avaliação 👍/👎 (contagem + % de aprovação no Supabase); grade 2x2 de atalhos (Caronas, Mapa, Projetos, Reportar); rodapé com link discreto "Área do RU" → `/admin`; botão discreto "Instalar app" (beforeinstallprompt).
2. **Área do RU** `/admin`: senha (verificada por função de backend), sem cadastro; formulário de cardápio com abas Almoço/Janta (todos os campos), checkboxes "alterado hoje" + observação, "RU fechado hoje" + motivo, horários, botão verde "Publicar cardápio" → toast "Cardápio atualizado!" + botão "Ver como o aluno vê".
3. **Caronas** `/caronas`: botão amarelo fixo "＋ Publicar carona"; filtros em chips (bairro, dia, turno, tipo); cards com badge colorida (verde "Ofereço vaga" / azul "Procuro carona"), origem → UTFPR, dias, horário, ponto de encontro, vagas, nome, tempo atrás; botão verde "Chamar no WhatsApp" → `https://wa.me/55{NÚMERO}?text=...`; form em bottom sheet (tipo, nome, bairro, ponto, dias multi, horário, vagas, WhatsApp com máscara, checkbox de consentimento obrigatório); posts com mais de 7 dias ocultos.
4. **Mapa** `/mapa`: Leaflet/OSM; busca sobre o mapa; chips de categoria filtram marcadores; card inferior ao tocar (nome, categoria, descrição, horário, "Como chegar" → Google Maps).
5. **Projetos** `/projetos`: botão "＋ Divulgar projeto"; cards (nome, descrição ≤200, curso, tags coloridas, status verde/cinza, botão "Quero participar" → WhatsApp); filtros por habilidade e status.
6. **Reportar** `/reportar`: form (categoria, descrição, local da tabela `locais`, foto opcional, "Enviar relato"); lista "Relatos recentes" com etapas coloridas (Recebido cinza → Em andamento amarelo → Resolvido verde), contador "X pessoas também viram" + botão "Também vi" (1 voto/dispositivo).

## Componentes reutilizáveis

`Card`, `Button` (variantes yellow/green/outline), `Chip`, `Toast` (sonner, já instalado), `EmptyState`, `BottomNav`, `PageHeader`, `Skeleton` (carregamento), `Badge`. Feedback com toasts em toda ação, spinners/skeletons, erros em linguagem simples.

## PWA

- `manifest.webmanifest`: name "Campus Fácil", short_name, `theme_color #FFC107`, `display standalone`, ícones 192/512 (pin amarelo gerado por IA), `lang pt-BR`.
- `sw.js`: cache estático (precache de `/` e assets) + cache runtime de GETs do mesmo domínio (inclui resposta do cardápio p/ offline do último cardápio).
- Registro em `main.tsx` (somente em produção).

## Implementation checklist

- [ ] Habilitar Enter Cloud (`supabase_enable`) e carregar o skill `enter_cloud`.
- [ ] Adicionar dependências `leaflet` e `@types/leaflet`.
- [ ] Atualizar `index.html` (pt-BR, manifest, Inter, theme-color, apple-touch-icon) e tokens em `index.css`/`tailwind.config.ts`.
- [ ] Criar `src/lib/supabase.ts`, `device-id.ts`, `format.ts`, `constants.ts`.
- [ ] Criar layout + `BottomNav` (5 abas, item ativo amarelo) e registrar rotas em `router.tsx` (inclui `/admin` sem bottom nav).
- [ ] Criar schema das 7 tabelas + RLS e migração de seed (cardápio de hoje, 6 caronas, 12 locais, 4 projetos, 5 relatos) via Enter Cloud.
- [ ] Criar função de backend `verificar-senha-ru` (lê segredo `RU_ADMIN_PASSWORD` com fallback `utfpr2026`).
- [ ] Tela **Início**: cardápio (abas, banners, horários, atualizado às), avaliação com % e limite por dispositivo, atalhos 2x2, link Área do RU, botão Instalar app.
- [ ] Tela **/admin**: login por senha + formulário completo + "Publicar cardápio" (upsert `(data, refeicao)`) + toast + "Ver como o aluno vê".
- [ ] Tela **Caronas**: filtros, lista com badges, botão WhatsApp, form em bottom sheet com máscara e consentimento, expiração de 7 dias, estado vazio amigável.
- [ ] Tela **Mapa**: Leaflet com busca, chips de categoria, marcadores customizados, card inferior com "Como chegar".
- [ ] Tela **Projetos**: cards, filtros habilidade/status, "Quero participar" → WhatsApp.
- [ ] Tela **Reportar**: form (com upload opcional de foto), lista de relatos com etapas coloridas e voto "Também vi".
- [ ] PWA: `manifest.webmanifest`, `sw.js`, ícones gerados, registro do SW, botão de instalação na tela inicial.
- [ ] Componentes reutilizáveis (Card, Button variantes, Chip, EmptyState, PageHeader) e estados de loading/erro com sonner.

## Verification checklist

- [ ] `pnpm lint` e `pnpm exec tsc --noEmit` sem erros; `pnpm run build` conclui.
- [ ] `get_console_logs` sem erros em todas as telas.
- [ ] `website_screenshot` das rotas `/`, `/caronas`, `/mapa`, `/projetos`, `/reportar`, `/admin` em `mobile_390` e `desktop_1280` (conteúdo centralizado ≤480px, bottom nav visível e não sobreposta por FAB).
- [ ] Fluxo de avaliação do cardápio grava no Supabase e o % atualiza sem recarregar; 2º voto do mesmo dispositivo não conta 2x.
- [ ] Publicar carona/projeto/relato → aparece na lista e dispara toast.
- [ ] "Chamar no WhatsApp"/"Quero participar" abrem `wa.me` com número correto.
- [ ] /admin: senha errada bloqueia; "utfpr2026" entra; salvar cardápio → toast + dado refletido na tela Início (incl. banner de alteração/RU fechado).
- [ ] Relato "Também vi" incrementa 1x por dispositivo; etapas de status corretas por relato.
- [ ] Manifest válido (nome, theme_color, standalone) e `sw.js` registra sem erro no console.
