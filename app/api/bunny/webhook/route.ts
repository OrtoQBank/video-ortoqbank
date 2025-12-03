import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { createBunnyUrlBuilder } from '@/lib/bunny-urls';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Bunny webhook received:', body);

    // Verificar assinatura do webhook (se configurado)
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

    // Bunny webhook structure varies, but typically includes:
    // - VideoGuid (or guid): the video ID
    // - Status: the current status (0-5)
    // - ThumbnailFileName: thumbnail URL
    // - AvailableResolutions: resolutions available

    const videoId = body.VideoGuid || body.guid || body.videoId;
    
    if (!videoId) {
      console.error('No videoId in webhook payload:', body);
      return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error('Missing NEXT_PUBLIC_CONVEX_URL environment variable');
      // Return 200 OK to prevent Bunny from retrying
      return NextResponse.json({ ok: true, error: 'Server configuration error' });
    }
    const convex = new ConvexHttpClient(convexUrl);

    const libraryId = process.env.BUNNY_LIBRARY_ID!;
    const urlBuilder = createBunnyUrlBuilder(libraryId);

    // Determine status - CORRIGIDO
    // Status do Bunny: 0=queued, 1=processing, 2=encoding, 3=finished, 4=resolution finished (ready), 5=failed
    let status: 'uploading' | 'processing' | 'ready' | 'failed' = 'processing';
    
    const statusCode = body.Status ?? body.status;
    if (statusCode === 4 || body.status === 'ready') {
      status = 'ready';
    } else if (statusCode === 5 || body.status === 'failed') {
      status = 'failed';
    } else if (statusCode >= 1 && statusCode <= 3) {
      status = 'processing';
    } else if (statusCode === 0) {
      status = 'uploading';
    }

    // Build URLs usando o builder - CORRETO
    const thumbnailUrl = (body.ThumbnailFileName || body.thumbnailFileName)
      ? urlBuilder.getThumbnailUrl(videoId, body.ThumbnailFileName || body.thumbnailFileName)
      : undefined;

    const hlsUrl = status === 'ready' 
      ? urlBuilder.getHlsUrl(videoId)
      : undefined;

    const mp4Urls = (body.AvailableResolutions || body.availableResolutions)
      ? urlBuilder.getMp4Urls(videoId, body.AvailableResolutions || body.availableResolutions)
      : undefined;

    // Update video in Convex using public mutation
    try {
      await convex.mutation(api.videos.update, {
        videoId,
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(hlsUrl && { hlsUrl }),
        ...(mp4Urls && { mp4Urls }),
        status,
        metadata: body,
      });

      console.log(`Video ${videoId} updated successfully (status: ${status})`);
    } catch (error) {
      console.error('Failed to update video in Convex:', error);
      // Don't fail the webhook, Bunny expects 200 OK
    }

    return NextResponse.json({ ok: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error in webhook:', error);
    // Return 200 OK even on error to prevent Bunny from retrying
    return NextResponse.json({
      ok: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

