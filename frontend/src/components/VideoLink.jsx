import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink, CheckCircle2, Circle } from 'lucide-react'
import { youtubeId } from '../utils/youtube.mjs'
import { loadYouTubePlayer } from '../utils/youtubePlayer'
import { auth } from '../firebase'
import './VideoLink.css'

function VideoPlayer({ video, id, onClose, watched, onWatched }) {
  const dialog = useRef(null)
  const frame = useRef(null)
  const completed = useRef(onWatched)
  completed.current = onWatched
  const titleId = useId()
  useEffect(() => {
    const container = frame.current
    let disposed = false
    let player
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    iframe.title = video.titulo || video.title || 'Aula em vídeo'
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    container.appendChild(iframe)
    loadYouTubePlayer()
      .then((YT) => {
        if (disposed) return
        player = new YT.Player(iframe, {
          events: {
            onStateChange: (event) => {
              if (!disposed && event.data === YT.PlayerState.ENDED) completed.current(true)
            },
          },
        })
      })
      .catch(() => {
        /* Manual check and embedded playback remain available. */
      })
    return () => {
      disposed = true
      player?.destroy()
      container.replaceChildren()
    }
  }, [id, video.titulo, video.title])
  const title = video.titulo || video.title || 'Aula em vídeo'
  useEffect(() => {
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])
  const closeOutside = (event) => {
    if (event.target !== dialog.current) return
    const bounds = dialog.current.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      onClose()
  }
  return createPortal(
    <dialog
      ref={dialog}
      className="video-player-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={closeOutside}
    >
      <header className="video-player-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {(video.canal || video.channel) && <p>{video.canal || video.channel}</p>}
        </div>
        <button
          type="button"
          className="video-player-close"
          aria-label="Fechar vídeo"
          onClick={onClose}
          autoFocus
        >
          <X size={20} />
        </button>
      </header>
      <div className="video-player-frame" ref={frame} />
      <div className="video-player-progress">
        <button
          type="button"
          className={`video-player-check${watched ? ' is-watched' : ''}`}
          aria-pressed={watched}
          onClick={() => onWatched(!watched)}
        >
          {watched ? <CheckCircle2 size={19} /> : <Circle size={19} />}
          {watched ? 'Assistido' : 'Marcar como assistido'}
        </button>
        <span aria-live="polite">
          {watched
            ? 'Aula marcada como assistida.'
            : 'O check é marcado automaticamente ao terminar o vídeo.'}
        </span>
      </div>
      <footer className="video-player-footer">
        <span>Se o vídeo não estiver disponível aqui, abra no YouTube.</span>
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
          Abrir no YouTube <ExternalLink size={14} />
        </a>
      </footer>
    </dialog>,
    document.body,
  )
}

export default function VideoLink({
  video,
  children,
  href: _href,
  target: _target,
  rel: _rel,
  ...props
}) {
  const [open, setOpen] = useState(false)
  const id = youtubeId(video)
  const storageKey = `intellectus:watched:${auth.currentUser?.uid || 'guest'}:${id}`
  const readWatched = () => {
    try {
      return localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  }
  const [watched, setWatched] = useState(readWatched)
  useEffect(() => {
    setWatched(readWatched())
  }, [storageKey])
  const markWatched = (value) => {
    setWatched(value)
    try {
      if (value) localStorage.setItem(storageKey, 'true')
      else localStorage.removeItem(storageKey)
    } catch {
      /* Keep the current session usable when storage is unavailable. */
    }
  }
  return (
    <>
      <a
        {...props}
        style={{ ...props.style, position: 'relative' }}
        href={id ? `https://www.youtube.com/watch?v=${id}` : undefined}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          if (id) setOpen(true)
        }}
      >
        {children}
        {watched && (
          <span className="video-watched-badge" aria-label="Vídeo assistido">
            <CheckCircle2 size={14} />
            <span>Assistido</span>
          </span>
        )}
      </a>
      {open && (
        <VideoPlayer
          video={video}
          id={id}
          watched={watched}
          onWatched={markWatched}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
