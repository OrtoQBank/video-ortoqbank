# Configuração do Webhook Bunny.net

Este guia explica como configurar o webhook no Bunny.net Dashboard para que o sistema receba notificações quando vídeos são processados.

## Por que configurar o webhook?

O webhook permite que o Bunny.net notifique automaticamente nossa aplicação quando:
- ✅ Um vídeo é uploadado completamente
- ✅ Um vídeo terminou de ser processado/encodificado
- ❌ Um vídeo falhou no processamento

Sem o webhook, os vídeos ficariam com status "uploading" indefinidamente, mesmo após processados.

## Pré-requisitos

Antes de configurar o webhook, você precisa:

1. ✅ **Código deployado**: O endpoint `/bunny-webhook` deve estar no ar
2. ✅ **URL do Convex**: Saber a URL do seu deployment Convex (.convex.site)
3. ✅ (Opcional) **Variáveis configuradas**: `BUNNY_WEBHOOK_SECRET` no Convex

## Como obter a URL do Webhook

### Desenvolvimento Local (com ngrok ou similar)

Para testar localmente, você precisa expor seu Convex local:

```bash
# Terminal 1: Rodar Convex
npx convex dev

# Terminal 2: Expor com ngrok
ngrok http https://your-dev-url.convex.site

# Usar URL do ngrok como webhook URL
```

### Produção

1. Acesse Convex Dashboard: https://dashboard.convex.dev
2. Selecione seu projeto
3. Vá em **Settings** → **Deployment**
4. Copie a **Deployment URL** (termina em `.convex.cloud`)
5. Substitua `.convex.cloud` por `.convex.site`

**Exemplo:**
- Deployment URL: `https://happy-animal-123.convex.cloud`
- Webhook URL: `https://happy-animal-123.convex.site/bunny-webhook`

## Passo a Passo de Configuração

### 1. Acessar o Bunny Dashboard

1. Acesse: https://dash.bunny.net/stream
2. Clique na sua **Video Library** (ex: "OrtoQBank Videos")
3. No menu lateral, clique em **Settings** → **Webhooks**

### 2. Adicionar Novo Webhook

1. Clique no botão **"Add Webhook"**
2. Preencha o formulário:

```
Webhook URL: https://{seu-deployment}.convex.site/bunny-webhook
```

3. Marque os seguintes eventos:
   - ✅ **Video Uploaded** - Quando upload é concluído
   - ✅ **Video Encoded** - Quando processamento termina (vídeo pronto)
   - ✅ **Video Processing Failed** - Quando processamento falha

4. (Opcional mas recomendado) Ative **Webhook Secret**:
   - Toggle "Enable Webhook Secret" para ON
   - Um secret será gerado automaticamente
   - **COPIE** este secret (você precisará adicionar ao Convex)

5. Clique em **Save Webhook**

### 3. Configurar Webhook Secret no Convex

Se você ativou o Webhook Secret no passo anterior:

1. Copie o secret gerado pelo Bunny
2. Acesse Convex Dashboard
3. Vá em **Settings** → **Environment Variables**
4. Adicione nova variável:
   ```
   Name: BUNNY_WEBHOOK_SECRET
   Value: <secret-copiado-do-bunny>
   ```
5. Salve a variável
6. **Importante**: Faça redeploy do Convex
   ```bash
   npx convex deploy --prod
   ```

## Verificação

Para verificar se o webhook está funcionando:

### 1. Testar Webhook Manualmente

No Bunny Dashboard, na página de webhooks:

1. Clique em **"Test Webhook"** ao lado do webhook configurado
2. Selecione evento: **Video Encoded**
3. Clique em **Send Test**
4. Status deve retornar **200 OK**

### 2. Upload Real

1. Faça upload de um vídeo de teste via admin panel
2. Aguarde alguns segundos/minutos
3. Verifique no Convex Dashboard → Data → `videos` table
4. O status do vídeo deve mudar de `uploading` → `processing` → `ready`

### 3. Logs do Convex

Para debug, verifique os logs:

```bash
npx convex logs --watch
```

Você deve ver mensagens como:
```
Bunny webhook received: { VideoGuid: "...", Status: 4, VideoLibraryId: "..." }
```

## Troubleshooting

### Webhook retorna 401 Unauthorized

**Causa**: Assinatura do webhook inválida

**Solução**:
1. Verifique se `BUNNY_WEBHOOK_SECRET` no Convex é igual ao do Bunny Dashboard
2. Copie o secret novamente (sem espaços extras)
3. Redeploy do Convex: `npx convex deploy --prod`

### Webhook retorna 404 Not Found

**Causa**: URL do webhook está incorreta

**Solução**:
1. Verifique se usou `.convex.site` (não `.convex.cloud`)
2. Confirme que `/bunny-webhook` está no final da URL
3. Teste acessar a URL no browser (deve retornar erro mas não 404)

### Webhook retorna 500 Internal Server Error

**Causa**: Erro no código do handler

**Solução**:
1. Verifique logs do Convex: `npx convex logs`
2. Procure por erros na função `processBunnyWebhook`
3. Verifique se todas as env vars estão configuradas:
   - `BUNNY_API_KEY`
   - `BUNNY_LIBRARY_ID`

### Vídeos não atualizam status

**Possíveis causas**:

1. **Webhook não configurado**: Configure conforme este guia
2. **Webhook desabilitado**: Verifique no Bunny Dashboard se está ativo
3. **Eventos não marcados**: Certifique-se que "Video Encoded" está marcado
4. **Vídeo não existe no DB**: Verifique se foi salvo na criação (Fase 1)

**Debug**:
```bash
# Ver logs em tempo real
npx convex logs --watch

# Fazer upload e acompanhar
```

### Webhook funciona mas dados não salvam

**Causa**: Mutation `updateFromWebhook` não é interna

**Solução**: Verifique em `convex/videos.ts` que a mutation está registrada como `internalMutation`.

## Eventos do Bunny

Referência dos códigos de status:

| Status Code | Significado | Mapeamento Nosso |
|-------------|-------------|------------------|
| 0 | Queued | processing |
| 1 | Processing | processing |
| 2 | Encoding | processing |
| 3 | Finished (processing) | processing |
| 4 | Resolution Finished (ready) | **ready** ✅ |
| 5 | Failed | **failed** ❌ |

## Segurança

### Validação de Assinatura

O código valida a assinatura automaticamente se `BUNNY_WEBHOOK_SECRET` estiver configurado:

```typescript
// convex/bunny-webhookHandler.ts
const expectedSignature = await sha256(
  webhookSecret + JSON.stringify(body)
);
if (signature !== expectedSignature) {
  throw new Error("Invalid webhook signature");
}
```

### Recomendações

1. ✅ **SEMPRE use HTTPS**: Convex já usa HTTPS por padrão
2. ✅ **Configure webhook secret**: Previne webhooks falsos
3. ✅ **Monitore logs**: Fique atento a tentativas de webhook com assinatura inválida
4. ⚠️ **Não exponha endpoint em desenvolvimento**: Use ngrok ou similar apenas para testes

## Webhook em Múltiplos Ambientes

### Desenvolvimento

- Use ngrok ou Convex dev URL
- Pode desabilitar validação de signature para facilitar debug

### Staging

- Configure webhook apontando para deployment de staging
- Use webhook secret diferente do produção

### Produção

- Configure webhook com URL de produção
- **SEMPRE** use webhook secret
- Monitore falhas de webhook

## Próximos Passos

Após configurar o webhook:

1. ✅ Fase 6 completa
2. ➡️ Fase 7: Testar fluxo completo (upload → webhook → player)
3. ➡️ Fase 8: Implementar melhorias opcionais

## Referências

- [Bunny Stream Webhooks Documentation](https://docs.bunny.net/docs/stream-webhooks)
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)
