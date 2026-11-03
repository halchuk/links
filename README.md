# 🔗 Links — Gerenciador & Curador Inteligente de Links

> Aplicativo moderno, minimalista e rápido para salvar, categorizar, etiquetar e pesquisar links com visual Dark Mode refinado, extração automática de metadados OpenGraph, persistência local e exportação estruturada em JSON e CSV. Inclui especificações completas de arquitetura nativa para **React Native & Expo**.

![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)
![React: 19](https://img.shields.io/badge/React-19-cyan.svg)
![TypeScript: 5](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Tailwind CSS: 4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Expo Ready](https://img.shields.io/badge/Expo_SDK-52_Ready-10b981.svg)

---

## ✨ Principais Funcionalidades

- ⚡ **Busca Instantânea Multi-critério**: Filtragem em tempo real por título, domínio, descrição, categorias e nuvem de tags com multi-seleção simultânea.
- 🎨 **Dark Mode Elegante**: Paleta de alto contraste com superfícies escuras profundas (`#080C14`, `#121824`), acentos vibrantes em Esmeralda (`#10B981`) e tipografia limpa (*Zero-Pill Discipline*).
- 🤖 **Extração Automática de Metadados (OpenGraph)**: Ao colar uma URL, o aplicativo busca automaticamente título, descrição, imagem de prévia (16:9), favicon e domínio normalizado.
- 📱 **Experiência Mobile First**:
  - Barra de navegação inferior fixa (*Bottom Navigation Bar*) para uso com uma mão.
  - Barra de pesquisa em linha única e controles (Favoritos, Ordenação e visualização Grade/Lista) organizados na linha de baixo.
  - Cards compactos no celular: domínio reposicionado abaixo do título, tags e datas ocultadas para máxima densidade e legibilidade.
  - Simulador interativo com moldura de iPhone integrado na interface web.
- 💾 **Exportação & Backup Aberto**:
  - **JSON**: Payload estruturado com metadados completos, timestamps ISO e suporte para restauração/importação.
  - **CSV**: Compatível com Microsoft Excel, Google Sheets, Notion e Obsidian com codificação UTF-8 BOM para preservar acentuações.
- 📱 **Hub de Arquitetura React Native & Expo**:
  - Código-fonte nativo pronto para Expo Router v4, NativeWind v4 e persistência relacional com `expo-sqlite`.
  - Super Prompt técnico pronto para geração em ferramentas de IA ou implementação direta no Expo SDK 52.

---

## 🛠️ Tecnologias Utilizadas

### Front-end (Web App)
- **Framework**: [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com fontes Google (`Plus Jakarta Sans` e `JetBrains Mono`)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Motion](https://motion.dev/)

### Backend & Scraping
- **Servidor**: [Express](https://expressjs.com/) em [Node.js](https://nodejs.org/) montado com middleware do Vite
- **Endpoint**: `/api/scrape?url=...` com timeout, sanitização de HTML e fallback resiliente em caso de bloqueio

### Blueprint Mobile (React Native & Expo)
- **Roteamento**: `expo-router` v4 (File-based routing)
- **Estilização Mobile**: `nativewind` v4 (Tailwind nativo)
- **Banco de Dados Nativo**: `expo-sqlite` (API moderna `openDatabaseSync`)
- **Navegador In-App**: `expo-web-browser`
- **Compartilhamento & Arquivos**: `expo-file-system` e `expo-sharing`

---

## 📂 Estrutura do Projeto

```plaintext
├── src/
│   ├── components/
│   │   ├── CategoryBar.tsx       # Barra horizontal com categorias e contadores
│   │   ├── ExpoCodeHubModal.tsx  # Hub interativo com código Expo e Super Prompt
│   │   ├── ExportModal.tsx       # Modal de exportação JSON/CSV e importação
│   │   ├── LinkCard.tsx          # Card de link (modos Grid e Compact com regras mobile)
│   │   ├── NewLinkModal.tsx      # Modal de cadastro com auto-preenchimento OpenGraph
│   │   ├── SearchBar.tsx         # Busca rápida, filtro de favoritos e ordenação
│   │   ├── TagFilterBar.tsx      # Nuvem de tags multi-selecionáveis
│   │   └── Toast.tsx             # Notificações visuais flutuantes
│   ├── data/
│   │   ├── expoBlueprint.ts      # Código-fonte completo para o app Expo
│   │   └── seedData.ts           # Links e categorias pré-carregadas para demonstração
│   ├── services/
│   │   ├── exporter.ts           # Geração e parsing de arquivos JSON e CSV
│   │   ├── scraper.ts            # Consumo da API de metadados com fallback local
│   │   └── storage.ts            # Persistência local (CRUD completo)
│   ├── types/
│   │   └── index.ts              # Definições de tipagem TypeScript
│   ├── App.tsx                   # Componente principal, layouts mobile/desktop e simulador
│   ├── index.css                 # Configurações do Tailwind CSS e scrollbars discretas
│   └── main.tsx                  # Ponto de entrada React
├── index.html                    # Documento HTML principal com meta tags mobile
├── metadata.json                 # Metadados do projeto
├── package.json                  # Dependências e scripts
├── server.ts                     # Servidor Express full-stack com endpoint de scraping
├── tsconfig.json                 # Configurações do TypeScript
└── vite.config.ts                # Configurações do Vite e Tailwind
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** versão 20 ou superior instalada
- **npm** ou **yarn** / **pnpm**

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/links.git
   cd links
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Express full-stack na porta 3000 com Vite integrado |
| `npm run build` | Compila os arquivos de produção em `/dist` |
| `npm run start` | Executa a aplicação em modo de produção (`NODE_ENV=production`) |
| `npm run lint` | Executa a verificação estática de tipos com o TypeScript (`tsc --noEmit`) |
| `npm run preview` | Pré-visualiza o build de produção localmente |

---

## 📡 API do Servidor

### `GET /api/scrape`
Extrai dados OpenGraph e meta tags de qualquer página pública.

#### Parâmetros de Query:
- `url` (obrigatório): URL completa ou domínio a ser consultado (ex.: `https://github.com`).

#### Exemplo de Resposta:
```json
{
  "success": true,
  "metadata": {
    "title": "GitHub · Build and ship software on a single platform",
    "description": "Join the world's most widely adopted, AI-powered developer platform...",
    "imageUrl": "https://github.githubassets.com/assets/campaign-social-031d61.png",
    "faviconUrl": "https://github.githubassets.com/favicons/favicon.ico",
    "domain": "github.com",
    "url": "https://github.com/"
  }
}
```

---

## 📱 Estrutura do App em React Native & Expo

O projeto disponibiliza um Blueprint completo para empacotamento nativo no **Expo SDK 52**. O código pode ser acessado diretamente pelo botão **"Expo"** na interface ou copiado a partir de `src/data/expoBlueprint.ts`.

### Esquema do SQLite Nativo (`expo-sqlite`):
```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  imageUrl TEXT,
  faviconUrl TEXT,
  categoryId TEXT,
  tags TEXT,
  isFavorite INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_created ON links(createdAt DESC);
```

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para usar, estudar, modificar e distribuir.
