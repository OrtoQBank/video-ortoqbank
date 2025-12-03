import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

/**
 * ROTA DE TESTE - SEM AUTENTICAÇÃO
 * 
 * ⚠️ USAR APENAS EM DESENVOLVIMENTO!
 * ⚠️ NÃO FAZER DEPLOY EM PRODUÇÃO!
 * 
 * Esta rota permite testar a criação de vídeos sem autenticação.
 * Use apenas para debug local.
 */
export async function POST(req: Request) {
  // Verificar se está em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { title, description, isPrivate = true } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const BUNNY_KEY = process.env.BUNNY_API_KEY;
    const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

    if (!BUNNY_KEY || !LIBRARY_ID) {
      console.error('Missing Bunny environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const createUrl = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;

    const payload = {
      title,
      ...(description && { description }),
    };

    console.log('Creating video in Bunny:', payload);

    // Create video object in Bunny
    const bunnyResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessKey': BUNNY_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!bunnyResponse.ok) {
      const errorText = await bunnyResponse.text();
      console.error('Bunny create failed:', {
        status: bunnyResponse.status,
        statusText: bunnyResponse.statusText,
        error: errorText,
        url: createUrl,
        payload,
      });
      return NextResponse.json(
        { 
          error: 'Failed to create video in Bunny', 
          detail: errorText,
          status: bunnyResponse.status,
          statusText: bunnyResponse.statusText,
        },
        { status: bunnyResponse.status }
      );
    }

    const bunnyData = await bunnyResponse.json();
    console.log('Bunny video created:', bunnyData);

    // Save to Convex (optional, usando usuário de teste)
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const convex = new ConvexHttpClient(convexUrl);
      
      try {
        await convex.mutation(api.videos.create, {
          videoId: bunnyData.guid,
          libraryId: LIBRARY_ID,
          title,
          description: description || '',
          createdBy: 'test-user', // ← Usuário de teste
          isPrivate,
          status: 'uploading',
        });
        console.log('Video saved to Convex');
      } catch (convexError) {
        console.error('Failed to save video to Convex:', convexError);
        // Continue mesmo se falhar
      }
    }

    return NextResponse.json({
      success: true,
      videoId: bunnyData.guid,
      libraryId: LIBRARY_ID,
      data: bunnyData,
      note: 'Created via TEST endpoint (no authentication)',
    });
  } catch (error) {
    console.error('Error in test-create-video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

