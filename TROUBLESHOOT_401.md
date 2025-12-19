# 🚨 TROUBLESHOOTING: Erro 401 no Player do Bunny.net

## ❌ Erro Atual

```
Failed to load resource: the server responded with a status of 401 ()
https://player.mediadelivery.net/embed/566190/...
```

## 🔍 O que significa?

O Bunny.net está **rejeitando o token** de autenticação. Isso pode acontecer por 3 motivos:

### 1. Token Authentication não está habilitada no Bunny Dashboard ⚠️

**ESTE É O PROBLEMA MAIS COMUM!**

#### Como verificar e corrigir:

1. Acesse: https://dash.bunny.net/stream/566190
2. Vá em **Library Settings** → **Security**
3. Procure por **"Token Authentication"**
4. **HABILITE** a opção "Token Authentication"
5. Verifique se o **"Token Authentication Key"** é: `e59749f2-86ca-4aaf-bc56-7b403edaa5dd`

#### Se o Token Authentication Key estiver diferente:

Você tem 2 opções:

**Opção A: Atualizar o Convex com o key correto**
```bash
# Copie o Token Authentication Key do Bunny Dashboard
# Depois execute:
npx convex env set BUNNY_EMBED_SECRET "SEU_TOKEN_KEY_DO_BUNNY"
```

**Opção B: Atualizar o Bunny com o key do Convex**
1. No Bunny Dashboard → Library Settings → Security
2. Cole: `e59749f2-86ca-4aaf-bc56-7b403edaa5dd` no campo "Token Authentication Key"
3. Salve

---

### 2. Vídeo não está pronto (ainda processando)

#### Como verificar:

1. Acesse: https://dash.bunny.net/stream/566190
2. Procure pelo vídeo: `6e562abd-086a-45b2-bdaa-820ebce7289a`
3. Verifique o **Status**:
   - ✅ **Ready** = OK
   - ⏳ **Processing** = Aguarde alguns minutos
   - ❌ **Failed** = Erro no processamento

Se estiver **Processing**, aguarde e tente novamente em alguns minutos.

---

### 3. Token expirado (menos provável)

O token expira em 1 hora. Se você deixou a página aberta por muito tempo, recarregue a página (F5).

---

## 🧪 TESTE MANUAL (Para confirmar o problema)

### Passo 1: Teste sem token

Abra esta URL no browser:
```
https://player.mediadelivery.net/embed/566190/6e562abd-086a-45b2-bdaa-820ebce7289a
```

**Resultado esperado:**
- Se der **erro/bloqueio** = Token Authentication está habilitada ✅ (isso é bom!)
- Se **funcionar** = Token Authentication NÃO está habilitada ❌ (precisa habilitar!)

### Passo 2: Teste com token válido

Gere um token fresco:
```bash
node generate-token.js "6e562abd-086a-45b2-bdaa-820ebce7289a" "566190" "e59749f2-86ca-4aaf-bc56-7b403edaa5dd"
```

Copie a "Full Embed URL" e abra no browser.

**Resultado esperado:**
- ✅ **Funciona** = Problema está no código do app (me avise!)
- ❌ **401 ainda** = O BUNNY_EMBED_SECRET está errado (veja item 1 acima)

---

## ✅ SOLUÇÃO RÁPIDA (90% dos casos)

1. Vá em: https://dash.bunny.net/stream/566190
2. Library Settings → Security
3. **HABILITE** "Token Authentication"
4. Certifique que o Key é: `e59749f2-86ca-4aaf-bc56-7b403edaa5dd`
5. Salve
6. Recarregue a página do app (F5)
7. ✅ Deve funcionar!

---

## 📸 Screenshots Necessários

Se ainda não funcionar, me envie screenshots de:

1. **Bunny Dashboard** → Stream → Library Settings → Security
   - Mostre se "Token Authentication" está habilitada
   - Mostre o "Token Authentication Key" (pode tampar parte se quiser)

2. **Console do Browser** (F12)
   - Mostre os logs completos
   - Especialmente o "Token recebido com sucesso"

3. **Bunny Dashboard** → Videos
   - Mostre o status do vídeo

---

## 🎯 Resumo de Verificação

- [ ] Token Authentication está **habilitada** no Bunny?
- [ ] Token Authentication Key está **correto** (igual ao BUNNY_EMBED_SECRET)?
- [ ] Vídeo está com status **Ready** no Bunny?
- [ ] Servidor Next.js foi **reiniciado** após configurar variáveis?
- [ ] Teste manual com URL gerada funciona?

---

## 📞 Precisa de Ajuda?

Me envie:
1. Screenshot do Bunny Dashboard → Security
2. Resultado do teste manual (Passo 1 e 2)
3. Console logs completos

Vou te ajudar a resolver! 🚀
