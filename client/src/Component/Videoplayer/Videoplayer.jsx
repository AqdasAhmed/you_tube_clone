import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import '@videojs/themes/dist/city/index.css';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && videoRef.current && src) {
      if (!playerRef.current) {
        const player = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          responsive: true,
          fluid: true,
          html5: {
            hls: {
              overrideNative: true,
            },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
          },
          sources: [
            {
              src,
              type: 'application/x-mpegURL',
            },
          ],
        });

        playerRef.current = player;

        player.ready(() => {
          if (typeof player.hlsQualitySelector === 'function') {
            player.hlsQualitySelector({
              displayCurrentQuality: true,
            });
          } else {
            console.warn("hlsQualitySelector plugin not available");
          }
        });

      } else {
        playerRef.current.src({ src, type: 'application/x-mpegURL' });
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isMounted, src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-theme-city" />
    </div>
  );
};

export default VideoPlayer;
