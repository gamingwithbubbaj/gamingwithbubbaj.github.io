// api.js

// Function to fetch upcoming live stream data from YouTube API
async function fetchUpcomingLiveStream(channelId, apiKey) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}`);
    const data = await response.json();
    return data.items[0];
  }
  
  // Function to fetch recent videos from YouTube API
  async function fetchRecentVideos(channelId, apiKey) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=5&key=${apiKey}`);
    const data = await response.json();
    return data.items;
  }
  
  // Function to fetch Twitch stream status
  async function fetchTwitchStreamStatus(userLogin, clientId, accessToken) {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${userLogin}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    return data.data[0];
  }
