# CognitoFlow

AI-powered exam paper analysis tool that extracts topics, tracks trends, and compares teacher question patterns over the years.

## Features

- **PDF/Image Upload** - Upload exam papers for automatic topic extraction
- **Topic Analysis** - Visualize topic distribution with heatmaps
- **Teacher Comparison** - Compare question patterns across teachers
- **Year-over-Year Trends** - Track how topics evolve over time
- **Export Reports** - Generate downloadable analysis reports

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python Flask (in `/backend`)
- **Database**: MySQL + Supabase
- **Deployment**: Vercel

## Getting Started

### Frontend (Current)

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Project Structure

```
├── src/              # React components and pages
├── backend/          # Flask API server
├── supabase/         # Database schemas
├── public/           # Static assets
└── dist/             # Production build output
```
