'use client';

import { useEffect, useState } from 'react';

interface PlayerIframeProps {
  videoId: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function PlayerIframe({
  videoId,
  className = '',
  width = '100%',
  height = 560,
}: PlayerIframeProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/bunny/play-token?videoId=${encodeURIComponent(videoId)}`)
      .then((r) => {
        if (!r.ok) {
          return r.json().then((data) => {
            throw new Error(data.error || 'Failed to load video');
          });
        }
        return r.json();
      })
      .then((data) => {
        if (data.embedUrl) {
          setEmbedUrl(data.embedUrl);
        } else {
          throw new Error('No embed URL received');
        }
      })
      .catch((err) => {
        console.error('Error loading video:', err);
        setError(err.message || 'Não foi possível carregar o vídeo');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [videoId]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-black/10 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-destructive/10 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-destructive font-medium mb-2">Erro ao carregar vídeo</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-black/10 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      loading="lazy"
      style={{ width, height, border: 0, borderRadius: 8 }}
      className={className}
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}

