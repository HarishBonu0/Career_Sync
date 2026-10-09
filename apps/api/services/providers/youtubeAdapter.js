import axios from 'axios';

export async function discover(skill) {
  const youtubeKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
  if (!youtubeKey) {
    throw new Error('YOUTUBE_API_KEY not configured');
  }

  const query = `${skill.skill} tutorial`;
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        key: youtubeKey,
        maxResults: 5,
        relevanceLanguage: 'en'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.items) {
      return [];
    }

    return response.data.items.map(item => {
      const videoId = item.id?.videoId;
      if (!videoId) return null;
      
      const snippet = item.snippet;
      return {
        provider: 'youtube',
        externalId: videoId,
        title: snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        resourceType: 'video',
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        author: snippet.channelTitle,
        publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
      };
    }).filter(Boolean);

  } catch (error) {
    if (error.response && error.response.status === 403) {
      throw new Error('YouTube API rate limited or unauthorized.');
    }
    throw new Error(`YouTube API failed: ${error.message}`);
  }
}
