# Análise da Integração Bunny.net Stream

## ✅ O QUE ESTÁ CORRETO

### 1. Fluxo de Upload
Sua implementação segue o fluxo correto:
```
1. Criar objeto de vídeo no Bunny (POST /library/{libraryId}/videos)
2. Fazer upload do arquivo (PUT /library/{libraryId}/videos/{videoId})
3. Bunny processa o vídeo
4. Webhook notifica quando pronto
```

### 2. Estrutura da API
- Você está usando os endpoints corretos
- Headers de autenticação (`AccessKey`) estão corretos
- Formato JSON está adequado

### 3. Schema Convex
- Schema bem desenhado com indexes apropriados
- Tabela `videos` separada para rastrear vídeos do Bunny
- Relação correta entre `lessons` e `videos` via `videoId`

### 4. Token de Autenticação
- Implementação do token SHA256 está correta
- Expiração de 10 minutos é adequada

---

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

### 1. **CRÍTICO: Segurança do Webhook**

**Problema**: Seu webhook não valida se a requisição vem realmente do Bunny.

**Solução**: Adicionar verificação de assinatura do webhook:

```typescript
// app/api/bunny/webhook/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ADICIONAR: Verificar assinatura do webhook
    const signature = req.headers.get('x-bunny-signature');
    const webhookSecret = process.env.BUNNY_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // ... resto do código
  } catch (error) {
    // ... tratamento de erro
  }
}
```

### 2. **IMPORTANTE: Configuração da Video Library**

**Problema**: Não há evidência de que a Video Library foi configurada corretamente no painel do Bunny.

**Checklist de configuração necessária**:

#### No Painel Bunny.net:
1. ✅ **Video Library criada**
2. ⚠️ **Token Authentication habilitado**
   - Stream → Library → Security → Enable Token Authentication
3. ⚠️ **Webhook configurado**
   - Stream → Library → Webhooks → Add Webhook
   - URL: `https://seu-dominio.com/api/bunny/webhook`
   - Events: Video Upload Finished, Video Encoding Finished
4. ⚠️ **Allowed Referrers (opcional mas recomendado)**
   - Stream → Library → Security → Allowed Referrers
   - Adicionar seu domínio: `seu-dominio.com`
5. ⚠️ **Security Key gerado**
   - Stream → Library → Security → Security Key (este é o `BUNNY_EMBED_SECRET`)

### 3. **URLs de Vídeo Incorretas**

**Problema**: Você está construindo URLs manualmente em vários lugares. Isso pode causar inconsistências.

**Onde o problema ocorre**:

```typescript:86:87:app/api/bunny/play-token/route.ts
const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
const hlsUrl = `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;
```

```typescript:55:58:app/api/bunny/webhook/route.ts
if (body.Status === 4 || body.status === 'ready') {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  hlsUrl = `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`;
}
```

**Solução**: O Bunny retorna as URLs corretas na resposta da API. Use-as:

```typescript
// Quando criar o vídeo, a resposta do Bunny já contém as URLs base:
const bunnyResponse = await fetch(createUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'AccessKey': BUNNY_KEY,
  },
  body: JSON.stringify(payload),
});

const bunnyData = await bunnyResponse.json();

// bunnyData contém:
// - guid: o videoId
// - thumbnailFileName: nome do arquivo de thumbnail
// - availableResolutions: resoluções disponíveis após processamento

// A URL correta para HLS deve ser obtida da API do Bunny
// GET https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
```

### 4. **Falta Deletar Vídeos do Bunny**

**Problema**: Quando você deleta uma lesson ou video do Convex, o vídeo continua no Bunny (consumindo storage/bandwidth).

**Solução**: Criar função para deletar do Bunny também:

```typescript
// app/api/bunny/delete-video/route.ts
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');
    const libraryId = url.searchParams.get('libraryId');
    
    if (!videoId || !libraryId) {
      return NextResponse.json(
        { error: 'videoId and libraryId are required' },
        { status: 400 }
      );
    }
    
    const BUNNY_KEY = process.env.BUNNY_API_KEY;
    
    const deleteUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    
    const bunnyResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_KEY,
      },
    });
    
    if (!bunnyResponse.ok) {
      throw new Error('Failed to delete video from Bunny');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
```

E atualizar a mutation de remoção:

```typescript
// convex/videos.ts - atualizar a função remove
export const remove = mutation({
  args: { videoId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .withIndex("by_videoId", (q) => q.eq("videoId", args.videoId))
      .unique();

    if (!video) {
      throw new Error("Vídeo não encontrado");
    }

    // ADICIONAR: Deletar do Bunny primeiro
    try {
      const response = await fetch(
        `/api/bunny/delete-video?videoId=${video.videoId}&libraryId=${video.libraryId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        console.error('Failed to delete from Bunny, but continuing...');
      }
    } catch (error) {
      console.error('Error deleting from Bunny:', error);
      // Continuar mesmo se falhar, para não deixar registro órfão
    }

    await ctx.db.delete(video._id);
    return null;
  },
});
```

### 5. **Melhoria: Buscar Informações do Vídeo do Bunny**

**Problema**: Você não está buscando informações atualizadas do vídeo (thumbnail, resoluções disponíveis, duração real).

**Solução**: Criar rota para buscar informações:

```typescript
// app/api/bunny/get-video-info/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');
    const libraryId = url.searchParams.get('libraryId');
    
    if (!videoId || !libraryId) {
      return NextResponse.json(
        { error: 'videoId and libraryId are required' },
        { status: 400 }
      );
    }
    
    const BUNNY_KEY = process.env.BUNNY_API_KEY;
    
    const infoUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    
    const bunnyResponse = await fetch(infoUrl, {
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_KEY,
      },
    });
    
    if (!bunnyResponse.ok) {
      throw new Error('Failed to get video info from Bunny');
    }
    
    const videoInfo = await bunnyResponse.json();
    
    // videoInfo contém:
    // - guid: videoId
    // - title: título
    // - length: duração em segundos
    // - status: status do vídeo (0=queued, 1=processing, 2=encoding, 3=finished, 4=resolution finished, 5=failed)
    // - thumbnailFileName: nome do arquivo thumbnail
    // - availableResolutions: string com resoluções (ex: "240p,360p,480p,720p,1080p")
    // - width, height: dimensões
    
    return NextResponse.json({
      success: true,
      videoInfo,
      // URLs processadas
      thumbnailUrl: videoInfo.thumbnailFileName 
        ? `https://vz-${libraryId}.b-cdn.net/${videoId}/${videoInfo.thumbnailFileName}`
        : null,
      hlsUrl: `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`,
    });
  } catch (error) {
    console.error('Error getting video info:', error);
    return NextResponse.json(
      { error: 'Failed to get video info' },
      { status: 500 }
    );
  }
}
```

Usar essa rota após o upload para obter informações reais:

```typescript
// Em lesson-form-v2.tsx, após upload completar:
xhr.addEventListener('load', async () => {
  if (xhr.status >= 200 && xhr.status < 300) {
    // Buscar informações do vídeo
    const infoResponse = await fetch(
      `/api/bunny/get-video-info?videoId=${createData.videoId}&libraryId=${createData.libraryId}`
    );
    
    if (infoResponse.ok) {
      const videoData = await infoResponse.json();
      
      // Atualizar estado com informações reais
      setThumbnailUrl(videoData.thumbnailUrl);
      setPublicUrl(videoData.hlsUrl);
      setDurationSeconds(videoData.videoInfo.length.toString());
    }
    
    toast({
      title: 'Sucesso',
      description: 'Vídeo enviado! O Bunny está processando.',
    });
    // ...
  }
});
```

### 6. **Status do Vídeo no Webhook**

**Problema**: A lógica de mapeamento de status pode estar incorreta.

**Status corretos do Bunny**:
- `0` = Queued (na fila)
- `1` = Processing (processando)
- `2` = Encoding (codificando)
- `3` = Finished (finalizado)
- `4` = Resolution Finished (todas resoluções prontas)
- `5` = Failed (falhou)

**Corrigir no webhook**:

```typescript:32:42:app/api/bunny/webhook/route.ts
// Determine status
let status: 'uploading' | 'processing' | 'ready' | 'failed' = 'processing';

// Status corretos do Bunny: 0=queued, 1=processing, 2=encoding, 3=finished, 4=ready, 5=failed
if (body.Status === 4 || body.status === 'ready') {
  status = 'ready';
} else if (body.Status === 5 || body.status === 'failed') {
  status = 'failed';
} else if (body.Status >= 1 && body.Status <= 3) {
  status = 'processing';
} else if (body.Status === 0) {
  status = 'uploading';
}
```

### 7. **Variáveis de Ambiente Faltando**

**Adicionar ao `.env.local`**:

```bash
# Bunny.net Configuration
BUNNY_API_KEY=your-account-api-key-here
BUNNY_LIBRARY_ID=your-library-id-here
BUNNY_EMBED_SECRET=your-security-key-here
BUNNY_WEBHOOK_SECRET=your-webhook-secret-here

# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```

**Como obter cada chave**:

1. **BUNNY_API_KEY**: 
   - Bunny Dashboard → Account → API
   - Use a API Key da conta (não a da library)

2. **BUNNY_LIBRARY_ID**: 
   - Stream → Video Library → Copy Library ID

3. **BUNNY_EMBED_SECRET**: 
   - Stream → Video Library → Security → Security Key
   - Se não existe, clique em "Generate" e copie

4. **BUNNY_WEBHOOK_SECRET**: 
   - Crie um segredo aleatório forte: `openssl rand -hex 32`
   - Configure no Bunny: Stream → Video Library → Webhooks
   - Adicione como "Webhook Secret"

### 8. **Melhorar Tratamento de Erros no Upload**

**Problema**: Sem retry ou tratamento robusto de falhas.

**Solução**: Adicionar retry logic:

```typescript
// Função auxiliar para retry
async function uploadWithRetry(
  url: string,
  file: File,
  maxRetries: number = 3,
  onProgress?: (progress: number) => void
): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
      
      // Upload bem-sucedido
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Esperar antes de tentar novamente (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Upload failed after all retries');
}
```

### 9. **Adicionar Fetch de Vídeo por URL**

O Bunny permite fazer upload de vídeos a partir de uma URL (útil para migração ou import):

```typescript
// app/api/bunny/fetch-video/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { videoId, libraryId, videoUrl, headers } = await req.json();
    
    if (!videoId || !libraryId || !videoUrl) {
      return NextResponse.json(
        { error: 'videoId, libraryId and videoUrl are required' },
        { status: 400 }
      );
    }
    
    const BUNNY_KEY = process.env.BUNNY_API_KEY;
    
    const fetchUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/fetch`;
    
    const bunnyResponse = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessKey': BUNNY_KEY,
      },
      body: JSON.stringify({
        videoId,
        url: videoUrl,
        headers: headers || {}, // Headers customizados se necessário
      }),
    });
    
    if (!bunnyResponse.ok) {
      const error = await bunnyResponse.text();
      throw new Error(error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Video fetch started. Bunny will process it.',
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
```

### 10. **Collections (Opcional mas Útil)**

O Bunny Stream suporta "Collections" para organizar vídeos. Considere usar se tiver muitos vídeos:

```typescript
// Criar collection por módulo
export async function POST(req: Request) {
  const { name, libraryId } = await req.json();
  
  const response = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/collections`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessKey': process.env.BUNNY_API_KEY!,
      },
      body: JSON.stringify({ name }),
    }
  );
  
  const collection = await response.json();
  
  // Ao criar vídeo, adicione: collectionId: collection.guid
  
  return NextResponse.json({ collectionId: collection.guid });
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Prioridade ALTA (Fazer agora):
- [ ] 1. Configurar Video Library no painel Bunny
  - [ ] Habilitar Token Authentication
  - [ ] Adicionar Webhook URL
  - [ ] Copiar Security Key
- [ ] 2. Adicionar todas as variáveis de ambiente necessárias
- [ ] 3. Adicionar validação de assinatura no webhook
- [ ] 4. Corrigir mapeamento de status do vídeo
- [ ] 5. Buscar informações reais do vídeo após upload

### Prioridade MÉDIA (Fazer em breve):
- [ ] 6. Implementar deleção de vídeos do Bunny
- [ ] 7. Adicionar retry logic no upload
- [ ] 8. Usar URLs do Bunny em vez de construir manualmente

### Prioridade BAIXA (Nice to have):
- [ ] 9. Implementar fetch de vídeo por URL
- [ ] 10. Adicionar suporte a Collections
- [ ] 11. Implementar busca de estatísticas de vídeo
- [ ] 12. Adicionar suporte a múltiplas resoluções/qualidades

---

## 🧪 TESTANDO A INTEGRAÇÃO

### 1. Testar Criação de Vídeo:
```bash
curl -X POST http://localhost:3000/api/bunny/create-video \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Video", "description": "Test", "isPrivate": true}'
```

### 2. Verificar no Bunny Dashboard:
- Vá para Stream → Video Library → Videos
- Verifique se o vídeo aparece

### 3. Testar Webhook Localmente:
Use ngrok ou similar para expor sua porta local:
```bash
ngrok http 3000
```
Configure a URL do webhook no Bunny: `https://your-ngrok-url.ngrok.io/api/bunny/webhook`

### 4. Verificar Token de Playback:
```bash
curl http://localhost:3000/api/bunny/play-token?videoId=YOUR_VIDEO_ID
```

---

## 📚 RECURSOS ÚTEIS

- [Bunny Stream API Reference](https://docs.bunny.net/reference/video_getvideocollection)
- [Token Authentication Guide](https://docs.bunny.net/docs/stream-security)
- [Webhook Events](https://docs.bunny.net/docs/stream-webhooks)
- [Video Upload Methods](https://docs.bunny.net/docs/stream-uploading-videos-through-our-http-api)

---

## ❓ DÚVIDAS COMUNS

### Q: Por que meu vídeo não aparece após o upload?
**R**: O vídeo precisa ser processado. Isso pode levar de alguns segundos a vários minutos dependendo do tamanho. Verifique o status no dashboard do Bunny.

### Q: Erro "Token invalid" ao reproduzir vídeo?
**R**: 
1. Verifique se Token Authentication está habilitado na library
2. Confirme que `BUNNY_EMBED_SECRET` está correto
3. Verifique se o token não expirou (10 minutos)

### Q: Webhook não está sendo chamado?
**R**:
1. Verifique se a URL está correta no painel Bunny
2. Certifique-se que a URL é acessível publicamente (não localhost)
3. Verifique os logs no Bunny: Stream → Library → Webhooks → View Logs

### Q: Como saber se o vídeo está pronto?
**R**: Monitore o campo `status` no Convex. Quando for "ready", está disponível para reprodução.

---

## 🎯 RESULTADO ESPERADO

Após implementar todas as correções de ALTA prioridade:

1. ✅ Vídeos serão criados no Bunny
2. ✅ Upload funcionará corretamente
3. ✅ Bunny processará e notificará via webhook
4. ✅ Vídeos estarão protegidos com token
5. ✅ Informações corretas aparecerão no Convex
6. ✅ Player poderá reproduzir os vídeos com segurança

---

**Data desta análise**: Dezembro 2024
**Versão do Bunny Stream API**: v2

