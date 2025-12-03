# 🔧 Debug: "Not authenticated" em Produção

## 🚨 Problema

Você está recebendo `{"error":"Not authenticated"}` ao tentar criar vídeos, tanto em desenvolvimento (curl) quanto em produção.

## 📋 Causas Possíveis

### 1. **Teste via curl (Desenvolvimento)**
- ❌ **Causa**: curl não envia cookies de sessão do Clerk
- ✅ **Solução**: Use a rota de teste `/api/bunny/test-create-video` (criada agora)

### 2. **Erro em Produção - Usuário não autenticado**
- ❌ **Causa**: Usuário não está logado via Clerk
- ✅ **Solução**: Verificar autenticação do Clerk

### 3. **Erro em Produção - Configuração do Clerk**
- ❌ **Causa**: Variáveis de ambiente do Clerk não configuradas
- ✅ **Solução**: Verificar configuração

---

## ✅ SOLUÇÕES

### Para Desenvolvimento Local

#### Opção A: Use a Rota de Teste (Mais Rápido)

```bash
# Nova rota SEM autenticação (apenas dev)
curl -X POST http://localhost:3000/api/bunny/test-create-video \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Video de Teste",
    "description": "Teste via curl",
    "isPrivate": true
  }'
```

#### Opção B: Teste via Interface Admin

1. Acesse `http://localhost:3000`
2. Faça login com Clerk
3. Vá para `/admin`
4. Aba "Aulas" → Faça upload

---

### Para Produção

#### 1. Verificar Configuração do Clerk

Certifique-se que estas variáveis estão configuradas no seu servidor de produção:

```bash
# Clerk (obrigatório)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# URLs do Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Como verificar**:
```bash
# No seu servidor de produção (Vercel/Railway/etc)
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY
```

#### 2. Verificar Webhook do Clerk

O Clerk precisa sincronizar usuários com o Convex:

```bash
# Webhook deve estar configurado no Clerk Dashboard
# URL: https://seu-dominio.com/api/webhooks/clerk
```

**Verificar no Clerk Dashboard**:
1. https://dashboard.clerk.com
2. Configure → Webhooks
3. Verifique se tem webhook apontando para sua API

#### 3. Testar Autenticação em Produção

```typescript
// Adicione logs temporários em create-video/route.ts
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    // ← ADICIONAR ESTES LOGS
    console.log('=== DEBUG AUTH ===');
    console.log('User:', user ? `${user.id} (${user.emailAddresses[0]?.emailAddress})` : 'NOT AUTHENTICATED');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('==================');
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // ...
```

Deploy e verifique os logs da plataforma (Vercel/Railway/etc).

#### 4. Verificar Middleware

Verifique se o middleware do Clerk está configurado:

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/clerk"],
  ignoredRoutes: ["/api/bunny/webhook"], // Webhook do Bunny não precisa auth
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## 🧪 TESTES DETALHADOS

### Teste 1: Rota de Teste (Dev)

```bash
curl -X POST http://localhost:3000/api/bunny/test-create-video \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "description": "Test",
    "isPrivate": true
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "videoId": "abc123-...",
  "libraryId": "12345",
  "note": "Created via TEST endpoint (no authentication)"
}
```

### Teste 2: Autenticação via Browser (Dev)

1. Abra **DevTools** → **Console**
2. Execute:
```javascript
fetch('/api/bunny/create-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Browser Test',
    description: 'Test from browser',
    isPrivate: true
  })
})
.then(r => r.json())
.then(console.log);
```

**Se retornar** `{"error":"Not authenticated"}`:
- ❌ Você não está logado
- ✅ Faça login em `/sign-in`

**Se retornar** `{"success": true, ...}`:
- ✅ Autenticação funcionando!

### Teste 3: Verificar Clerk em Produção

```bash
# No seu terminal local, testar produção:
curl https://seu-dominio.com/api/bunny/create-video \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_COOKIE" \
  -d '{"title":"Test","isPrivate":true}'
```

**Como obter cookie de sessão**:
1. Acesse seu site em produção
2. Faça login
3. DevTools → Application → Cookies
4. Copie o valor do cookie `__session`

---

## 🔍 DEBUG CHECKLIST

Use este checklist para diagnosticar o problema:

### Em Desenvolvimento:
- [ ] Variáveis de ambiente configuradas (`.env.local`)
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `BUNNY_API_KEY`
  - [ ] `BUNNY_LIBRARY_ID`
- [ ] Servidor dev rodando (`npm run dev`)
- [ ] Consegue fazer login no site
- [ ] Consegue acessar `/admin` (se sim, auth funciona!)

### Em Produção:
- [ ] Variáveis de ambiente configuradas no servidor
  - [ ] Clerk keys
  - [ ] Bunny keys
  - [ ] Convex URL
- [ ] Webhook do Clerk configurado e funcionando
- [ ] Middleware do Clerk configurado
- [ ] Consegue fazer login no site de produção
- [ ] Usuário aparece no Convex após login

---

## 🎯 SOLUÇÃO RÁPIDA

Se você quer apenas testar se o Bunny funciona (sem se preocupar com auth):

### Use a Rota de Teste:

```bash
# 1. Certifique-se que está em desenvolvimento
echo $NODE_ENV  # Deve estar vazio ou "development"

# 2. Teste a rota sem auth
curl -X POST http://localhost:3000/api/bunny/test-create-video \
  -H "Content-Type: application/json" \
  -d '{"title":"Quick Test","isPrivate":true}'

# 3. Se retornar success, o Bunny está funcionando!
```

### Para Produção - Use a Interface:

1. Acesse seu site de produção
2. Faça login normalmente
3. Vá para `/admin`
4. Faça upload pela interface

Se funcionar pela interface mas não pela API direta, o problema é **apenas** com autenticação via API externa (curl), não com o sistema em si.

---

## 📞 ERRO COMUM: Cookies não Persistem

Se você está tendo problemas com cookies em produção:

### Verificar `sameSite` e `secure`:

```typescript
// Pode ser necessário em produção (HTTPS)
// No seu middleware ou configuração:
{
  cookies: {
    secure: true,
    sameSite: 'lax'
  }
}
```

### Verificar Domínio:

- ✅ Clerk deve estar no mesmo domínio
- ❌ Se Clerk está em `auth.seusite.com` e app em `app.seusite.com`, cookies podem não funcionar

---

## 🆘 AINDA COM PROBLEMAS?

### Logs para Adicionar:

```typescript
// app/api/bunny/create-video/route.ts
export async function POST(req: Request) {
  try {
    console.log('🔍 [AUTH DEBUG] Starting request');
    console.log('🔍 [AUTH DEBUG] URL:', req.url);
    console.log('🔍 [AUTH DEBUG] Method:', req.method);
    
    const user = await currentUser();
    
    console.log('🔍 [AUTH DEBUG] User result:', {
      exists: !!user,
      id: user?.id,
      email: user?.emailAddresses[0]?.emailAddress,
    });
    
    if (!user) {
      console.log('❌ [AUTH DEBUG] User not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    console.log('✅ [AUTH DEBUG] User authenticated, proceeding...');
    // ...
```

Execute novamente e verifique os logs.

---

## ✅ RESULTADO ESPERADO

Após seguir este guia:

### Desenvolvimento:
- ✅ Teste via curl funciona com `/api/bunny/test-create-video`
- ✅ Teste via interface funciona em `/admin`
- ✅ Console mostra logs de autenticação

### Produção:
- ✅ Login funciona
- ✅ Upload via interface funciona
- ✅ Logs mostram usuário autenticado
- ✅ Vídeos são criados com sucesso

---

**Última atualização**: Dezembro 2024
**Status**: Rota de teste criada para debugging

