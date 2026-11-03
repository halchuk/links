export interface ExpoFile {
  name: string;
  path: string;
  description: string;
  language: string;
  code: string;
}

export const SUPER_PROMPT = `# SUPER PROMPT: Links - App de Links em React Native + Expo (Dark Mode)

Você é um Engenheiro Front-end Sênior especialista em React Native, Expo e TypeScript.
Construa o aplicativo "Links", projetado para salvar e organizar links por categorias e tags, com busca instantânea em tempo real, visualização Dark Mode elegante e exportação em JSON e CSV.

## ESPECIFICAÇÃO TÉCNICA
- **Framework**: Expo (SDK 52+ com TypeScript).
- **Roteamento**: Expo Router v4 (file-based routing em \`app/\`).
- **Estilização**: NativeWind v4 (Tailwind CSS) em modo escuro permanente.
- **Banco de Dados**: \`expo-sqlite\` com a API moderna (\`openDatabaseSync\`, consultas tipadas e índices).
- **Navegador In-App**: \`expo-web-browser\` para abrir links com visualização Safari/Chrome nativa.
- **Exportação & Compartilhamento**: \`expo-file-system\` e \`expo-sharing\` para download nativo de JSON e CSV.
- **Ícones**: \`lucide-react-native\`.

## DESIGN SYSTEM (DARK MODE REFINADO)
- Fundo Canvas: \`#0A0E17\`
- Superfície de Cards: \`#131926\`
- Bordas: \`#1E2638\`
- Texto Primário: \`#F8FAFC\` | Secundário: \`#94A3B8\`
- Acento Primário: \`#10B981\` (Emerald 500)
- Zero-Pill Discipline: metadados estáticos como texto limpo separado por "·". Filtros interativos como botões de toque sutil.

Gere o código completo, sem placeholders, com tratamento de erros e tipagem estrita para todos os arquivos da arquitetura.`;

export const EXPO_FILES: ExpoFile[] = [
  {
    name: 'app/_layout.tsx',
    path: 'app/_layout.tsx',
    description: 'Layout raiz do Expo Router com StatusBar em Dark Mode e inicialização do SQLite.',
    language: 'tsx',
    code: `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '../services/database';
import '../global.css';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Falha ao inicializar SQLite:', err);
      }
    }
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E17', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E17' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0E17' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0A0E17' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-link"
          options={{
            presentation: 'modal',
            title: 'Novo Link',
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
    </View>
  );
}`,
  },
  {
    name: 'app/index.tsx',
    path: 'app/index.tsx',
    description: 'Tela inicial com Busca Instantânea, Filtro de Categorias, Tags Multi-seleção e Feed.',
    language: 'tsx',
    code: `import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Bookmark, X, Download } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { getLinks, getCategories, getAllTags, toggleFavorite } from '../services/database';
import { exportLinksAsJson, exportLinksAsCsv } from '../services/export';
import { LinkItem, Category } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const loadData = async () => {
    const [l, c, t] = await Promise.all([getLinks(), getCategories(), getAllTags()]);
    setLinks(l);
    setCategories(c);
    setAllTags(t);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      // 1. Categoria
      if (selectedCat !== 'all' && item.categoryId !== selectedCat) return false;

      // 2. Tags (Multi-seleção)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((st) => item.tags.includes(st));
        if (!hasAllTags) return false;
      }

      // 3. Busca de Texto Instantânea
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDomain = item.domain.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesDomain || matchesDesc || matchesTag;
      }

      return true;
    });
  }, [links, search, selectedCat, selectedTags]);

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: '#0A0E17',
      controlsColor: '#10B981',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0E17]">
      {/* Top Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#1E2638]">
        <View>
          <Text className="text-xl font-bold text-white tracking-tight">LinkKeeper</Text>
          <Text className="text-xs text-slate-400 mt-0.5">{filteredLinks.length} links indexados</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => exportLinksAsJson(links, categories)}
            className="p-2 bg-[#131926] border border-[#1E2638] rounded-lg"
          >
            <Download size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/new-link')}
            className="flex-row items-center gap-1.5 px-3 py-2 bg-emerald-500 rounded-lg"
          >
            <Plus size={16} color="#0A0E17" />
            <Text className="text-xs font-semibold text-[#0A0E17]">Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-5 py-3">
        <View className="flex-row items-center bg-[#131926] border border-[#1E2638] rounded-xl px-3.5 py-2.5">
          <Search size={18} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar por título, domínio ou tag..."
            placeholderTextColor="#64748B"
            className="flex-1 text-sm text-white ml-2.5"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Categories */}
      <View className="py-1">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          data={[{ id: 'all', name: 'Todos' }, ...categories]}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => {
            const active = selectedCat === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCat(item.id)}
                className={\`px-3 py-1.5 rounded-lg border \${
                  active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#131926] border-[#1E2638]'
                }\`}
              >
                <Text className={\`text-xs font-medium \${active ? 'text-emerald-400' : 'text-slate-400'}\`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Links List */}
      <FlatList
        data={filteredLinks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOpenLink(item.url)}
            className="bg-[#131926] border border-[#1E2638] rounded-xl p-4"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs text-emerald-400 font-mono">{item.domain}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id).then(loadData)}>
                <Bookmark size={16} color={item.isFavorite ? '#10B981' : '#64748B'} fill={item.isFavorite ? '#10B981' : 'none'} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-white leading-snug" numberOfLines={2}>
              {item.title}
            </Text>

            {item.description ? (
              <Text className="text-xs text-slate-400 mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}

            {/* Tags footer */}
            <View className="flex-row flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#1E2638]/60">
              {item.tags.map((tag) => (
                <Text key={tag} className="text-[11px] text-slate-400">
                  #{tag}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}`,
  },
  {
    name: 'services/database.ts',
    path: 'services/database.ts',
    description: 'Camada de persistência relacional SQLite moderna com suporte offline total.',
    language: 'ts',
    code: `import * as SQLite from 'expo-sqlite';
import { LinkItem, Category } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('linkkeeper.db');

  await db.execAsync(\`
    PRAGMA foreign_keys = ON;
    
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
  \`);

  // Categorias padrão
  const countResult = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM categories');
  if (countResult?.count === 0) {
    await db.runAsync('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', 'frontend', 'Front-end', '#06B6D4');
    await db.runAsync('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', 'react-native', 'React Native', '#10B981');
    await db.runAsync('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', 'ui-ux', 'UI & Design', '#8B5CF6');
    await db.runAsync('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', 'performance', 'Performance', '#F59E0B');
  }
}

export async function getLinks(): Promise<LinkItem[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM links ORDER BY createdAt DESC');
  return rows.map((r) => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
    isFavorite: Boolean(r.isFavorite),
  }));
}

export async function saveLink(link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = 'link_' + Date.now();
  const now = Date.now();
  await db.runAsync(
    \`INSERT INTO links (id, url, domain, title, description, imageUrl, faviconUrl, categoryId, tags, isFavorite, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
    id,
    link.url,
    link.domain,
    link.title,
    link.description || '',
    link.imageUrl || '',
    link.faviconUrl || '',
    link.categoryId,
    JSON.stringify(link.tags || []),
    link.isFavorite ? 1 : 0,
    now,
    now
  );
}

export async function toggleFavorite(id: string) {
  await db.runAsync('UPDATE links SET isFavorite = CASE WHEN isFavorite = 1 THEN 0 ELSE 1 END WHERE id = ?', id);
}

export async function getCategories(): Promise<Category[]> {
  return await db.getAllAsync<Category>('SELECT * FROM categories');
}

export async function getAllTags(): Promise<string[]> {
  const rows = await db.getAllAsync<{ tags: string }>('SELECT tags FROM links WHERE tags IS NOT NULL');
  const set = new Set<string>();
  rows.forEach((r) => {
    try {
      const arr = JSON.parse(r.tags);
      if (Array.isArray(arr)) arr.forEach((t) => set.add(t));
    } catch {}
  });
  return Array.from(set);
}`,
  },
  {
    name: 'services/export.ts',
    path: 'services/export.ts',
    description: 'Exportador para JSON e CSV com acionamento da folha de compartilhamento nativa (AirDrop, Drive, etc).',
    language: 'ts',
    code: `import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LinkItem, Category } from '../types';

export async function exportLinksAsJson(links: LinkItem[], categories: Category[]) {
  const payload = {
    appName: 'LinkKeeper',
    exportedAt: new Date().toISOString(),
    totalLinks: links.length,
    links: links.map((l) => ({
      title: l.title,
      url: l.url,
      domain: l.domain,
      category: categories.find((c) => c.id === l.categoryId)?.name || 'Geral',
      tags: l.tags,
      isFavorite: l.isFavorite,
      description: l.description,
      createdAt: new Date(l.createdAt).toISOString(),
    })),
  };

  const fileUri = FileSystem.cacheDirectory + 'linkkeeper_export.json';
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportar Links (JSON)',
    });
  }
}

export async function exportLinksAsCsv(links: LinkItem[], categories: Category[]) {
  const headers = ['Título', 'URL', 'Domínio', 'Categoria', 'Tags', 'Favorito', 'Data'];
  const escapeCsv = (str: string) => \`"\${(str || '').replace(/"/g, '""')}"\`;

  const rows = links.map((l) => [
    escapeCsv(l.title),
    escapeCsv(l.url),
    escapeCsv(l.domain),
    escapeCsv(categories.find((c) => c.id === l.categoryId)?.name || 'Geral'),
    escapeCsv(l.tags.join(', ')),
    l.isFavorite ? 'Sim' : 'Não',
    escapeCsv(new Date(l.createdAt).toLocaleDateString('pt-BR')),
  ].join(','));

  const csvContent = '\\uFEFF' + [headers.join(','), ...rows].join('\\r\\n');
  const fileUri = FileSystem.cacheDirectory + 'linkkeeper_export.csv';

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar Links (CSV)',
    });
  }
}`,
  },
  {
    name: 'package.json (Expo SDK 52)',
    path: 'package.json',
    description: 'Arquivo de dependências pronto para Expo SDK 52 com NativeWind e SQLite.',
    language: 'json',
    code: `{
  "name": "linkkeeper-app",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-sqlite": "~15.0.0",
    "expo-web-browser": "~14.0.0",
    "expo-file-system": "~18.0.0",
    "expo-sharing": "~13.0.0",
    "expo-status-bar": "~2.0.0",
    "lucide-react-native": "^0.475.0",
    "nativewind": "^4.0.1",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "react-native-svg": "15.8.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.12",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.3.3"
  }
}`,
  },
];
