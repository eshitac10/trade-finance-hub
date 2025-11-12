# Generate Article Thumbnail

This edge function generates AI-powered thumbnails for articles using Lovable AI's image generation capability.

## Usage

POST request with JSON body:
```json
{
  "title": "Article Title Here"
}
```

Returns:
```json
{
  "thumbnail": "data:image/png;base64,..."
}
```

The thumbnail is generated based on the article title and optimized for finance/trade content.
