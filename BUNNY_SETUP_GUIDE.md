# 🐰 Guia de Configuração Bunny.net Stream

## ✅ O QUE FOI IMPLEMENTADO

### Arquivos Criados/Modificados:
- ✅ `lib/bunny-urls.ts` - Builder centralizado de URLs
- ✅ `app/api/bunny/webhook/route.ts` - Atualizado com segurança e URLs corretas
- ✅ `app/api/bunny/play-token/route.ts` - Atualizado para usar URL builder
- ✅ `app/api/bunny/get-video-info/route.ts` - NOVA rota para buscar info do vídeo

### Correções Aplicadas:
1. ✅ **URLs construídas corretamente** usando builder centralizado
2. ✅ **Validação de assinatura no webhook** (quando configurado)
3. ✅ **Status do vídeo mapeado corretamente** (0-5)
4. ✅ **Nova rota para buscar informações do vídeo**

---

## 🔑 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

Adicione no seu `.env.local`:

```bash
# Bunny.net Stream Configuration
# ================================

# 1. API Key da sua conta Bunny
# Onde obter: Dashboard → Account → API → Copy API Key
BUNNY_API_KEY=seu-api-key-aqui

# 2. ID da sua Video Library
# Onde obter: Dashboard → Stream → Video Library → Copy Library ID
BUNNY_LIBRARY_ID=seu-library-id-aqui

# 3. Security Key da Video Library (para tokens de playback)
# Onde obter: Dashboard → Stream → Video Library → Security → Security Key
# Se não existe, clique em "Generate Security Key"
BUNNY_EMBED_SECRET=seu-security-key-aqui

# 4. Webhook Secret (para validar webhooks)
# Como criar: openssl rand -hex 32
# Configure também no Bunny: Stream → Video Library → Webhooks → Add Secret
BUNNY_WEBHOOK_SECRET=seu-webhook-secret-aqui

# Convex (já deve ter)
NEXT_PUBLIC_CONVEX_URL=https://sua-url-convex.convex.cloud
```

---

## 📋 CONFIGURAÇÃO NO PAINEL BUNNY

### Passo 1: Acessar Video Library
1. Vá para [Bunny.net Dashboard](https://dash.bunny.net)
2. Menu lateral → **Stream** → **Video Libraries**
3. Selecione sua library (ou crie uma nova)

### Passo 2: Habilitar Token Authentication
1. Na sua Video Library, vá em **Security**
2. **Enable Token Authentication** → Toggle ON
3. Copie o **Security Key** (ou gere um novo)
4. Cole no `.env.local` como `BUNNY_EMBED_SECRET`

### Passo 3: Configurar Webhook
1. Na sua Video Library, vá em **Webhooks**
2. Clique em **Add Webhook**
3. Configure:
   - **Webhook URL**: `https://seu-dominio.com/api/bunny/webhook`
     - Para desenvolvimento local, use [ngrok](https://ngrok.com): `ngrok http 3000`
   - **Events**: Selecione
     - ✅ Video Upload Finished
     - ✅ Video Encoding Finished
   - **Webhook Secret**: Cole o secret que você gerou
4. Clique em **Save**

### Passo 4: (Opcional) Configurar Allowed Referrers
1. Na sua Video Library, vá em **Security**
2. **Allowed Referrers** → Add Domain
3. Adicione: `seu-dominio.com` (sem https://)
4. Para desenvolvimento: adicione `localhost` também

---

## 🧪 TESTANDO A INTEGRAÇÃO

### 1. Testar Criação de Vídeo

```bash
# Via curl
curl -X POST http://localhost:3000/api/bunny/create-video \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste Video",
    "description": "Video de teste",
    "isPrivate": true
  }'

# Resposta esperada:
# {
#   "success": true,
#   "videoId": "abc123-...",
#   "libraryId": "12345",
#   "hlsUrl": "https://vz-12345.b-cdn.net/abc123-.../playlist.m3u8",
#   ...
# }
```

### 2. Testar Buscar Informações do Vídeo

```bash
curl http://localhost:3000/api/bunny/get-video-info?videoId=SEU_VIDEO_ID

# Resposta esperada:
# {
#   "success": true,
#   "videoInfo": { ... dados do Bunny ... },
#   "urls": {
#     "hls": "https://vz-...",
#     "thumbnail": "https://vz-...",
#     "embed": "https://iframe.mediadelivery.net/...",
#     "mp4": [...]
#   },
#   "processed": {
#     "durationSeconds": 120,
#     "isReady": true,
#     "statusText": "ready",
#     "resolutions": ["240p", "360p", "720p"]
#   }
# }
```

### 3. Testar Token de Playback

```bash
curl "http://localhost:3000/api/bunny/play-token?videoId=SEU_VIDEO_ID"

# Resposta esperada:
# {
#   "success": true,
#   "embedUrl": "https://iframe.mediadelivery.net/embed/.../...?token=...&expires=...",
#   "hlsUrl": "https://vz-.../playlist.m3u8?token=...&expires=...",
#   "token": "sha256-hash",
#   "expires": 1234567890,
#   "expiresAt": "2024-12-03T..."
# }
```

### 4. Verificar Webhook (Local com ngrok)

```bash
# 1. Instalar ngrok: https://ngrok.com/download

# 2. Expor porta 3000
ngrok http 3000

# 3. Copiar URL gerada (ex: https://abc123.ngrok.io)

# 4. Configurar no Bunny Dashboard:
#    Webhook URL: https://abc123.ngrok.io/api/bunny/webhook

# 5. Fazer upload de um vídeo e monitorar logs
```

---

## 🎯 COMO USAR NO CÓDIGO

### Exemplo 1: Criar e Fazer Upload de Vídeo

```typescript
// No seu componente React
const handleUploadVideo = async (file: File, title: string) => {
  // 1. Criar vídeo no Bunny
  const createResponse = await fetch('/api/bunny/create-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description: 'Descrição',
      isPrivate: true,
    }),
  });
  
  const { videoId, libraryId } = await createResponse.json();
  
  // 2. Fazer upload do arquivo
  const uploadUrl = `/api/bunny/upload?videoId=${videoId}&libraryId=${libraryId}`;
  
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  });
  
  // 3. Buscar informações do vídeo (após processamento)
  setTimeout(async () => {
    const infoResponse = await fetch(
      `/api/bunny/get-video-info?videoId=${videoId}`
    );
    const videoInfo = await infoResponse.json();
    
    console.log('Vídeo pronto:', videoInfo);
  }, 30000); // Aguardar 30 segundos
};
```

### Exemplo 2: Obter URL de Playback com Token

```typescript
// No player de vídeo
const [playbackUrl, setPlaybackUrl] = useState('');

useEffect(() => {
  const fetchPlaybackUrl = async () => {
    const response = await fetch(
      `/api/bunny/play-token?videoId=${videoId}`
    );
    const data = await response.json();
    
    setPlaybackUrl(data.hlsUrl); // ou data.embedUrl
  };
  
  fetchPlaybackUrl();
}, [videoId]);

// Usar com HLS.js ou iframe
<video src={playbackUrl} controls />
```

### Exemplo 3: Usar o URL Builder Diretamente

```typescript
import { createBunnyUrlBuilder } from '@/lib/bunny-urls';

// No servidor (API Route)
const urlBuilder = createBunnyUrlBuilder();

const videoId = 'abc123';

// Gerar URLs
const hlsUrl = urlBuilder.getHlsUrl(videoId);
const embedUrl = urlBuilder.getEmbedUrl(videoId);
const thumbnail = urlBuilder.getThumbnailUrl(videoId, 'thumbnail.jpg');
const mp4s = urlBuilder.getMp4Urls(videoId, '240p,360p,720p,1080p');
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Token invalid" ao reproduzir vídeo

**Possíveis causas:**
1. Token Authentication não está habilitado na Library
2. `BUNNY_EMBED_SECRET` incorreto ou não configurado
3. Token expirou (validade de 10 minutos)

**Solução:**
```bash
# Verificar variáveis de ambiente
echo $BUNNY_EMBED_SECRET

# Regenerar token no Bunny Dashboard
# Stream → Video Library → Security → Generate New Security Key

# Atualizar .env.local com novo secret
```

### Problema: Webhook não é chamado

**Possíveis causas:**
1. URL do webhook não está acessível publicamente
2. Webhook não está configurado no Bunny
3. SSL/HTTPS não está configurado

**Solução:**
```bash
# Para desenvolvimento, usar ngrok
ngrok http 3000

# Copiar URL e configurar no Bunny
# Ex: https://abc123.ngrok.io/api/bunny/webhook

# Verificar logs do webhook no Bunny Dashboard
# Stream → Video Library → Webhooks → View Logs
```

### Problema: "Invalid signature" no webhook

**Possíveis causas:**
1. `BUNNY_WEBHOOK_SECRET` não está configurado
2. Secret no Bunny Dashboard é diferente do `.env.local`

**Solução:**
```bash
# Gerar novo secret
openssl rand -hex 32

# Atualizar em ambos lugares:
# 1. .env.local → BUNNY_WEBHOOK_SECRET
# 2. Bunny Dashboard → Webhooks → Edit → Webhook Secret
```

### Problema: Vídeo fica em "processing" indefinidamente

**Possíveis causas:**
1. Vídeo tem formato não suportado
2. Vídeo está corrompido
3. Problema no upload (parcial)

**Solução:**
```bash
# Verificar status no Bunny Dashboard
# Stream → Video Library → Videos → Clique no vídeo

# Ou via API
curl -X GET \
  "https://video.bunnycdn.com/library/$LIBRARY_ID/videos/$VIDEO_ID" \
  -H "AccessKey: $BUNNY_API_KEY"

# Status codes:
# 0 = queued
# 1-3 = processing/encoding
# 4 = ready
# 5 = failed

# Se status = 5, deletar e fazer upload novamente
```

---

## 📚 RECURSOS

- [Documentação Bunny Stream](https://docs.bunny.net/docs/stream-overview)
- [API Reference](https://docs.bunny.net/reference/video_getvideocollection)
- [Token Authentication](https://docs.bunny.net/docs/stream-security)
- [Webhooks Guide](https://docs.bunny.net/docs/stream-webhooks)

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

Use este checklist para garantir que tudo está configurado:

- [ ] Variáveis de ambiente configuradas no `.env.local`
  - [ ] BUNNY_API_KEY
  - [ ] BUNNY_LIBRARY_ID
  - [ ] BUNNY_EMBED_SECRET
  - [ ] BUNNY_WEBHOOK_SECRET
- [ ] Configuração no Bunny Dashboard
  - [ ] Token Authentication habilitado
  - [ ] Security Key copiado
  - [ ] Webhook configurado com URL correta
  - [ ] Webhook Secret configurado
  - [ ] (Opcional) Allowed Referrers adicionados
- [ ] Testes executados
  - [ ] Criar vídeo funciona
  - [ ] Upload funciona
  - [ ] Webhook é recebido
  - [ ] Token de playback funciona
  - [ ] Player reproduz o vídeo

---

**Última atualização**: Dezembro 2024
**Status**: ✅ Implementação completa

