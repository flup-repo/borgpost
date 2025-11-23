# BorgPost

> Automated social media management tool for building an audience on X.com (Twitter) through consistent, high-quality, AI-generated content.

## 🚀 Overview

BorgPost is a 24/7 automated posting system that uses AI to generate engaging social media content based on customizable categories, prompts, and RSS feeds. Built with modern TypeScript architecture for reliability and scalability.

## ✨ Key Features

- 🤖 **AI-Powered Content Generation** - Uses Gemini API to create unique, engaging posts
- 📅 **Smart Scheduling** - Define recurring time slots with flexible patterns
- 🔄 **Auto-Fill Queue** - Intelligent background worker fills empty slots automatically
- 📰 **RSS Integration** - Ingests external content to ground AI-generated posts in real news
- 🧵 **Thread Support** - Automatically splits long posts into numbered threads
- 📊 **Analytics Dashboard** - Track engagement, performance, and optimal posting times
- 🎯 **Category Management** - Organize content by topics (Tech, AI, Crypto, etc.)
- ✍️ **Prompt Library** - Reusable templates with variable substitution
- 🔒 **Content Moderation** - Optional review workflow before posting

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10+ (TypeScript)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Job Queues**: BullMQ with Redis
- **AI/LLM**: Google Gemini API
- **Social Media**: Twitter API v2

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **UI Library**: Shadcn/UI + Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js 20 or higher
- Redis (for job queues)
- PostgreSQL 15+ (for production)
- Gemini API key ([Get one here](https://ai.google.dev/))
- Twitter Developer Account ([Apply here](https://developer.twitter.com/))

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/borgpost.git
cd borgpost
```

### 2. Install dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 3. Configure environment variables

```bash
# Backend - copy .env.example to .env and fill in values
cp .env.example .env
```

Required environment variables:
- `GEMINI_API_KEY` - Your Gemini API key
- `TWITTER_API_KEY` - Twitter API key
- `TWITTER_API_SECRET` - Twitter API secret
- `TWITTER_ACCESS_TOKEN` - Twitter access token
- `TWITTER_ACCESS_SECRET` - Twitter access token secret
- `REDIS_HOST` - Redis host (default: localhost)
- `DATABASE_TYPE` - Database type (sqlite or postgres)

### 4. Run database migrations

```bash
cd backend
npm run migration:run
```

### 5. Start the development servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:3000`  
Frontend runs on `http://localhost:5173`

## 📖 Documentation

- [Implementation Plan](docs/borgpost-implementation-plan.md) - Detailed technical architecture
- [Agent Guidelines](AGENTS.md) - Development rules and conventions
- [API Documentation](docs/api.md) - REST API reference (coming soon)

## 🔄 Development Workflow

This project follows **Gitflow** with strict branch protection:

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

**All changes must go through Pull Requests**. See [AGENTS.md](AGENTS.md) for detailed guidelines.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage report

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Option 1: Railway (Recommended)
1. Connect GitHub repository
2. Add PostgreSQL and Redis services
3. Configure environment variables
4. Deploy

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: VPS with PM2
```bash
npm run build
pm2 start ecosystem.config.js
```

See [Implementation Plan](docs/borgpost-implementation-plan.md#deployment) for detailed deployment instructions.

## 📊 Project Status

🚧 **In Development** - This project is actively being built.

### Current Phase: Foundation
- [x] Project planning and architecture design
- [x] Technology stack selection
- [x] Documentation and guidelines
- [ ] Backend API implementation
- [ ] Frontend UI development
- [ ] AI content generation
- [ ] Twitter integration
- [ ] Job scheduling system

See the [Implementation Plan](docs/borgpost-implementation-plan.md#9-implementation-plan-detailed-step-by-step) for the full roadmap.

## 🤝 Contributing

Contributions are welcome! Please read [AGENTS.md](AGENTS.md) for:
- Code style guidelines
- Commit message conventions
- Pull request process
- Testing requirements

## 📝 License

[MIT License](LICENSE) - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [Google Gemini](https://ai.google.dev/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or suggestions, please open an issue or contact the maintainer.

---

**⚠️ Disclaimer**: This tool is for educational and personal use. Always comply with Twitter's Terms of Service and API usage policies. Use responsibly and respect rate limits.
