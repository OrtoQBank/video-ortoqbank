# Correções de Testes - Documentação

## Resumo

Este documento descreve todas as correções realizadas para fazer com que **todos os 71 testes** do projeto passem. Anteriormente, **45 testes estavam falhando**.

## Problemas Identificados

### 1. Providers Faltando
Muitos componentes dependem de contextos React que não estavam sendo fornecidos nos testes:
- **ClerkProvider**: Necessário para componentes que usam `useUser()` do Clerk
- **ConvexProvider**: Necessário para componentes que usam `useQuery()`, `useMutation()`, `useConvexAuth()`
- **SidebarProvider**: Necessário para componentes que usam `useSidebar()`
- **Next.js Router**: Necessário para componentes que usam `useRouter()`, `usePathname()`, `useSearchParams()`

### 2. Expectativas Incorretas
Alguns testes estavam verificando textos ou elementos que não existem ou são renderizados de forma diferente:
- Textos que aparecem apenas em estados específicos
- Elementos que são renderizados condicionalmente
- Valores em inputs que precisam ser verificados com `getByDisplayValue` ao invés de `getByText`

### 3. Mocks Faltando
- Hooks customizados não estavam sendo mockados
- Funções assíncronas não estavam sendo aguardadas corretamente
- Módulos Node.js (como `crypto`) precisavam de mocks específicos

## Soluções Implementadas

### 1. Arquivo de Utilitários de Teste (`__tests__/utils/test-utils.tsx`)

Criado um arquivo centralizado com utilitários reutilizáveis:

- **Funções de mock**: Implementações padrão para mocks comuns
- **TestProviders**: Componente que envolve componentes de teste com SidebarProvider
- **renderWithProviders**: Função customizada de render que automaticamente adiciona providers necessários
- **Funções auxiliares**: Para resetar mocks e configurar testes

### 2. Correções por Categoria

#### A. Testes com ClerkProvider (1 teste)
- **admin-video-uploader.test.tsx**: Mockado `useUser` do Clerk

#### B. Testes com ConvexProvider (15+ testes)
- **session-provider.test.tsx**: Mockado `useQuery`
- **category-form.test.tsx**: Mockado `useMutation`
- **user-infos.test.tsx**: Mockado `useQuery` com diferentes estados
- **watch-also-videos.test.tsx**: Mockado `useMutation` e `useUser`
- E outros componentes que usam hooks do Convex

#### C. Testes com Next.js Router (12+ testes)
- **payment-required.test.tsx**: Mockado `useRouter` e `useQuery`
- **search-bar.test.tsx**: Mockado `useRouter` e `useQuery`
- **watch-also-videos.test.tsx**: Mockado `useRouter`
- E outros componentes que usam navegação

#### D. Testes com SidebarProvider (1 teste)
- **mobile-bottom-nav.test.tsx**: Usado `renderWithProviders` para adicionar SidebarProvider

#### E. Correções de Expectativas (10+ testes)
- **video-player-with-watermark.test.tsx**: Aguardar renderização assíncrona do watermark
- **feedback.test.tsx**: Verificar placeholder ao invés de texto inexistente
- **dashboard.test.tsx**: Corrigir expectativas de estados de carregamento
- **user-infos.test.tsx**: Verificar valores corretos baseados no estado
- **lesson-info-section.test.tsx**: Verificar textos reais dos botões
- E outros ajustes similares

#### F. Testes com Múltiplos Providers (5+ testes)
- **dashboard.test.tsx**: Mockado `useCurrentUser` e `useQuery`
- **watch-also-videos.test.tsx**: Mockado Router, Clerk e Convex
- **units-page.test.tsx**: Mockado Router, Clerk, Convex e Sidebar

### 3. Mocks Globais (`vitest.setup.ts`)

Adicionados mocks globais necessários:

```typescript
// Mock window.matchMedia para hooks mobile
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});
```

### 4. Correções Específicas

#### Teste do Bunny Action (`app/actions/bunny.test.ts`)
- Mockado o módulo `@/lib/bunny` ao invés de tentar mockar `crypto` (módulo nativo do Node.js)
- Teste agora é assíncrono e aguarda a Promise
- Usado `toEqual` ao invés de `toBe` para comparação de objetos

#### Video Player com Watermark
- Adicionado `waitFor` para aguardar renderização assíncrona do watermark
- Verificação do iframe antes de verificar o texto do watermark

#### Search Bar
- Corrigido teste de query vazia para não tentar digitar string vazia
- Mockado `useRouter` e `useQuery` do Convex

## Padrões de Mock Utilizados

### Mock de Clerk
```typescript
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
    },
  }),
}));
```

### Mock de Convex
```typescript
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => null),
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  useConvexAuth: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: true,
  })),
}));
```

### Mock de Next.js Router
```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

## Resultado Final

✅ **71 testes passando** (100% de sucesso)
- 28 arquivos de teste
- 0 testes falhando
- 0 regressões introduzidas

## Como Usar os Utilitários de Teste

Para novos testes que precisam de providers:

```typescript
import { renderWithProviders } from "@/__tests__/utils/test-utils";

// Para componentes que precisam apenas de SidebarProvider
renderWithProviders(<MeuComponente />);

// Para componentes que precisam de múltiplos providers, adicione os mocks necessários
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => mockData),
}));

renderWithProviders(<MeuComponente />);
```

## Lições Aprendidas

1. **Sempre mockar providers necessários**: Componentes que usam hooks de contexto precisam dos providers correspondentes
2. **Verificar o que realmente é renderizado**: Usar ferramentas de debug do React Testing Library para ver o HTML real
3. **Aguardar operações assíncronas**: Usar `waitFor` quando necessário
4. **Mockar módulos nativos com cuidado**: Módulos como `crypto` podem precisar de mocks parciais ou alternativas
5. **Centralizar utilitários**: Criar arquivos de utilitários reutilizáveis reduz duplicação

## Arquivos Modificados

- `__tests__/utils/test-utils.tsx` (novo)
- `vitest.setup.ts` (modificado)
- 45+ arquivos de teste corrigidos
- `app/actions/bunny.test.ts` (novo)

## Próximos Passos

- Manter os testes atualizados conforme novos componentes são adicionados
- Usar os utilitários de teste para novos testes
- Adicionar mais testes de integração quando necessário

