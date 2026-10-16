const validId = /^[A-Za-z0-9_-]{11}$/
export function youtubeId(video) {
  if (typeof video?.id === 'string' && validId.test(video.id)) return video.id
  try {
    const url = new URL(video?.url)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.toLowerCase()
    let id
    if (host === 'youtu.be') id = url.pathname.split('/')[1]
    else if (
      ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)
    ) {
      id =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : /^\/(?:embed|shorts)\/([^/]+)$/.exec(url.pathname)?.[1]
    }
    return typeof id === 'string' && validId.test(id) ? id : null
  } catch {
    return null
  }
}
