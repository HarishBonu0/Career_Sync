// YouTube API Service
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  duration?: string
  channelTitle?: string
  viewCount?: string
}

// Cache videos to avoid excessive API calls
const videoCache = new Map<string, YouTubeVideo[]>()

export async function searchYouTubeVideos(
  topic: string,
  maxResults: number = 3
): Promise<YouTubeVideo[]> {
  // Check cache first
  const cacheKey = `${topic}_${maxResults}`
  if (videoCache.has(cacheKey)) {
    return videoCache.get(cacheKey)!
  }

  try {
    // More precise search query - focus on complete courses and comprehensive tutorials
    const searchQuery = `${topic} complete course full tutorial masterclass`

    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&maxResults=${maxResults * 2}&type=video&videoDuration=medium&videoEmbeddable=true&order=relevance&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('YouTube API error:', response.statusText)
      return getPlaceholderVideos(topic)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return getPlaceholderVideos(topic)
    }

    // Filter videos for educational content (exclude shorts, low quality, etc.)
    const filteredVideos: YouTubeVideo[] = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase()
        const channel = item.snippet.channelTitle.toLowerCase()
        
        // Exclude common low-quality channels/content
        const excludePatterns = ['shorts', 'highlight', 'clip', 'reaction', 'vlog']
        const hasExcluded = excludePatterns.some(pattern => title.includes(pattern))
        
        // Prefer educational channels and comprehensive tutorials
        const qualityPatterns = ['tutorial', 'complete', 'full course', 'lesson', 'learn', 'masterclass', 'guide']
        const isQuality = qualityPatterns.some(pattern => title.includes(pattern) || channel.includes(pattern))
        
        return !hasExcluded && isQuality
      })
      .slice(0, maxResults)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }))

    // If filtering removed too many results, fall back to unfiltered
    const resultsToUse = filteredVideos.length > 0 ? filteredVideos : data.items.slice(0, maxResults).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/embed/${item.id.videoId}`,
      channelTitle: item.snippet.channelTitle,
    }))

    // Cache the results
    videoCache.set(cacheKey, resultsToUse)
    return resultsToUse
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return getPlaceholderVideos(topic)
  }
}

// Get first video for a topic
export async function getYouTubeVideoForTopic(topic: string): Promise<YouTubeVideo | null> {
  const videos = await searchYouTubeVideos(topic, 1)
  return videos.length > 0 ? videos[0] : null
}

// Placeholder videos in case API fails
function getPlaceholderVideos(topic: string): YouTubeVideo[] {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: `Learn ${topic} - Educational Video`,
      description: `This is a placeholder video for ${topic}. Please ensure your YouTube API key is configured correctly.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      channelTitle: 'Educational Content',
    },
  ]
}

// Get multiple videos for a course topic
export async function getYouTubeVideosForModule(
  moduleTopic: string,
  courseTitle: string
): Promise<YouTubeVideo[]> {
  const searchTerm = `${courseTitle} ${moduleTopic}`.trim()
  return searchYouTubeVideos(searchTerm, 5)
}
