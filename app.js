const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Spotify API credentials
const clientId = '3d521d53985440be9a591833045d06c2'; // Replace with your Spotify client ID
const clientSecret = 'e65acdeb97b14366b98bd95a34ea211f'; // Replace with your Spotify client secret
const redirectUri = 'http://localhost:3000/callback'; // Replace with your redirect URI

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Homepage route
app.get('/', (req, res) => {
  res.render('index');
});

// Route to handle Spotify login callback
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: localStorage.getItem('code_verifier')
      })
    });

    // Set access token for subsequent requests
    spotifyApi.setAccessToken(response.data.access_token);

    // Redirect user to homepage
    res.redirect('/');
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).send('Error exchanging authorization code for access token');
  }
});

// Helper function to generate a random string
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
