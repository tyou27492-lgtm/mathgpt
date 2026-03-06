# MathGPT Assistant

A modern, frontend-only math assistant website with a ChatGPT-like interface and custom math keyboard.

## Features

- **Chat Interface**: Clean, responsive chat interface similar to ChatGPT
- **Math Keyboard**: Custom keyboard with mathematical symbols and operators
- **Multilingual Support**: Automatic language detection and response
- **Chat History**: Persistent chat history using localStorage
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Math Problem Solving**: Step-by-step explanations for mathematical problems
- **API Integration**: Ready to connect with Windsurf Agent API

## File Structure

```
mathgpt-frontend/
├── index.html      # Main HTML structure
├── style.css       # Modern responsive styling
├── app.js          # JavaScript functionality
└── README.md       # Documentation
```

## Quick Start

1. **Open the website**: Simply open `index.html` in your web browser

2. **Replace API Key**: Edit `app.js` and replace `YOUR_AGENT_API_KEY` with your actual Windsurf Agent API key:

```javascript
this.apiKey = 'your_actual_api_key_here';
```

3. **Deploy**: Ready to deploy on Netlify, Vercel, or GitHub Pages

## Math Keyboard Symbols

The custom math keyboard includes:

**Basic Operations**: +, −, ×, ÷, ^, √, π, %

**Fractions**: ½, ⅓, ⅔, ¼, ¾

**Greek Letters**: α, β, γ, δ, θ, λ, μ, σ

**Advanced Symbols**: ∞, ≈, ≠, ∫, ∑, ∏, ∂, ∇, ∈, ⊂, ∪

## API Integration

The app is designed to work with the Windsurf Agent API. Expected response format:

```json
{
  "answer": "<AI response text>",
  "type": "general" or "math",
  "language": "<detected language>",
  "timestamp": "<ISO timestamp>"
}
```

### Demo Mode

The app includes a demo mode that provides mock responses when the API key is not set. This allows you to test the interface and functionality before connecting to the actual API.

## Features in Detail

### Chat Interface
- Clean, modern design with gradient backgrounds
- Distinct styling for user and AI messages
- Message timestamps and avatars
- Smooth animations and transitions
- Auto-scrolling to latest messages

### Math Keyboard
- Click-to-insert math symbols
- Organized in logical rows
- Hover effects and visual feedback
- Works with cursor position in text input

### Responsive Design
- Mobile-optimized layout
- Touch-friendly buttons
- Adaptive font sizes
- Flexible grid system

### Data Persistence
- Chat history saved in localStorage
- Automatic save on page visibility changes
- Clear chat functionality with confirmation
- History restoration on page reload

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Deployment

### Netlify
1. Push the code to a GitHub repository
2. Connect the repository to Netlify
3. Deploy automatically

### Vercel
1. Push the code to a GitHub repository
2. Import the project in Vercel
3. Deploy with one click

### GitHub Pages
1. Push the code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as source

## Customization

### Colors
Edit the CSS variables in `style.css` to customize the color scheme:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Math Symbols
Add or remove symbols from the math keyboard by editing the HTML in `index.html`:

```html
<button class="math-key" data-symbol="your-symbol">your-symbol</button>
```

### API Endpoint
Change the API endpoint in `app.js`:

```javascript
const response = await fetch('your-api-endpoint', {
    // ... configuration
});
```

## Security Notes

- The API key is stored in the frontend JavaScript
- For production, consider using a backend proxy to hide the API key
- The app uses HTTPS-ready endpoints for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
