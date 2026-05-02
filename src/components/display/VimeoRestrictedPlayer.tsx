import { useEffect, useRef, useState, useCallback, type JSX } from 'react';
import Player from '@vimeo/player';
import { Box, Button, Group, Text } from '@mantine/core';

export interface VimeoGatedPlayerProps {
  /** The Vimeo video ID (e.g. 76979871). */
  videoId?: string | number;
  /** Fired once when the user has watched the entire video. */
  onComplete?: () => void;
  /** Text shown on the start button. */
  buttonLabel?: string;
  /** URL to the application file users can download after completing the video. */
  applicationUrl?: string;
  /** Filename suggested when downloading the application. */
  applicationFileName?: string;
  /** Number of seconds to jump back when the rewind button is pressed. */
  rewindSeconds?: number;
  /** When true, start playback 1 minute from the end of the video (for testing). */
  debug?: boolean;
}

interface VimeoTimeEvent {
  seconds: number;
  percent: number;
  duration: number;
}

/**
 * Format a number of seconds as `M:SS` (or `H:MM:SS` for long videos).
 *
 * @param {number} totalSeconds - The number of seconds to format.
 * @returns {string} The formatted time string.
 */
function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number): string => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * A Vimeo player that:
 *  - Only starts after the user clicks the start button.
 *  - Hides controls so the viewer cannot change playback rate, seek, or mute.
 *  - Provides a custom pause/resume button.
 *  - Provides a custom rewind button (jumps back N seconds).
 *  - Provides a custom fullscreen toggle button.
 *  - Displays the time remaining in the video.
 *  - Guards against programmatic seeking forward (skip-ahead protection),
 *    while still allowing the user to rewind via the custom button.
 *  - Notifies the parent via `onComplete` when the video has been fully watched.
 *  - Surfaces a "Download Application" button after completion.
 *  - When `debug` is true, jumps to 1 minute before the end on play (for testing
 *    completion behavior quickly).
 */
export function VimeoGatedPlayer({
  videoId='https://vimeo.com/1166414018/f02805b0d6?fl=pl&fe=cm',
  onComplete,
  buttonLabel = 'Start Video',
  applicationUrl = '/application.pdf',
  applicationFileName = 'application.pdf',
  rewindSeconds = 10,
  debug = false,
}: VimeoGatedPlayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const lastTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);
  // Keep a stable reference to the latest onComplete so the player effect
  // doesn't need to depend on it.
  const onCompleteRef = useRef<typeof onComplete>(onComplete);
  // Whether we still need to perform the debug seek-to-near-end.
  const debugSeekPendingRef = useRef<boolean>(false);

  const [started, setStarted] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [canRewind, setCanRewind] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Always keep the latest onComplete callback in the ref.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /** Stop the user from seeking ahead by snapping back to the last legitimate time. */
  const handleSeeked = useCallback((data: VimeoTimeEvent): void => {
    const player = playerRef.current;
    if (!player) return;
    if (data.seconds > lastTimeRef.current + 0.5) {
      player.setCurrentTime(lastTimeRef.current).catch(() => { });
      return;
    }
    // Rewind happened — accept the new position as the latest legitimate time.
    lastTimeRef.current = data.seconds;
    setCurrentTime(data.seconds);
  }, []);

  /** Track normal playback progress. */
  const handleTimeUpdate = useCallback((data: VimeoTimeEvent): void => {
    lastTimeRef.current = data.seconds;
    setCurrentTime(data.seconds);

    if (data.duration && data.duration !== durationRef.current) {
      durationRef.current = data.duration;
      setDuration(data.duration);
    }

    setCanRewind(data.seconds > 0);
  }, []);

  /** Fire completion callback exactly once. */
  const handleEnded = useCallback((): void => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setCurrentTime(durationRef.current);
    const cb = onCompleteRef.current;
    if (cb) cb();
  }, []);

  /** Sync local UI state with the player's actual play/pause state. */
  const handlePlay = useCallback((): void => setIsPaused(false), []);
  const handlePause = useCallback((): void => setIsPaused(true), []);

  /** Toggle play/pause from the custom button. */
  const togglePlayPause = useCallback(async (): Promise<void> => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const paused = await player.getPaused();
      if (paused) {
        await player.play();
      } else {
        await player.pause();
      }
    } catch (err) {
      console.error('Vimeo play/pause failed:', err);
    }
  }, []);

  /** Rewind the video by `rewindSeconds` seconds (clamped to 0). */
  const rewind = useCallback(async (): Promise<void> => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const current = await player.getCurrentTime();
      const next = Math.max(0, current - rewindSeconds);
      // Update the guard reference *before* seeking so the seeked handler
      // recognizes this as a legitimate rewind and doesn't snap us back.
      lastTimeRef.current = next;
      setCurrentTime(next);
      await player.setCurrentTime(next);
    } catch (err) {
      console.error('Vimeo rewind failed:', err);
    }
  }, [rewindSeconds]);

  /** Toggle fullscreen for the player container. */
  const toggleFullscreen = useCallback(async (): Promise<void> => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  }, []);

  // Track fullscreen state changes (including user pressing Esc).
  useEffect(() => {
    const onFsChange = (): void => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Initialize the player after the user clicks "Start".
  // IMPORTANT: this effect intentionally only depends on `started` (and `videoId`)
  // so the player is created exactly once per "Start" click. All event handlers
  // are stable (no changing deps) so they don't trigger re-init.
  useEffect(() => {
    if (!started || !containerRef.current) return;

    const player = new Player(containerRef.current, {
      id: videoId,
      controls: false,
      autoplay: true,
      muted: false,
      keyboard: false,
      pip: false,
      playsinline: true,
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
    });

    playerRef.current = player;
    debugSeekPendingRef.current = debug;
    player.setPlaybackRate(1).catch(() => { });

    // Pull initial duration as soon as it's available.
    player.getDuration()
      .then((d) => {
        durationRef.current = d;
        setDuration(d);
      })
      .catch(() => { });

    /**
     * In debug mode, jump to 1 minute before the end as soon as playback
     * begins. We do this on the first `play` event so the duration and
     * media are ready, and we update `lastTimeRef` *before* seeking so the
     * skip-ahead guard treats it as a legitimate jump.
     */
    const handleFirstPlayDebugSeek = async (): Promise<void> => {
      if (!debugSeekPendingRef.current) return;
      debugSeekPendingRef.current = false;
      try {
        const d = durationRef.current || (await player.getDuration());
        durationRef.current = d;
        const target = Math.max(0, d - 60);
        lastTimeRef.current = target;
        setCurrentTime(target);
        await player.setCurrentTime(target);
      } catch (err) {
        console.error('Vimeo debug seek failed:', err);
      }
    };

    const onPlayInternal = (): void => {
      handlePlay();
      void handleFirstPlayDebugSeek();
    };

    player.on('timeupdate', handleTimeUpdate);
    player.on('seeked', handleSeeked);
    player.on('ended', handleEnded);
    player.on('play', onPlayInternal);
    player.on('pause', handlePause);

    return () => {
      player.off('timeupdate', handleTimeUpdate);
      player.off('seeked', handleSeeked);
      player.off('ended', handleEnded);
      player.off('play', onPlayInternal);
      player.off('pause', handlePause);
      player.destroy().catch(() => { });
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, videoId, debug]);

  if (!started) {
    return (
      <Button mt='xl' onClick={() => setStarted(true)}>
        {buttonLabel}
      </Button>
    );
  }

  const remaining = Math.max(0, duration - currentTime);

  return (
    <Box mt='xl'>
      <div>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: isFullscreen ? '100%' : 800,
            aspectRatio: '16 / 9',
            backgroundColor: '#000',
          }}
        />

        <Group mt='sm' justify='space-between'>
          <Group>
            {!completed && (
              <>
                <Button
                  onClick={togglePlayPause}
                  disabled={completed}
                  aria-label={isPaused ? 'Resume video' : 'Pause video'}
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </Button>

                <Button
                  variant='default'
                  onClick={rewind}
                  disabled={!canRewind}
                  aria-label={`Rewind ${rewindSeconds} seconds`}
                >
                  ⏪ Rewind {rewindSeconds}s
                </Button>

                <Button
                  variant='default'
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? '🡷 Exit Fullscreen' : '⛶ Fullscreen'}
                </Button>
              </>
            )}
            {completed && (
              <Button
                component='a'
                href={applicationUrl}
                download={applicationFileName}
                color='green'
              >
                ⬇ Download Application
              </Button>
            )}
          </Group>

          <Text size='sm' c='dimmed' aria-live='polite'>
            {duration > 0
              ? `Time remaining: ${formatTime(remaining)}`
              : 'Loading…'}
          </Text>
        </Group>

        {completed && <p>✅ Video completed. Thanks for watching!</p>}
      </div>
    </Box>
  );
}