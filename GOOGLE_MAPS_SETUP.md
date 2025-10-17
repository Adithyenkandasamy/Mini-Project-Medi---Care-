# Google Maps API Setup for Medi Care

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## Step 2: Update the API Key

Replace `YOUR_API_KEY` in `/frontend-react/public/index.html` with your actual API key:

```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places">
</script>
```

## Step 3: API Features Implemented

- **Real Hospital Search**: Uses Google Places API to find actual hospitals
- **Location-based**: Gets user's GPS coordinates or manual address input
- **Distance Calculation**: Calculates real distances using coordinates
- **Hospital Details**: Real names, addresses, ratings, and phone numbers
- **Fallback System**: Uses simulated data if API fails

## Usage

1. Click "Find Hospitals" button
2. Allow location access or enter address manually
3. View real nearby hospitals with actual data
4. Call hospitals or get directions via Google Maps

## API Limits

- Free tier: 1000 requests per day
- Consider implementing caching for production use
- Monitor usage in Google Cloud Console
