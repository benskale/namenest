# NameNest

AI-powered baby name discovery app. Deep questionnaire + family tree + AI-driven name generation.

## Tech Stack

- **Frontend:** React Native / Expo SDK 54, TypeScript
- **Backend:** Express + Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** OpenAI-compatible LLM for personalized name generation
- **Platform:** Replit (web, iOS, Android)

## Getting Started

1. Click Run in Replit (or `npm run dev`)
2. Open the preview URL
3. Complete the questionnaire to get personalized name suggestions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Recommended | Enables AI name generation (falls back to static without) |
| `OPENAI_MODEL` | Optional | Model name (default: `gpt-4o`) |
| `OPENAI_BASE_URL` | Optional | Custom endpoint (default: OpenAI) |
| `EXPO_PUBLIC_DOMAIN` | Optional | For mobile dev |

## Features

- **50-question smart questionnaire** with conditional branching
- **Family tree builder** - add relatives and ancestral surnames
- **AI name generation** - LLM creates personalized suggestions with explanations
- **Swipe deck** - Tinder-style name browsing
- **Name buckets** - yes / maybe / no organization
- **Freemium model** - free tier with premium upgrade

## AI Name Generation

The app calls `/api/generate-names` which sends the full questionnaire profile + family tree to an LLM to generate deeply personalized name suggestions. Each name includes:

- Origin and language tags
- Rich meaning
- Vibe classification
- Nickname suggestions
- Pronunciation guide
- A personalized "why" explaining how it fits the family

Without `OPENAI_API_KEY`, the app falls back to a static name database with local scoring.
