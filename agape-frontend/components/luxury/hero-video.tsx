'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface HeroVideoProps {
  videoSrc?: string
  poster: string
  fallbackImage?: string
  children?: React.ReactNode
  overlay?: boolean
}

export function HeroVideo({
  videoSrc,
  poster,
  fallbackImage,
  children,
  overlay = true,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasVideo, setHasVideo] = useState(!!videoSrc)

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        setHasVideo(false)
      })
    }
  }, [videoSrc])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video or Image Background */}
      {hasVideo && videoSrc ? (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          
          {/* Show poster until video loads */}
          {!isVideoLoaded && (
            <Image
              src={poster}
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
          )}
        </>
      ) : (
        <Image
          src={fallbackImage || poster}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </section>
  )
}
