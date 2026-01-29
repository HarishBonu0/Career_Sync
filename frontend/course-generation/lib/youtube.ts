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

// Curated educational YouTube channels and their video patterns
const EDUCATIONAL_CHANNELS = {
  'freeCodeCamp.org': 'UC8butISFwT-Wl7EV0hUK0BQ',
  'Traversy Media': 'UC29ju8bIPH5as8OGnQzwJyA',
  'Programming with Mosh': 'UCWv7vMbMWH4-V0ZXdmDpPBA',
  'Academind': 'UCSJbGtTlrDami-tDGPUV9-w',
  'The Net Ninja': 'UCW5YeuERMmlnqo4oq8vwUpg',
  'CS Dojo': 'UCxX9wt5FWQUAAz4UrysqK9A',
  'Corey Schafer': 'UCCezIgC97PvUuR4_gbFUs5g',
}

// Generate curated video recommendations based on topic
function getCuratedVideos(topic: string, moduleNum: number): YouTubeVideo[] {
  const topicLower = topic.toLowerCase()
  const videos: YouTubeVideo[] = []
  
  // Map common topics to curated video IDs (these are real, working educational videos)
  const topicVideoMap: { [key: string]: string[] } = {
    'javascript': ['W6NZfCO5SIk', 'PkZNo7MFNFg', 'jS4aFq5-91M', 'hdI2bqOjy3c'],
    'python': ['rfscVS0vtbE', '_uQrJ0TkZlc', 'kqtD5dpn9C8', 'eWRfhZUzrAc'],
    'react': ['w7ejDZ8SWv8', 'Ke90Tje7VS0', 'bMknfKXIFA8', 'DLX62G4lc44'],
    'nodejs': ['fBNz5xF-Kx4', 'Oe421EPjeBE', 'ENrzD9HAZK4', 'TlB_eWDSMt4'],
    'typescript': ['BwuLSPajF40', 'gp5H0Vw39yw', 'd56mG7DezGs', 'ahCwqrYpIuM'],
    'css': ['1Rs2ND1ryYc', 'yfoY53QXEnI', 'OXGznpKZ_sA', 'ieTHC78giGQ'],
    'html': ['UB1O30fR-EE', 'pQN-pnXPaVg', 'kUMe1FH4CHE', 'HD13eq_Pmp8'],
    'sql': ['HXV3zeQKqGY', 'zbMHLJ0dY4w', '7S_tz1z_5bA', 'SpNSGNB7Y48'],
    'git': ['8JJ101D3knE', 'RGOj5yH7evk', 'apGV9Kg7ics', 'tRZGeaHPoaw'],
  }
  
  // Find matching videos for the topic
  for (const [key, videoIds] of Object.entries(topicVideoMap)) {
    if (topicLower.includes(key) || key.includes(topicLower.split(' ')[0])) {
      const videoId = videoIds[moduleNum % videoIds.length]
      videos.push({
        id: videoId,
        title: `${topic} Tutorial - Part ${moduleNum}`,
        description: `Learn ${topic} with this comprehensive tutorial`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/embed/${videoId}`,
        channelTitle: 'Educational Content',
      })
      return videos
    }
  }
  
  // If no specific match, return generic educational video
  return videos
}

export async function searchYouTubeVideos(
  topic: string,
  maxResults: number = 3
): Promise<YouTubeVideo[]> {
  // Check cache first
  const cacheKey = `${topic}_${maxResults}`
  if (videoCache.has(cacheKey)) {
    return videoCache.get(cacheKey)!
  }

  // If no API key, use curated videos
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️ YouTube API key not configured, using curated videos')
    const curatedVideos = getCuratedVideos(topic, 1)
    if (curatedVideos.length > 0) {
      videoCache.set(cacheKey, curatedVideos)
      return curatedVideos
    }
    return getPlaceholderVideos(topic)
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
      console.error('YouTube API error:', response.statusText, '- Using curated videos instead')
      const curatedVideos = getCuratedVideos(topic, 1)
      if (curatedVideos.length > 0) return curatedVideos
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
    console.error('Error fetching YouTube videos:', error, '- Using curated videos instead')
    const curatedVideos = getCuratedVideos(topic, 1)
    if (curatedVideos.length > 0) return curatedVideos
    return getPlaceholderVideos(topic)
  }
}

// Get first video for a topic with optional module number for better selection
export async function getYouTubeVideoForTopic(topic: string, moduleNum: number = 1): Promise<YouTubeVideo | null> {
  // Try to get curated video first if no API key
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    const curatedVideos = getCuratedVideos(topic, moduleNum)
    if (curatedVideos.length > 0) return curatedVideos[0]
  }
  
  const videos = await searchYouTubeVideos(topic, 1)
  return videos.length > 0 ? videos[0] : null
}

// Placeholder videos in case API fails
function getPlaceholderVideos(topic: string): YouTubeVideo[] {
  // Use a more relevant educational video
  return [
    {
      id: 'rfscVS0vtbE',
      title: `${topic} - Educational Tutorial`,
      description: `Learn ${topic} with this comprehensive tutorial. Note: Configure your YouTube API key for topic-specific videos.`,
      thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbE/hqdefault.jpg',
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
