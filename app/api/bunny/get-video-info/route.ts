import { NextResponse } from 'next/server';
import { createBunnyUrlBuilder, BunnyVideoInfo } from '@/lib/bunny-urls';

/**
 * GET /api/bunny/get-video-info?videoId={videoId}&libraryId={libraryId}
 * 
 * Busca informações detalhadas de um vídeo no Bunny Stream
 * Retorna: videoInfo (do Bunny) + URLs construídas corretamente
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');
    const libraryId = url.searchParams.get('libraryId') || process.env.BUNNY_LIBRARY_ID;
    
    if (!videoId || !libraryId) {
      return NextResponse.json(
        { error: 'videoId and libraryId are required' },
        { status: 400 }
      );
    }
    
    const BUNNY_KEY = process.env.BUNNY_API_KEY;
    
    if (!BUNNY_KEY) {
      return NextResponse.json(
        { error: 'BUNNY_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const infoUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
    
    console.log('Fetching video info from Bunny:', infoUrl);
    
    const bunnyResponse = await fetch(infoUrl, {
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_KEY,
      },
    });
    
    if (!bunnyResponse.ok) {
      const errorText = await bunnyResponse.text();
      console.error('Bunny API error:', {
        status: bunnyResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { 
          error: 'Failed to get video info from Bunny', 
          detail: errorText,
          status: bunnyResponse.status,
        },
        { status: bunnyResponse.status }
      );
    }
    
    const videoInfo: BunnyVideoInfo = await bunnyResponse.json();
    
    console.log('Video info retrieved:', {
      videoId: videoInfo.guid,
      status: videoInfo.status,
      length: videoInfo.length,
      resolutions: videoInfo.availableResolutions,
    });
    
    // Construir URLs usando o builder
    const urlBuilder = createBunnyUrlBuilder(libraryId);
    
    return NextResponse.json({
      success: true,
      videoInfo,
      urls: {
        thumbnail: urlBuilder.getThumbnailUrl(videoId, videoInfo.thumbnailFileName),
        hls: urlBuilder.getHlsUrl(videoId),
        embed: urlBuilder.getEmbedUrl(videoId),
        mp4: urlBuilder.getMp4Urls(videoId, videoInfo.availableResolutions),
        preview: urlBuilder.getPreviewUrl(videoId),
      },
      // Info processada útil
      processed: {
        durationSeconds: videoInfo.length,
        isReady: videoInfo.status === 4,
        statusText: getStatusText(videoInfo.status),
        resolutions: videoInfo.availableResolutions?.split(',') || [],
      },
    });
  } catch (error) {
    console.error('Error getting video info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get video info', 
        detail: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 0: return 'queued';
    case 1: return 'processing';
    case 2: return 'encoding';
    case 3: return 'finished';
    case 4: return 'ready';
    case 5: return 'failed';
    default: return 'unknown';
  }
}

