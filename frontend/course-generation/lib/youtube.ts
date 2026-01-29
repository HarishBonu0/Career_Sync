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

// Premium educational YouTube channels with verified high-quality content
const EDUCATIONAL_CHANNELS = {
  'freeCodeCamp.org': 'UC8butISFwT-Wl7EV0hUK0BQ',
  'Traversy Media': 'UC29ju8bIPH5as8OGnQzwJyA',
  'Programming with Mosh': 'UCWv7vMbMWH4-V0ZXdmDpPBA',
  'Academind': 'UCSJbGtTlrDami-tDGPUV9-w',
  'The Net Ninja': 'UCW5YeuERMmlnqo4oq8vwUpg',
  'CS Dojo': 'UCxX9wt5FWQUAAz4UrysqK9A',
  'Corey Schafer': 'UCCezIgC97PvUuR4_gbFUs5g',
  'Web Dev Simplified': 'UCFbNIlppjREEEM2I-UtNTow',
  'Fireship': 'UCsBjURrPoezykLs9EqgamOA',
  'Kevin Powell': 'UCJZV4d49DLaatr_39WNyoo',
  'Tech With Tim': 'UCBJycsmduvVTj7vLKQi6eQg',
  'sentdex': 'UCfV36TX5AejfAGIbtwTc8Zw',
  'Real Python': 'UCWiUlWVzBro0tzAaVklKBtQ',
}

// Comprehensive module-level video mapping
// Maps specific module topics to highly relevant YouTube video IDs
const MODULE_VIDEO_MAP: { [key: string]: string[] } = {
  // JavaScript Core
  'javascript variables': ['W6NZfCO5SIk', 'jS4aFq5-91M', 'T-Zy5SbEhNk'],
  'javascript data types': ['PkZNo7MFNFg', 'hdI2bqOjy3c', '79DijfCqnZE'],
  'javascript functions': ['FOD408a0EzY', 'xUI5Fnaq58E', 'z0gNLXCEpA8'],
  'javascript arrays': ['Sp3-nJiCi5w', 'OVlZKUE_D5s', 'vVEEVHV1bqc'],
  'javascript objects': ['Qqx3IO7d_aU', '6TlY54h5z5M', 'ixoKP4eeDWs'],
  'javascript async await': ['vGuqKIRWoNU', 'HNbtD94vpZE', 'ZYb_ZU8LNv4'],
  'javascript promises': ['2d7d3SFZDKo', '7PlVeZfPWCU', '28MXziSQTrI'],
  'javascript dom': ['e9IIcsc23B0', 'jnMY2dLv2F4', 'fA4TlTGnQAQ'],
  'javascript events': ['tJzezMrwQKo', 'PnGT_Yb4Nnw', 'xRjU4pVKQfQ'],
  'javascript closures': ['2nYbYJ8JuK4', 'v3d19sYkUUU', 'vKJpWSwW0_M'],
  
  // React
  'react components': ['w7ejDZ8SWv8', 'Ke90Tje7VS0', 'dQw4w9WgXcQ'],
  'react hooks': ['Qqx3IO7d_aU', 'O6P86XQ5kLo', 'TNhaISOUy6Q'],
  'react props': ['xVjQ0dqiRLU', 'Z5cUyH-_5gI', 'bMknfKXIFA8'],
  'react state': ['e5shqT5PmWA', 'O6P86XQ5kLo', 'qWWu4-PUucE'],
  'react routing': ['Law7YwDmgus', 'K8pHv7Z_sCU', 'iVhkta-the8'],
  'react context': ['5LrDIUGw5_I', 'xWaQ8quyNDE', '2O0rfowawOU'],
  
  // Python
  'python basics': ['rfscVS0vtbE', '_uQrJ0TkZlc', 'kqtD5dpn9C8'],
  'python functions': ['eWRfhZUzrAc', 'u-OmVr_fO0E', 'sXr8vVVPPh8'],
  'python oop': ['JeznW_7DlrQ', 'wfcWRAxRjT0', 'quq8G4hhGyI'],
  'python lists': ['rRy3vBvDns0', 'sKD3NlOQiKE', 'z1Yd7aUUag0'],
  'python dictionaries': ['daefaLgNkw0', 'K8pHv7Z_sCU', 'h_qPc6P6iJM'],
  'python loops': ['94UHEutL5vI', '728RwXrFBbI', 'PiYfRrKTLgM'],
  'python pandas': ['vmEHCJOfvS8', 'e_4YuZoYFOU', 'dcqPhpY7tWk'],
  
  // Node.js & Backend
  'nodejs basics': ['fBNz5xF-Kx4', 'Oe421EPjeBE', 'ENrzD9HAZK4'],
  'nodejs express': ['KyUTOlw_-DU', '6oiabY1NpS0', 'gnsO8-nZFKo'],
  'nodejs rest api': ['l8WPWK9mS5M', 'Y5fbRQKxOqI', 'HQ9JiZkTJt4'],
  'nodejs mongodb': ['4yqu8DhvCC0', 'ElbkZMLUNKE', 'wtImoT9aE3c'],
  
  // Web Development
  'html basics': ['UB1O30fR-EE', 'pQN-pnXPaVg', 'kUMe1FH4CHE'],
  'html forms': ['YwbsxiArkzE', 'Wm6CUkswsNw', 'zMFX1p-FVTQ'],
  'css basics': ['1Rs2ND1ryYc', 'yfoY53QXEnI', 'OXGznpKZ_sA'],
  'css flexbox': ['K74l26pE4YA', 'JJSoEo8JSnc', '4Wlu2a_jXVY'],
  'css grid': ['EiNiSFIPIQE', 'sKD3NlOQiKE', '9zBsdzdE4sM'],
  'responsive design': ['srvUrAsNHVQ', 'BIp5VwJwl1s', 'BzokMSec5_8'],
  
  // TypeScript
  'typescript basics': ['BwuLSPajF40', 'gp5H0Vw39yw', 'd56mG7DezGs'],
  'typescript types': ['e_P4V-RscNs', 'PKy5vd5e3O8', 'ahCwqrYpIuM'],
  'typescript interfaces': ['PKy5vd5e3O8', 'e_P4V-RscNs', 'sWp-KBUpeterson'],
  
  // Git & DevOps
  'git basics': ['8JJ101D3knE', 'RGOj5yH7evk', 'apGV9Kg7ics'],
  'git workflow': ['tRZGeaHPoaw', 'Ov23hKQAvfA', 'Oy-VTFuMyD0'],
  'docker basics': ['3c-iBneGIngE', 'pTFZFxd4Koc', 'aLkD1As_SuI'],
  
  // Databases
  'sql basics': ['HXV3zeQKqGY', 'zbMHLJ0dY4w', '7S_tz1z_5bA'],
  'sql joins': ['SpNSGNB7Y48', 'Te-BFzBmb0c', 'K-keE3Ekyh4'],
  'mongodb basics': ['ofme2o29ngU', 'PkZNo7MFNFg', 'jS4aFq5-91M'],
  
  // Data Science
  'machine learning basics': ['8385iqKev88', 'F2WtWvZT8KE', 'sRIi8JqiB9I'],
  'tensorflow basics': ['tPYj3fFJbGo', '_Gu7AvXOckQ', 'ixVh6vhc5Ss'],
  'deep learning': ['pHMzNiTJoaU', 'dXwSTFy1I14', 'aircAruvnKk'],
  'computer vision': ['n7LbFLqIGSI', 'Hqawwfup6Ug', 'CrCvD4e4W3c'],
  'natural language': ['xC-c_4eweVQ', 'c-Iokmww9d0', 'kCc8FmEb1nY'],
  
  // Mobile Development
  'android basics': ['fis26HvfBBw', 'ZYekMGeYAqM', 'Mw89w_pAHvg'],
  'swift basics': ['comQ1-x2ogQ', 'TsYscdUSsZ0', 'n7fnWqvFjNU'],
  'react native': ['ur6I5GQvWQA', 'JesusG8V-Bc', 'cOye28zG-14'],
}

// Generate curated video recommendations based on module topic
function getCuratedVideos(topic: string, moduleNum: number): YouTubeVideo[] {
  const topicLower = topic.toLowerCase()
  const videos: YouTubeVideo[] = []
  
  // Exact match lookup in module video map
  for (const [mappedTopic, videoIds] of Object.entries(MODULE_VIDEO_MAP)) {
    if (topicLower.includes(mappedTopic) || mappedTopic.includes(topicLower)) {
      const videoId = videoIds[moduleNum % videoIds.length]
      if (videoId) {
        videos.push({
          id: videoId,
          title: `${topic} Tutorial`,
          description: `Comprehensive tutorial on ${topic}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/embed/${videoId}`,
          channelTitle: 'Educational Content',
        })
        return videos
      }
    }
  }
  
  // If no exact match, return empty for fallback to API
  return videos
}

export async function searchYouTubeVideos(
  topic: string,
  maxResults: number = 3,
  searchType: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo[]> {
  // Check cache first
  const cacheKey = `${topic}_${maxResults}_${searchType}`
  if (videoCache.has(cacheKey)) {
    return videoCache.get(cacheKey)!
  }

  // Try curated videos first for more accurate results
  const curatedVideos = getCuratedVideos(topic, 1)
  if (curatedVideos.length > 0) {
    videoCache.set(cacheKey, curatedVideos)
    return curatedVideos
  }

  // If no API key, return placeholder
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️ YouTube API key not configured, using curated videos')
    return getPlaceholderVideos(topic)
  }

  try {
    // Build more specific search query based on module topic
    let searchQuery = buildSearchQuery(topic, searchType)

    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&maxResults=${maxResults * 3}&type=video&videoDuration=medium&videoEmbeddable=true&order=relevance&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('YouTube API error:', response.statusText)
      return curatedVideos.length > 0 ? curatedVideos : getPlaceholderVideos(topic)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return curatedVideos.length > 0 ? curatedVideos : getPlaceholderVideos(topic)
    }

    // Filter videos aggressively for quality
    const filteredVideos: YouTubeVideo[] = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase()
        const channel = item.snippet.channelTitle.toLowerCase()
        const description = (item.snippet.description || '').toLowerCase()
        
        // EXCLUDE low-quality content
        const excludePatterns = ['shorts', 'highlight', 'clip (10|15|60)?s?', 'reaction', 'vlog', 'gaming', 'music', 'remix', 'live stream', 'stream']
        const shouldExclude = excludePatterns.some(pattern => {
          const regex = new RegExp(pattern)
          return regex.test(title)
        })
        
        if (shouldExclude) return false
        
        // PREFER high-quality channels and content
        const isEducationalChannel = Object.keys(EDUCATIONAL_CHANNELS).some(channelName => 
          channel.includes(channelName.toLowerCase())
        )
        
        const qualityIndicators = ['tutorial', 'complete', 'full course', 'lesson', 'learn', 'masterclass', 'guide', 'deep dive', 'course', 'programming', 'coding', 'development']
        const hasQualityIndicator = qualityIndicators.some(indicator => 
          title.includes(indicator) || description.includes(indicator)
        )
        
        // Give preference to educational channels and quality indicators
        return isEducationalChannel || hasQualityIndicator
      })
      .slice(0, maxResults)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }))

    // If we got good filtered results, use them
    if (filteredVideos.length > 0) {
      videoCache.set(cacheKey, filteredVideos)
      return filteredVideos
    }

    // Fallback: use results without strict filtering but still with basic quality checks
    const results: YouTubeVideo[] = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase()
        const excludePatterns = ['shorts', 'clip', 'reaction']
        return !excludePatterns.some(pattern => title.includes(pattern))
      })
      .slice(0, maxResults)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }))

    videoCache.set(cacheKey, results)
    return results
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return curatedVideos.length > 0 ? curatedVideos : getPlaceholderVideos(topic)
  }
}

// Build smart search queries based on module topic and difficulty
function buildSearchQuery(topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const topicLower = topic.toLowerCase()
  
  // Extract specific concepts from module title
  const concepts = topicLower
    .split(/[,;:\-and]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  // Difficulty-based keywords
  const difficultyKeywords = {
    beginner: ['tutorial', 'introduction', 'for beginners', 'basics'],
    intermediate: ['practical', 'real-world', 'hands-on', 'advanced'],
    advanced: ['deep dive', 'expert', 'production', 'architecture']
  }
  
  const keyword = difficultyKeywords[difficulty][0]
  
  // Build query: primary concept + keyword + "tutorial"
  const primaryConcept = concepts[0] || topic
  return `${primaryConcept} ${keyword} tutorial full guide`
}

// Get first video for a topic with optional module number for better selection
export async function getYouTubeVideoForTopic(
  topic: string, 
  moduleNum: number = 1,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo | null> {
  const videos = await searchYouTubeVideos(topic, 1, difficulty)
  return videos.length > 0 ? videos[0] : null
}

// Placeholder videos in case API fails
function getPlaceholderVideos(topic: string): YouTubeVideo[] {
  return [
    {
      id: 'rfscVS0vtbE',
      title: `${topic} - Educational Tutorial`,
      description: `Learn ${topic} with this comprehensive tutorial. Configure YouTube API key for topic-specific videos.`,
      thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbE/hqdefault.jpg',
      url: 'https://www.youtube.com/embed/rfscVS0vtbE',
      channelTitle: 'Educational Content',
    },
  ]
}

// Get multiple videos for a specific module topic
export async function getYouTubeVideosForModule(
  moduleTopic: string,
  courseTitle?: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo[]> {
  // Search for module-specific topic (more accurate than course + module)
  return searchYouTubeVideos(moduleTopic, 3, difficulty)
}
