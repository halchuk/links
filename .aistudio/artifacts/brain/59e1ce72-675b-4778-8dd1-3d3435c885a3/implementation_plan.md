# LinkKeeper: App de Curadoria e Gestão de Links (React Native & Expo)

Aplicativo mobile minimalista, rápido e elegante para salvar, categorizar, etiquetar e pesquisar links com visual Dark Mode refinado, extração automática de metadados OpenGraph, persistência local em SQLite e exportação nos formatos JSON e CSV.

---

## User Review & Decisões Confirmadas

> [!IMPORTANT]
> Todas as preferências de arquitetura e escopo levantadas na fase de alinhamento foram consolidadas:

- **Armazenamento e Persistência**: Local offline com `expo-sqlite` (com fallback robusto via `@react-native-async-storage/async-storage`), garantindo privacidade total, latência zero e funcionamento sem necessidade de servidor externo.
- **Captura e Enriquecimento de Links**: Extração automática em tempo de inserção de metadados OpenGraph (`og:title`, `og:description`, `og:image`, favicon e domínio normalizado), com opção de edição inline.
- **Navegação & Estilização**: **Expo Router (File-based Routing)** integrado com **NativeWind v4 (Tailwind CSS)** para layout utilitário, altamente escalável e performático.
- **Busca e Organização**: Mecanismo de busca instantânea multi-critério (filtro combinado de texto, categoria ativa e múltiplas tags selecionáveis simultaneamente).
- **Exportação de Dados**: Geração e download/compartilhamento nativo de relatórios completos em formato **JSON** e **CSV** estruturado.
- **Diretriz Visual**: Dark Mode puro (OLED-friendly com tons neutros profundos `#0B0F17`, superfícies `#151B26`, bordas sutis `border-zinc-800` e acento vibrante e sofisticado `Emerald/Cyan` `#10B981`), sem cápsulas/pills saturadas genéricas, com tipografia legível e contrastes WCAG AA.

---

## 1. Visão Geral e Conceito do Produto

### O que o app faz
O **LinkKeeper** resolve o problema do "mar de abas abertas" e notas desorganizadas. O usuário cola ou compartilha um link no app:
1. O app consulta os metadados do link em segundo plano (título, descrição, imagem de destaque e ícone do site).
2. O usuário pode atribuir uma categoria primária (ex.: *Frontend*, *Design*, *Artigos*, *Ferramentas*, *Docs*) e adicionar múltiplas tags (ex.: `react`, `typescript`, `ui`, `performance`).
3. Uma tela principal refinada exibe os links em cards minimalistas com visualização de densidade flexível, busca instantânea e filtros por chip discreto e tags.
4. O usuário pode abrir os links diretamente no navegador interno in-app (`expo-web-browser`) ou externo, copiar URLs, fixar favoritos e exportar todo o repositório em JSON ou CSV para backup ou integração com Notion/Obsidian.

---

## 2. Experiência do Usuário e Design Visual (Dark Mode Refinado)

### Filosofia Visual (Anti-Slop & Zero-Pill Discipline)
- **Paleta 60-30-10**:
  - **60% Fundo**: Fundo carvão escuro espacial (`#090D14` / `#0C111D`), eliminando o cinza desbotado padrão.
  - **30% Estruturas**: Superfícies de cards e listas em `#141A28`, com divisores finos em `#1F293D` e texto primário em `#F1F5F9`.
  - **10% Acentos**: Destaques pontuais em Esmeralda Menta (`#10B981`) para ações primárias e estados ativos de filtro.
- **Tipografia e Metadados Limpos**: Em vez de cápsulas arredondadas coloridas ("pills"), metadados estáticos (domínio, data de adição, categoria) são renderizados como texto inline elegante com separadores tipográficos (`·` ou `/`).
- **Interações Hápticas**: Resposta tátil sutil (`expo-haptics`) ao adicionar tags, copiar links ou realizar exportações.
- **Componentes Centrais**:
  - *Header Superior*: Barra de busca expansível com limpeza rápida e atalho para modal de inserção rápida (+).
  - *Seletor de Categorias*: Barra horizontal de rolagem suave com estado selecionado discreto (fundo sutil e texto em destaque, não botões gigantes).
  - *Nuvem de Tags Filtráveis*: Tags interativas selecionáveis em multi-seleção para refinar a busca instantânea.
  - *Card de Link*: Imagem de prévia (aspect ratio 16:9 ou thumbnail compacta à direita), domínio limpo com favicon, título de alto contraste em 2 linhas com elipse, e tags discretas no rodapé.
  - *Ações Rápidas (Swipe / Long Press)*: Copiar URL, favoritar, editar categoria/tags ou excluir.

---

## 3. Decisões Técnicas e Trade-offs

| Decisão | Opção Escolhida | Racional Técnico | Alternativa Descartada |
| :--- | :--- | :--- | :--- |
| **Banco de Dados** | `expo-sqlite` | Rápido, transacional, suporte a consultas SQL com índices para busca instantânea e suporte offline ilimitado | Armazenamento exclusivamente em nuvem (exige login e latência de rede) |
| **Estilização** | NativeWind v4 | Produtividade idêntica ao Tailwind do ecossistema web, sem overhead de CSS em runtime e totalmente compatível com Expo | StyleSheet puro (muito código boilerplate para dark mode e responsividade) |
| **Extração OpenGraph** | Parser client-side com fallback para micro-serviço/proxy | Extrai `<meta property="og:title">`, `<meta property="og:image">`, etc., permitindo prévias fiéis | Apenas salvar o URL bruto sem qualquer visualização ou metadados |
| **Exportação** | `expo-file-system` + `expo-sharing` | Permite gerar os arquivos `.json` e `.csv` no diretório de cache do aparelho e abrir a folha nativa de compartilhamento (AirDrop, WhatsApp, Google Drive, Arquivos) | Apenas copiar texto para o clipboard |

---

## 4. Arquitetura Técnica e Modelo de Dados

### Diagrama de Componentes e Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────┐
│                       Expo Router                            │
│  app/                                                        │
│   ├── _layout.tsx (Tema Dark, Providers, SQLite Provider)    │
│   ├── index.tsx (Feed principal, Busca, Filtros, Cards)      │
│   ├── new-link.tsx (Modal de inclusão + Scraping OG)         │
│   └── settings.tsx (Gerenciamento de Tags + Exportação)      │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                    State & Hook Layer                        │
│   ├── useLinks(searchQuery, selectedCategory, selectedTags)  │
│   ├── useCategoriesAndTags()                                 │
│   └── useLinkScraper(url)                                    │
└───────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌──────────────────────────────┐
│    expo-sqlite Database       │       │    Export Service            │
│  - Tabela: links              │       │  - JSON Stringifier          │
│  - Tabela: categories         │       │  - CSV Formatter & Escaper   │
│  - Tabela: tags               │       │  - expo-sharing sheet        │
│  - Tabela: link_tags          │       └──────────────────────────────┘
└───────────────────────────────┘
```

### Esquema do Banco de Dados Relacional (SQLite)

```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  favicon_url TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_favorite INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS link_tags (
  link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category_id);
```

---

## 5. O Super Prompt de Engenharia Front-end

Abaixo está o **prompt definitivo e auto-suficiente**, formatado com padrões de engenharia sênior, especificações de tipagem TypeScript, regras de UX/UI e lógica de negócio para ser alimentado em qualquer ambiente ou agente de código:

```markdown
# CONTEXTO & IDENTIDADE
Você é um Engenheiro de Software Front-end Sênior especialista em React Native, Expo, TypeScript e arquitetura de aplicações móveis limpas e performáticas.

# OBJETIVO
Construir um aplicativo completo, modular e polido para salvar e organizar links por categorias e tags, com busca instantânea em tempo real, visualização Dark Mode elegante e exportação em JSON e CSV.

# STACK OBRIGATÓRIA
- **Framework**: Expo (SDK mais recente com TypeScript).
- **Roteamento**: Expo Router (File-based routing em `app/`).
- **Estilização**: NativeWind v4 (Tailwind CSS) em modo escuro permanente (`dark`).
- **Banco de Dados Local**: `expo-sqlite` (usando a nova API moderna `openDatabaseSync` / transações síncronas/assíncronas) com tipagem estrita.
- **Navegador In-App**: `expo-web-browser`.
- **Compartilhamento e Arquivos**: `expo-file-system` e `expo-sharing`.
- **Ícones**: `lucide-react-native`.

# REQUISITOS VISUAIS E UI/UX (DARK MODE REFINADO)
1. **Paleta de Cores**:
   - Fundo da tela: `#0A0E17`
   - Superfície dos Cards e Modais: `#131926`
   - Bordas sutis: `#1E2638`
   - Texto Principal: `#F8FAFC`
   - Texto Secundário / Metadados: `#94A3B8`
   - Cor de Acento (Ações, tags ativas, botões primários): `#10B981` (Emerald 500)
   - Estados de Perigo (Exclusão): `#EF4444` (Red 500)
2. **Zero-Pill Discipline**:
   - Não coloque metadados estáticos em balões ou cápsulas ovais saturadas.
   - Mostre domínio, categoria e tempo de salvamento como texto tipográfico leve separado por "·".
   - Tags interativas funcionam como seletores sutis que mudam de estado visual ao serem tocadas.
3. **Micro-interações e Feedback**:
   - Estados de carregamento limpos com esqueletos (skeleton) ou spinners suaves.
   - Empty states elegantes quando não houver links ou resultados de busca, com botão claro de ação.

# MODELAGEM DE DADOS E ENTIDADES
Defina em `types/index.ts`:
```typescript
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface LinkItem {
  id: string;
  url: string;
  domain: string;
  title: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;
  categoryId?: string;
  categoryName?: string;
  tags: string[]; // array de nomes de tags
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LinkExportData {
  version: string;
  exportedAt: string;
  totalLinks: number;
  links: Array<{
    title: string;
    url: string;
    domain: string;
    category: string;
    tags: string;
    isFavorite: boolean;
    createdAt: string;
    description?: string;
  }>;
}
```

# FUNCIONALIDADES DETALHADAS A IMPLEMENTAR

### 1. Sistema de Banco de Dados (`services/database.ts`)
- Inicializar tabelas relacionais (`categories`, `links`, `tags`, `link_tags`).
- Semear categorias padrão na primeira execução: "Frontend", "UI/UX", "Artigos", "Ferramentas", "Geral".
- Métodos CRUD completos:
  - `saveLink(link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LinkItem>`
  - `getLinks(query?: string, categoryId?: string, tagNames?: string[]): Promise<LinkItem[]>`
  - `toggleFavorite(id: string): Promise<void>`
  - `deleteLink(id: string): Promise<void>`
  - `getCategories(): Promise<Category[]>`
  - `createCategory(name: string): Promise<Category>`
  - `getAllTags(): Promise<Tag[]>`

### 2. Scraping de Metadados OpenGraph (`services/scraper.ts`)
- Função `fetchLinkMetadata(url: string)`:
  - Normalizar URL (adicionar https se ausente).
  - Extrair o domínio (`new URL(url).hostname`).
  - Buscar HTML com timeout de 6s.
  - Extrair via regex ou DOM parser:
    - `og:title` ou `<title>`
    - `og:description` ou `<meta name="description">`
    - `og:image`
    - Favicon em `<link rel="icon">` ou `${origin}/favicon.ico`
  - Fallback elegante caso a página bloqueie scraping (usa o próprio domínio/URL como título).

### 3. Mecanismo de Busca Instantânea Multi-critério
- A busca deve responder imediatamente à digitação (`debounce` de 150ms).
- Filtrar simultaneamente por:
  - Termo digitado (procura em título, URL, domínio e descrição).
  - Categoria ativa (ou "Todos").
  - Múltiplas tags selecionadas (intersecção ou união).

### 4. Módulo de Exportação (`services/export.ts`)
- **Exportar JSON**:
  - Formatar todos os links em JSON identado com metadados e data ISO.
  - Gravar temporariamente via `expo-file-system`.
  - Disparar `expo-sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Exportar Links (JSON)' })`.
- **Exportar CSV**:
  - Criar colunas: `Título,URL,Domínio,Categoria,Tags,Favorito,Data de Criação`.
  - Fazer o escape correto de vírgulas, quebras de linha e aspas duplas nos campos de texto.
  - Salvar como `links_export_[timestamp].csv` e compartilhar.

### 5. Telas e Estrutura de Arquivos Recomendada
```
app/
├── _layout.tsx           // Stack layout, ThemeProvider, ToastProvider
├── index.tsx             // Feed principal, barra de busca, filtros de categoria e tags
├── new-link.tsx          // Modal de cadastro com input de URL e auto-preenchimento
├── categories.tsx        // Gestão e criação de novas categorias
└── export-modal.tsx      // Modal para disparar exportação JSON/CSV com estatísticas
components/
├── LinkCard.tsx          // Card de exibição do link com imagem, domínio, tags e menu de ações
├── SearchBar.tsx         // Input estilizado com botão de limpar
├── CategoryPills.tsx     // Lista horizontal de categorias com estilo sutil
├── TagFilterBar.tsx      // Lista de tags para filtragem rápida
└── EmptyState.tsx        // Mensagem e ilustração quando vazio
services/
├── database.ts
├── scraper.ts
└── export.ts
```

# CRITÉRIOS DE ACEITAÇÃO
1. O app inicia diretamente no modo Dark sem piscar temas claros.
2. Inserir uma URL preenche os campos automaticamente sem travar a interface.
3. A busca filtra os cards instantaneamente conforme o usuário digita.
4. Tocar no card abre o link via `expo-web-browser`.
5. Os botões de exportação geram arquivos válidos que podem ser abertos em Excel (CSV) ou parseados sem erro (JSON).
```
