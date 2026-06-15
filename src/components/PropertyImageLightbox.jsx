import { useMemo } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

function LoadingIcon() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
        aria-label="Loading image"
      />
    </div>
  )
}

function ErrorIcon() {
  return (
    <div className="rounded-lg bg-black/40 px-3 py-2 text-center font-sans text-sm text-white">
      Failed to load image
    </div>
  )
}

export function PropertyImageLightbox({
  open,
  index = 0,
  images = [],
  alt = 'Property image',
  onClose,
  onIndexChange,
}) {
  const slides = useMemo(
    () =>
      (Array.isArray(images) ? images : [])
        .filter(Boolean)
        .map((src) => ({
          src,
          alt,
        })),
    [images, alt]
  )

  return (
    <Lightbox
      open={Boolean(open)}
      close={onClose}
      index={Math.max(0, Math.min(index, Math.max(0, slides.length - 1)))}
      slides={slides}
      plugins={[Zoom]}
      carousel={{ finite: false, preload: 2 }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      animation={{ fade: 120, swipe: 200 }}
      zoom={{
        maxZoomPixelRatio: 3.5,
        zoomInMultiplier: 1.6,
        doubleTapDelay: 260,
        doubleClickDelay: 260,
        scrollToZoom: true,
      }}
      render={{
        iconLoading: () => <LoadingIcon />,
        iconError: () => <ErrorIcon />,
      }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.92)', zIndex: 90 },
      }}
      on={{
        view: ({ index: nextIndex }) => {
          if (typeof onIndexChange === 'function') onIndexChange(nextIndex)
        },
        entered: () => {
          try {
            document.documentElement.style.overflow = 'hidden'
          } catch {
            // ignore
          }
        },
        exited: () => {
          try {
            document.documentElement.style.overflow = ''
          } catch {
            // ignore
          }
        },
      }}
    />
  )
}
