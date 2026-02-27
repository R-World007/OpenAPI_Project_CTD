# Random Dog Breed Explorer

A simple web app that shows a random dog image with breed details using [The Dog API](https://thedogapi.com/).

## Features

- Shows a random dog image
- Displays breed information:
  - Breed name
  - Temperament
  - Life span
  - Breed group
- Includes fallback logic to reduce "unknown breed" responses
- Responsive cute pink/white UI

## Project Structure

- `index.html` - page structure
- `index.css` - styling and responsive layout
- `index.js` - API calls and UI rendering logic

## Getting Started

1. Open the project folder.
2. Run with a local server (recommended), for example using VS Code Live Server.
3. Open `index.html` in the browser.

## API Key

The app can work without a key (lower rate limits), but using a key is recommended.

In `index.js`:

```js
const API_KEY = "YOUR_DOG_API_KEY";
```

Get a key from The Dog API dashboard.

## How It Works

- First request: `GET /v1/images/search?limit=1&has_breeds=true`
- If breed info is missing:
  1. Fetch all breeds from `GET /v1/breeds`
  2. Pick a random breed
  3. Fetch image by that breed with `GET /v1/images/search?breed_ids=...`

This helps ensure breed information is shown more consistently.

## Troubleshooting

- If only image appears with missing data:
  - Click **Show Another Dog**
  - Check browser console for API errors
- If requests fail:
  - Verify internet connection
  - Verify API key (if used)
  - Check rate limits on your Dog API account

## License

See [LICENSE](LICENSE).
