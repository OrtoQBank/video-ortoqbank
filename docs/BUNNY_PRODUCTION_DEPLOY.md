# Guia de Deploy para Produção - Integração Bunny.net

Este documento descreve o processo completo para fazer deploy da integração Bunny.net em produção.

## Visão Geral

A integração Bunny.net possui 3 componentes que precisam ser deployados:

1. **Convex Backend** - Funções, HTTP actions, webhooks
2. **Next.js Frontend** - UI e Server Actions
3. **Configuração Bunny** - Webhook apontando para produção

## Pré-Deploy Checklist

Antes de fazer deploy, verifique:

- ✅ Todos os testes passaram (ver `BUNNY_TESTING_GUIDE.md`)
- ✅ Código está na branch `fix/bunny-integration-production`
- ✅ Todas as env vars de desenvolvimento estão funcionando
- ✅ Build local passa sem erros: `npm run build`
- ✅ Lint passa sem erros: `npm run lint`
- ✅ Commits estão organizados e com mensagens claras

## Ordem de Deploy

**IMPORTANTE**: Siga esta ordem para evitar downtime:

```
1. Convex Backend (primeiro)
2. Configuração de Env Vars (Convex produção)
3. Teste do Webhook URL
4. Configuração Bunny Webhook (produção)
5. Next.js Frontend (último)
6. Validação Completa
```

## Passo 1: Deploy do Convex

### 1.1 Preparar Ambiente de Produção

```bash
# Garantir que está na branch correta
git checkout fix/bunny-integration-production

# Pull das últimas mudanças (se trabalhando em equipe)
git pull origin fix/bunny-integration-production

# Verificar se Convex está autenticado
npx convex dev --once

# Se não autenticado, fazer login
npx convex login
```

### 1.2 Deploy para Produção

```bash
# Deploy para produção
npx convex deploy --prod

# Aguardar conclusão
# ✓ Functions deployed successfully
```

**Saída esperada:**
```
Deploying functions to production...
✓ Pushed new code and schemas.
✓ Deployed successfully.

Deployment URL: https://your-deployment.convex.cloud
```

### 1.3 Copiar URL do Deployment

A URL exibida será necessária para:
- Variáveis de ambiente do Next.js
- URL do webhook no Bunny

**Conversão para webhook:**
- Deployment URL: `https://happy-animal-123.convex.cloud`
- Webhook URL: `https://happy-animal-123.convex.site/bunny/webhook`

## Passo 2: Configurar Variáveis de Ambiente

### 2.1 Convex (Produção)

1. Acesse: https://dashboard.convex.dev
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Configure as seguintes variáveis:

```bash
# API do Bunny
BUNNY_API_KEY=<sua-api-key-producao>
BUNNY_LIBRARY_ID=<library-id-producao>
BUNNY_EMBED_SECRET=<embed-secret-producao>

# Webhook Secret (configurar após criar webhook no Bunny)
BUNNY_WEBHOOK_SECRET=<webhook-secret-producao>
```

**IMPORTANTE**: Use credenciais de **PRODUÇÃO** do Bunny, não de desenvolvimento!

### 2.2 Next.js (Vercel/Plataforma de Hosting)

No dashboard da sua plataforma de hosting (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_BUNNY_LIBRARY_ID=<library-id-producao>

# Outras variáveis existentes
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# etc.
```

### 2.3 Redeploy Convex (se mudou env vars)

```bash
# Após adicionar env vars, redeploy
npx convex deploy --prod
```

## Passo 3: Configurar Webhook no Bunny (Produção)

### 3.1 Acessar Bunny Dashboard de Produção

1. Acesse: https://dash.bunny.net/stream
2. Selecione sua **Video Library de PRODUÇÃO**
3. Vá em **Settings** → **Webhooks**

### 3.2 Adicionar Webhook de Produção

1. Clique em **"Add Webhook"**
2. Configure:

```
Webhook URL: https://your-deployment.convex.site/bunny/webhook
```

3. Marque eventos:
   - ✅ Video Uploaded
   - ✅ Video Encoded  
   - ✅ Video Processing Failed

4. Ative **Webhook Secret**:
   - Toggle ON
   - Copie o secret gerado
   - Adicione ao Convex como `BUNNY_WEBHOOK_SECRET`
   - Redeploy Convex: `npx convex deploy --prod`

5. Clique em **Save Webhook**

### 3.3 Testar Webhook

No Bunny Dashboard:

1. Clique em **"Test Webhook"** ao lado do webhook
2. Selecione evento: **Video Encoded**
3. Clique em **Send Test**
4. Deve retornar: **✅ 200 OK**

Se retornar erro, veja seção de Troubleshooting abaixo.

## Passo 4: Deploy do Next.js

### 4.1 Merge para Main (se aplicável)

```bash
# Após testar Convex em produção
git checkout main
git merge fix/bunny-integration-production
git push origin main
```

### 4.2 Deploy Automático (Vercel)

Se estiver usando Vercel com auto-deploy:

1. Push para `main` triggerará deploy automático
2. Aguarde build completar
3. Vercel exibirá URL de produção

### 4.3 Deploy Manual

```bash
# Build local
npm run build

# Deploy para sua plataforma
# Vercel:
vercel --prod

# Netlify:
netlify deploy --prod

# Outro servidor:
npm start  # ou pm2, docker, etc.
```

## Passo 5: Validação em Produção

### 5.1 Smoke Tests

Execute estes testes básicos em produção:

#### Teste 1: Criação de Vídeo

```
1. Acesse /admin/units-lessons em produção
2. Faça upload de vídeo de teste (pequeno)
3. Deve completar sem erros
```

**Verificar:**
- ✅ Upload completa
- ✅ Vídeo aparece no Bunny Dashboard
- ✅ Registro criado no Convex produção

#### Teste 2: Webhook

```
1. Aguarde vídeo processar (1-2 minutos)
2. Verifique logs: npx convex logs --prod
```

**Verificar:**
- ✅ Log de webhook recebido
- ✅ Status atualizado para "ready"
- ✅ URLs preenchidas (hlsUrl, thumbnailUrl)

#### Teste 3: Player

```
1. Acesse lesson com vídeo como usuário
2. Player deve carregar e reproduzir
```

**Verificar:**
- ✅ Player carrega
- ✅ Vídeo reproduz
- ✅ Watermark aparece
- ✅ Sem erros no console

### 5.2 Monitoramento

Configure alertas para:

```bash
# Convex Logs
npx convex logs --prod --watch

# Procure por:
# ✅ "Bunny webhook received"
# ❌ Erros 500, 401, etc.
```

## Troubleshooting de Produção

### Deploy Convex Falha

**Erro**: "Deployment failed: Schema validation error"

**Solução**:
```bash
# Verificar schema localmente
npx convex dev --once

# Se passou local, limpar e tentar novamente
npx convex deploy --prod --debug
```

### Webhook Não Funciona em Produção

**Sintomas**: Vídeos processam mas status não atualiza

**Debug**:

1. Verificar URL do webhook no Bunny:
   - Deve ser `.convex.site` (não `.convex.cloud`)
   - Deve incluir `/bunny/webhook`

2. Testar manualmente:
   ```bash
   curl -X POST https://your-deployment.convex.site/bunny/webhook \
     -H "Content-Type: application/json" \
     -d '{"VideoGuid":"test","Status":4,"VideoLibraryId":"123"}'
   ```

3. Verificar logs:
   ```bash
   npx convex logs --prod | grep webhook
   ```

4. Verificar signature se configurada:
   - `BUNNY_WEBHOOK_SECRET` deve estar igual no Bunny e Convex

### Variáveis de Ambiente Não Funcionam

**Sintomas**: Erros "env var not configured"

**Solução**:

1. Listar env vars do Convex:
   ```bash
   npx convex env list --prod
   ```

2. Verificar Next.js recebeu as env vars:
   ```javascript
   // No console do browser em produção
   console.log(process.env.NEXT_PUBLIC_CONVEX_URL);
   ```

3. Se faltando, adicionar e redeploy:
   ```bash
   # Convex
   npx convex deploy --prod
   
   # Next.js (Vercel)
   vercel --prod
   ```

### Player Não Carrega

**Sintomas**: Player mostra erro ou loading infinito

**Debug**:

1. Abrir DevTools → Network
2. Procurar request `/bunny/embed-token`
3. Verificar resposta

**Possíveis causas**:

- ❌ `BUNNY_EMBED_SECRET` incorreta
- ❌ Token expirado
- ❌ Vídeo não está "ready"
- ❌ CORS bloqueando request

## Rollback em Caso de Problemas

### Rollback do Convex

```bash
# Ver deployments anteriores
npx convex deployments --prod

# Fazer rollback para deployment anterior
npx convex rollback <deployment-id> --prod
```

### Rollback do Next.js (Vercel)

1. Acesse Vercel Dashboard
2. Vá em **Deployments**
3. Clique em deployment anterior
4. Clique em **"Promote to Production"**

## Monitoramento Pós-Deploy

### Métricas para Acompanhar

1. **Taxa de Sucesso de Upload**
   - Meta: >95%
   - Como: Logs do Convex + Bunny Dashboard

2. **Taxa de Recebimento de Webhook**
   - Meta: >99%
   - Como: Comparar vídeos processados vs webhooks recebidos

3. **Tempo de Processamento**
   - Meta: <5min para vídeos pequenos
   - Como: Timestamp de upload vs webhook

4. **Erros de Player**
   - Meta: <1%
   - Como: Error tracking (Sentry, LogRocket, etc.)

### Logs Importantes

```bash
# Monitorar produção em tempo real
npx convex logs --prod --watch

# Filtrar por erros
npx convex logs --prod | grep -i error

# Filtrar por webhooks
npx convex logs --prod | grep webhook
```

## Checklist Final

Após deploy completo, verificar:

- ✅ Convex deployed com sucesso
- ✅ Variáveis de ambiente configuradas (Convex e Next.js)
- ✅ Webhook configurado no Bunny (produção)
- ✅ Webhook testado manualmente (200 OK)
- ✅ Next.js deployed e acessível
- ✅ Upload de teste funciona
- ✅ Webhook atualiza status
- ✅ Player reproduz vídeo
- ✅ Logs sem erros críticos
- ✅ Monitoramento configurado
- ✅ Equipe notificada do deploy
- ✅ Documentação atualizada

## Próximos Passos Pós-Deploy

1. **Monitorar por 24h**: Fique atento a erros nos primeiros dias
2. **Treinar equipe**: Compartilhar documentação com time
3. **Configurar alertas**: Setup de alertas para erros críticos
4. **Documentar incidentes**: Se algo der errado, documentar para futuro
5. **Coletar feedback**: Pedir feedback de usuários admin

## Documentação de Referência

- `BUNNY_ENV_SETUP.md` - Configuração de variáveis
- `BUNNY_WEBHOOK_CONFIG.md` - Configuração de webhook
- `BUNNY_TESTING_GUIDE.md` - Guia de testes
- [Convex Production](https://docs.convex.dev/production)
- [Bunny Stream API](https://docs.bunny.net/reference/video)

## Contatos de Suporte

Em caso de problemas críticos:

- **Convex**: https://discord.gg/convex
- **Bunny.net**: support@bunny.net
- **Equipe interna**: [Adicionar contatos]

---

✅ **Parabéns!** A integração Bunny.net está completa e em produção! 🎉
