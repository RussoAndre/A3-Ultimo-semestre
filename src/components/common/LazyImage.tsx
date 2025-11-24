import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  threshold?: number
}

const LazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
  threshold = 0.1,
  className = '',
  ...props
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.disconnect()
          }
        })
      },
      { threshold }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [src, threshold])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`}
      {...props}
    />
  )
}

export default LazyImage
