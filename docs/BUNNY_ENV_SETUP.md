# Configuração de Variáveis de Ambiente - Bunny.net Integration

Este documento descreve todas as variáveis de ambiente necessárias para a integração com Bunny.net Stream funcionar corretamente.

## Variáveis de Ambiente Convex

Configure estas variáveis no **Convex Dashboard** (Settings → Environment Variables):

### Obrigatórias

```bash
# API Key do Bunny.net para autenticação
BUNNY_API_KEY=<sua-api-key>

# ID da biblioteca de vídeos do Bunny Stream
BUNNY_LIBRARY_ID=566190

# Secret para gerar tokens signed de embed (autenticação do player)
BUNNY_EMBED_SECRET=<seu-embed-secret>
```

### Opcional (Recomendada)

```bash
# Secret para validar assinatura de webhooks do Bunny
# Aumenta segurança validando que webhooks vieram realmente do Bunny
BUNNY_WEBHOOK_SECRET=<secret-gerado-no-bunny-dashboard>
```

## Variáveis de Ambiente Next.js

Configure estas variáveis no arquivo `.env.local` (raiz do projeto):

```bash
# URL do deployment Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ID da biblioteca Bunny (mesmo valor do Convex)
NEXT_PUBLIC_BUNNY_LIBRARY_ID=566190
```

## Como Obter os Valores

### 1. BUNNY_API_KEY

1. Acesse: https://panel.bunny.net/account
2. Vá em **API Keys** no menu lateral
3. Copie sua API Key existente ou crie uma nova
4. Cole no Convex Dashboard

### 2. BUNNY_LIBRARY_ID

1. Acesse: https://dash.bunny.net/stream
2. Clique na sua Video Library
3. O ID aparece na URL: `https://dash.bunny.net/stream/{LIBRARY_ID}`
4. Use o mesmo valor no Convex e Next.js

### 3. BUNNY_EMBED_SECRET

1. Acesse sua Video Library: https://dash.bunny.net/stream/{LIBRARY_ID}
2. Vá em **Security** no menu lateral
3. Ative **Token Authentication**
4. Copie o **Token Authentication Key** gerado
5. Cole no Convex Dashboard

### 4. BUNNY_WEBHOOK_SECRET (Opcional)

1. Acesse sua Video Library: https://dash.bunny.net/stream/{LIBRARY_ID}/settings/webhooks
2. Ao configurar o webhook, ative **Webhook Secret**
3. Um secret será gerado automaticamente
4. Copie e cole no Convex Dashboard
5. **Importante**: Configure isso APÓS adicionar a URL do webhook (Fase 6)

## Verificação

Para verificar se as variáveis estão configuradas corretamente:

### Convex

No terminal do projeto:
```bash
npx convex env list
```

Deve mostrar todas as variáveis configuradas (valores ocultos por segurança).

### Next.js

As variáveis `NEXT_PUBLIC_*` podem ser verificadas no console do browser:
```javascript
console.log(process.env.NEXT_PUBLIC_CONVEX_URL);
console.log(process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID);
```

## Problemas Comuns

### "BUNNY_API_KEY not configured"
- Verifique se a variável está no Convex Dashboard
- Verifique se não há espaços extras
- Faça redeploy do Convex: `npx convex deploy`

### "BUNNY_EMBED_SECRET not configured"
- Token Authentication deve estar ativo na biblioteca
- Copie o key completo sem espaços
- Redeploy do Convex após adicionar

### "Invalid webhook signature"
- Verifique se `BUNNY_WEBHOOK_SECRET` no Convex é igual ao do Bunny Dashboard
- Se não usar webhook secret, pode remover a validação

## Segurança

⚠️ **NUNCA** commite arquivos `.env` ou `.env.local` no Git!

✅ Arquivo `.gitignore` já inclui:
```
.env
.env.local
.env*.local
```

## Deploy em Produção

Ao fazer deploy:

1. **Convex**: Variáveis são compartilhadas entre dev/prod
2. **Vercel/Netlify**: Configure variáveis no dashboard da plataforma
3. **Next.js**: Variáveis `NEXT_PUBLIC_*` precisam estar disponíveis no build time

## Próximos Passos

Após configurar todas as variáveis:
1. ✅ Fase 5 completa
2. ➡️ Fase 6: Configurar webhook no Bunny Dashboard
3. ➡️ Fase 7: Testar fluxo completo
