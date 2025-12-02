import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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

    if (!BUNNY_KEY) {
      console.error('Missing BUNNY_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get the file from the request body
    const fileBuffer = await req.arrayBuffer();

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Bunny
    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const bunnyResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_KEY,
      },
      body: fileBuffer,
    });

    if (!bunnyResponse.ok) {
      const errorText = await bunnyResponse.text();
      console.error('Bunny upload failed:', {
        status: bunnyResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        {
          error: 'Failed to upload to Bunny',
          detail: errorText,
          status: bunnyResponse.status,
        },
        { status: bunnyResponse.status }
      );
    }

    const result = await bunnyResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Upload completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in upload:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

