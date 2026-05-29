import { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types/game';
import './QuizzMedia.css';

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']);
const AUDIO_EXTS = new Set(['mp3', 'ogg', 'wav', 'aac', 'flac', 'm4a']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogv', 'mov', 'mkv']);

function getMediaType(url: string): 'image' | 'audio' | 'video' | null {
  const ext = url.split('?')[0].toLowerCase().split('.').pop() ?? '';
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (VIDEO_EXTS.has(ext)) return 'video';
  return null;
}

interface QuizzMediaProps {
  url: string;
  gameState: string;
}

const Spinner = () => (
  <div className="quizz-media-spinner-box">
    <div className="quizz-media-spinner" />
  </div>
);

function QuizzMedia({ url, gameState }: QuizzMediaProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mediaType = getMediaType(url);
  const isActive = gameState === GameState.PLAYING || gameState === GameState.REVEAL;
  const [isLoaded, setIsLoaded] = useState(false);

  // Single effect handles all three types. Runs once per url change.
  useEffect(() => {
    setIsLoaded(false);

    const img = imgRef.current;
    const media = (audioRef.current ?? videoRef.current) as HTMLMediaElement | null;

    if (img) {
      // Cached images already have complete=true by the time the effect runs
      if (img.complete && img.naturalHeight > 0) {
        setIsLoaded(true);
        return;
      }
      const onLoad = () => setIsLoaded(true);
      img.addEventListener('load', onLoad, { once: true });
      return () => img.removeEventListener('load', onLoad);
    }

    if (media) {
      // readyState >= 2 means current frame data is available — sufficient to play
      if (media.readyState >= 2) {
        setIsLoaded(true);
        return;
      }
      const onReady = () => setIsLoaded(true);
      // Listen to multiple events — whichever fires first wins
      media.addEventListener('loadeddata', onReady, { once: true });
      media.addEventListener('canplay', onReady, { once: true });
      media.addEventListener('canplaythrough', onReady, { once: true });
      return () => {
        media.removeEventListener('loadeddata', onReady);
        media.removeEventListener('canplay', onReady);
        media.removeEventListener('canplaythrough', onReady);
      };
    }
  }, [url]);

  // Play / pause — only once media is ready
  useEffect(() => {
    const el = (audioRef.current ?? videoRef.current) as HTMLMediaElement | null;
    if (!el || !isLoaded) return;
    if (isActive) {
      el.play().catch((e) => console.error('Media play failed:', e));
    } else {
      el.pause();
    }
  }, [isActive, isLoaded]);

  if (mediaType === 'video') {
    return (
      <div className="quizz-media-container">
        {!isLoaded && <Spinner />}
        <video
          ref={videoRef}
          src={url}
          preload="auto"
          className="quizz-media-video"
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      </div>
    );
  }

  if (mediaType === 'image') {
    return (
      <div className="quizz-media-container">
        {!isLoaded && <Spinner />}
        {/* Keep image in DOM (visibility:hidden) so naturalHeight is set even before load */}
        <img
          ref={imgRef}
          src={url}
          alt=""
          className="quizz-media-image"
          style={{ visibility: isLoaded ? 'visible' : 'hidden', position: isLoaded ? undefined : 'absolute' }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div className="quizz-media-container">
        <audio ref={audioRef} src={url} preload="auto" />
        <div className={`quizz-audio-player ${isLoaded && isActive ? 'playing' : 'paused'}`}>
          {!isLoaded
            ? <div className="quizz-media-spinner" />
            : (
              <div className="quizz-audio-bars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="quizz-audio-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            )
          }
        </div>
      </div>
    );
  }

  return null;
}

export default QuizzMedia;
