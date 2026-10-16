let pending
export function loadYouTubePlayer() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    let timer
    const ready = () => {
      clearTimeout(timer)
      window.onYouTubeIframeAPIReady = previous
      resolve(window.YT)
      if (typeof previous === 'function') previous()
    }
    window.onYouTubeIframeAPIReady = ready
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    const failed = () => {
      clearTimeout(timer)
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous
      script.remove()
      reject(new Error('Player API unavailable'))
    }
    script.onerror = failed
    timer = setTimeout(failed, 15000)
    document.head.appendChild(script)
  }).catch((error) => {
    pending = undefined
    throw error
  })
  return pending
}
