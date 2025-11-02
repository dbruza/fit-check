# Fit Check

<div align="center">
<img width="1200" height="475" alt="Fit Check Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Fit Check** is a virtual try-on application that lets you see how outfits look on you before you buy. Upload a photo of yourself and experiment with different garments in a realistic, AI-powered virtual fitting room.

## Features

- **Virtual Try-On**: Upload your photo and see how different garments look on you
- **AI-Powered**: Powered by Google Gemini AI for realistic image generation
- **Pose Variations**: View your outfit from multiple angles and poses (frontal, side profile, action shots, etc.)
- **Personal Wardrobe**: Build and manage your own wardrobe collection
- **Outfit Stacking**: Layer multiple garments to create complete outfits
- **Smooth Animations**: Beautiful UI with Framer Motion animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Google Gemini API** - AI image generation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **React Image Crop** - Image editing

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** - Get one from [Google AI Studio](https://ai.google.dev/)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dbruza/fit-check.git
   cd fit-check
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   
   Replace `your_api_key_here` with your actual Google Gemini API key.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## How It Works

1. **Upload Your Photo**: Start by uploading a photo of yourself
2. **AI Model Creation**: The app uses AI to transform your photo into a model-ready image
3. **Try On Garments**: Browse the wardrobe and select garments to try on
4. **Experiment with Poses**: Change poses to see your outfit from different angles
5. **Build Outfits**: Layer multiple garments to create complete looks
6. **Manage Your Wardrobe**: Add and organize your favorite pieces

## Project Structure

```
fit-check/
├── components/          # React components
│   ├── Canvas.tsx      # Main display canvas
│   ├── StartScreen.tsx # Initial upload screen
│   ├── WardrobeModal.tsx # Wardrobe management
│   └── ...
├── services/
│   └── geminiService.ts # Google Gemini API integration
├── lib/
│   └── utils.ts        # Utility functions
├── types.ts            # TypeScript type definitions
├── wardrobe.ts         # Default wardrobe items
└── App.tsx             # Main application component
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache-2.0 License.

## Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
