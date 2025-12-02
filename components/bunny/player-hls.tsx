'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Id } from '@/convex/_generated/dataModel';

interface PlayerHlsProps {
  videoId: string;
  lessonId: Id<'lessons'>;
  className?: string;
  autoSaveInterval?: number; // seconds between auto-saves (default 15)
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

export default function PlayerHls({
  videoId,
  lessonId,
  className = '',
  autoSaveInterval = 15,
  onProgress,
  onComplete,
}: PlayerHlsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch HLS URL with token
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
        if (data.hlsUrl) {
          setHlsUrl(data.hlsUrl);
        } else {
          throw new Error('No HLS URL received');
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

  // Setup HLS player and progress tracking
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const saveProgress = async () => {
      if (!video.duration || !lessonId) return;

      try {
        await fetch('/api/progress/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            currentTimeSec: Math.floor(video.currentTime),
            durationSec: Math.floor(video.duration),
          }),
        });
      } catch (e) {
        console.error('Failed to save progress:', e);
      }
    };

    const onTimeUpdate = () => {
      if (!video.duration) return;

      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      const progressPercent = video.currentTime / video.duration;

      // Call onProgress callback
      if (onProgress) {
        onProgress(currentTime, duration);
      }

      // Auto-save at intervals
      if (currentTime > 0 && currentTime % autoSaveInterval === 0) {
        const now = Date.now();
        // Prevent double-saving in the same second
        if (now - lastSaveTimeRef.current > 900) {
          lastSaveTimeRef.current = now;
          saveProgress();
        }
      }

      // Mark as completed when reaching 90%
      if (progressPercent >= 0.9 && !completedRef.current) {
        completedRef.current = true;
        saveProgress();
        if (onComplete) {
          onComplete();
        }
      }
    };

    const onPause = () => {
      // Save progress when user pauses
      saveProgress();
    };

    const onEnded = () => {
      // Save progress when video ends
      saveProgress();
      if (onComplete && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    };

    // Setup HLS or native playback
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      // Use hls.js for other browsers
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          setError('Erro ao reproduzir vídeo');
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, trying to recover...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, trying to recover...');
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      setError('Seu navegador não suporta reprodução de vídeo HLS');
      return;
    }

    // Attach event listeners
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      
      if (hls) {
        hls.destroy();
      }
    };
  }, [hlsUrl, lessonId, autoSaveInterval, onProgress, onComplete]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-black/10 rounded-lg ${className}`} style={{ width: '100%', minHeight: 400 }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-destructive/10 rounded-lg ${className}`} style={{ width: '100%', minHeight: 400 }}>
        <div className="text-center p-4">
          <p className="text-destructive font-medium mb-2">Erro ao carregar vídeo</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      className={`rounded-lg ${className}`}
      style={{ width: '100%', maxWidth: '100%', backgroundColor: '#000' }}
      playsInline
      preload="metadata"
    />
  );
}

