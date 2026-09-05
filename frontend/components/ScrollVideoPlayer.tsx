'use client';

import React, { useRef, useState, useEffect } from 'react';
import ScrollBlurReveal from './ScrollBlurReveal';

interface ScrollVideoPlayerProps {
  src: string;
  isLoaded: boolean;
}

export default function ScrollVideoPlayer({
  src,
  isLoaded,
}: ScrollVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    // If metadata is already loaded
    if (video.readyState >= 1) {
      setVideoDuration(video.duration);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let isVisible = false;
    let animationFrameId: number;

    const handleScroll = () => {
      if (!isVisible || !video.duration) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = rect.height;
      const visibleHeight = window.innerHeight;

      // Calculate progress of this container passing through the viewport
      const scrolled = -rect.top;
      const maxScroll = totalHeight - visibleHeight;

      if (maxScroll <= 0) return;

      let progress = scrolled / maxScroll;
      progress = Math.min(1, Math.max(0, progress));

      // Seek video to target time based on progress
      video.currentTime = progress * video.duration;
    };

    const handleScrollTick = () => {
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          window.addEventListener('scroll', handleScrollTick, {
            passive: true,
          });
          handleScroll(); // initial sync
        } else {
          window.removeEventListener('scroll', handleScrollTick);
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: Array.from({ length: 41 }, (_, i) => i / 40) }, // more granular observations for smoothness
    );

    observer.observe(container);

    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[200vh] w-full relative bg-black select-none"
    >
      {/* Sticky container that centers the video in viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-black overflow-hidden">
        <div
          className={`w-full h-full flex items-center justify-center transition-all duration-[1000ms] ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ScrollBlurReveal className="w-full h-full">
            <video
              ref={videoRef}
              src={src}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover pointer-events-none"
            />
          </ScrollBlurReveal>
        </div>
      </div>
    </div>
  );
}
