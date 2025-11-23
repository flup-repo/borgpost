# BorgPost Implementation Plan

## 1. App Overview
**BorgPost** is an automated social media management tool designed to build an audience on X.com (Twitter) through consistent, high-quality, AI-generated content. It features a **Node.js + TypeScript + NestJS** backend and a modern **React + TypeScript** frontend, running as a persistent background service that operates 24/7.

### Why This Tech Stack?
- **Single Language**: TypeScript across the entire stack for consistency and code sharing
- **I/O Optimized**: Node.js excels at concurrent API calls, web scraping, and I/O operations (the app's primary workload)
- **Modern & Lightweight**: Faster development, easier deployment, smaller Docker images
- **Rich Ecosystem**: Best-in-class libraries for Gemini, Twitter, RSS, and web scraping
- **Excellent Job Scheduling**: BullMQ provides robust, Redis-backed job queues with precise scheduling
- **Developer Experience**: Hot reload, type safety, less boilerplate than Java

## 2. Features & Functionality

### 2.1 Core Features
- **Dashboard**: 
  - Overview of upcoming posts in queue with timeline
  - Recent activity feed and post history
  - Queue status and slot availability
  - Performance metrics (engagement, reach, follower growth)
  - System health indicators (API status, generation rate, failures)

- **Content Management**:
  - **Categories**: Create/Edit/Delete categories (e.g., Tech, AI, Crypto, Breaking News)
    - Enable/disable categories dynamically
    - Priority levels for category selection
    - Category-specific posting frequency
  - **Prompts**: Comprehensive prompt management system
    - Create reusable prompt templates
    - Assign multiple prompts to a single category (random or weighted selection)
    - Standalone prompts not tied to categories for one-off posts
    - Prompt versioning and A/B testing support
    - Variables in prompts (e.g., {date}, {trending_topic}, {news_summary})
  - **Data Sources**: External content ingestion
    - RSS feed URLs per category (auto-refresh hourly)
    - Individual article URLs for immediate ingestion
    - Content summaries cached in database
    - Source credibility tracking

- **Scheduling & Queue System**:
  - **Time Slots**: Define recurring time slots with flexible patterns
    - Multiple slots per day (e.g., 9 AM, 2 PM, 7 PM)
    - Day-specific patterns (weekdays, weekends, specific days)
    - Category assignment per slot (optional)
  - **Auto-Fill Engine**: Intelligent background worker
    - Automatically generates content to fill empty future slots (7 days ahead)
    - Category rotation based on priority and last-posted time
    - Prompt selection strategy (random, round-robin, performance-based)
  - **Manual Queue Management**:
    - Add posts manually to specific slots
    - Edit generated posts before scheduling
    - Drag-and-drop slot reordering
    - Bulk actions (reschedule, delete, regenerate)
  - **Threading Logic**:
    - Auto-split posts exceeding X.com character limit (280 chars)
    - Numbered threads (1/n, 2/n, etc.)
    - Maintain context across thread posts
    - Preview thread before posting

- **Content Generation**:
  - **LLM Integration**: Pluggable architecture with Gemini as default
    - Primary: Gemini 1.5 Pro (default)
    - Fallback: Gemini 1.5 Flash (if rate limited or cost concerns)
    - Configurable model selection per category
    - Support for custom API endpoints (OpenAI, Claude, etc.)
  - **Context-Aware Generation**:
    - Inject RSS/URL content summaries into prompts
    - Use recent trending topics from ingested sources
    - Avoid repetition by checking last N posts
    - Language: English only
    - Uniqueness validation before scheduling
  - **Media Support**:
    - Optional image/video attachment per post
    - Image URL support (external or uploaded)
    - Future: Text-to-image generation (DALL-E, Stable Diffusion)
    - Media validation (size, format, X.com compliance)

- **Posting & Monitoring**:
  - **X.com Integration**:
    - OAuth 1.0a authentication
    - Post publishing with media attachments
    - Thread posting with proper reply chains
    - Rate limit handling and retry logic
  - **Content Moderation**:
    - Optional review workflow before posting
    - Auto-moderation rules (profanity filter, brand safety)
    - Manual approval queue for sensitive categories
  - **Analytics**:
    - Track post performance (likes, retweets, replies, views)
    - Category performance comparison
    - Optimal posting time analysis
    - Engagement trends over time

- **Settings & Configuration**:
  - API Key management (Gemini, X.com, future integrations)
  - System preferences (timezone, language, retry limits)
  - Notification settings (email alerts on failures)
  - Backup/restore configurations and prompts

## 3. Technology Stack

### 3.1 Backend (Node.js + TypeScript)
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.3+
- **Framework**: NestJS 10+ (Progressive Node.js framework with Angular-like architecture)
  - `@nestjs/core`: Core framework
  - `@nestjs/common`: Common utilities and decorators
  - `@nestjs/platform-express`: HTTP server
  - `@nestjs/typeorm`: Database ORM integration
  - `@nestjs/config`: Configuration management
  - `@nestjs/schedule`: Cron jobs
  - `@nestjs/bull`: Job queue integration
  - `@nestjs/cache-manager`: Response caching

- **Database**: 
  - **ORM**: TypeORM (supports migrations, relations, query builder)
  - **Development**: SQLite (file-based, zero-config)
  - **Production**: PostgreSQL 15+ (recommended)
  - **Migrations**: TypeORM migrations (version control)

- **Job Scheduling & Queues**: 
  - **BullMQ**: Redis-backed job queues for reliable background processing
  - **@nestjs/schedule**: Cron-based scheduled tasks
  - **Redis**: In-memory data store for job queue persistence

- **AI/LLM Integration**:
  - `@google/generative-ai`: Official Google Gemini SDK
  - `axios`: HTTP client with interceptors and retry logic
  - `axios-retry`: Automatic retry with exponential backoff

- **X.com/Twitter Integration**:
  - `twitter-api-v2`: Modern, fully-featured Twitter API v2 client
  - OAuth 1.0a authentication support
  - Rate limit handling built-in

- **RSS/Web Scraping**:
  - `rss-parser`: Fast, simple RSS/Atom feed parser
  - `cheerio`: Fast, jQuery-like HTML parsing
  - `axios`: HTTP requests for fetching content
  - `@mozilla/readability`: Extract clean article content

- **Utilities**:
  - `class-validator`: DTO validation with decorators
  - `class-transformer`: Transform plain objects to class instances
  - `date-fns`: Modern date/time utilities
  - `nanoid`: Generate unique IDs

- **Package Manager**: pnpm (faster, more efficient than npm)

### 3.2 Frontend
- **Framework**: React 18.2+ with TypeScript 5+
- **Build Tool**: Vite 5+ (fast HMR, optimized builds)
- **UI Library**: 
  - **Shadcn/UI**: Modern component library
  - **Radix UI**: Accessible primitives
  - **Tailwind CSS 3+**: Utility-first styling
  - **Lucide React**: Icon library
- **State Management**:
  - **TanStack Query (React Query)**: Server state, caching, synchronization
  - **Zustand**: Lightweight global state (UI preferences)
- **Forms**: React Hook Form + Zod (schema validation)
- **Routing**: React Router v6+
- **Date/Time**: date-fns or Day.js
- **HTTP Client**: Axios with interceptors
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### 3.3 DevOps & Infrastructure
- **Containerization**: 
  - Docker for backend (Node.js 20 Alpine base)
  - Multi-stage builds for optimized images
  - Docker Compose for local development (backend + frontend + PostgreSQL + Redis)

- **Deployment Options**:
  1. **Self-Hosted**: Node.js process on VPS with PM2 (DigitalOcean, Linode, AWS EC2)
  2. **Cloud Platform** (Recommended): 
     - **Railway.app**: Simple deployment with PostgreSQL + Redis add-ons
     - **Render.com**: Free tier available, auto-deploy from Git
     - **Fly.io**: Global distribution, excellent for long-running services
  3. **Container Orchestration**: Kubernetes (for scale)

- **Process Management**: 
  - **PM2**: Production process manager (restart on crash, load balancing, monitoring)
  - Docker restart policies

- **Reverse Proxy**: Nginx for SSL termination and static file serving

- **Monitoring**: 
  - Built-in health endpoints (`/health`, `/metrics`)
  - Optional: Prometheus + Grafana
  - PM2 monitoring dashboard

- **Logging**: 
  - Winston (structured logging library)
  - Daily log rotation
  - JSON format for production (easy parsing)

## 4. Architecture Components

### 4.1 Backend Architecture (NestJS + TypeScript)

#### Project Structure
```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── config/                    # Configuration
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── app.config.ts
├── modules/
│   ├── posts/                 # Posts module
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── posts.entity.ts
│   │   ├── dto/
│   │   └── posts.repository.ts
│   ├── categories/            # Categories module
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.entity.ts
│   ├── prompts/               # Prompts module
│   ├── schedule/              # Schedule slots module
│   ├── analytics/             # Analytics module
│   └── config/                # Configuration module
├── services/                  # Shared services
│   ├── llm/
│   │   ├── llm.service.ts
│   │   └── gemini.client.ts
│   ├── twitter/
│   │   └── twitter.service.ts
│   ├── ingestion/
│   │   ├── rss.service.ts
│   │   └── scraper.service.ts
│   └── moderation/
│       └── moderation.service.ts
├── jobs/                      # Background jobs (BullMQ)
│   ├── auto-fill-queue.processor.ts
│   ├── post-executor.processor.ts
│   ├── rss-refresh.processor.ts
│   └── metrics-sync.processor.ts
├── common/                    # Shared utilities
│   ├── decorators/
│   ├── filters/               # Exception filters
│   ├── guards/                # Auth guards
│   ├── interceptors/          # HTTP interceptors
│   └── utils/
└── database/
    ├── migrations/            # TypeORM migrations
    └── seeds/                 # Database seeders
```

#### Core Components

**Controllers (REST API Layer)**
NestJS controllers use decorators for routing and dependency injection:

- `PostsController`: CRUD operations for posts, queue management
  ```typescript
  @Controller('api/posts')
  export class PostsController {
    @Get() findAll(@Query() query: PostQueryDto)
    @Post() create(@Body() dto: CreatePostDto)
    @Put(':id') update(@Param('id') id: string, @Body() dto: UpdatePostDto)
    @Delete(':id') remove(@Param('id') id: string)
    @Post(':id/regenerate') regenerate(@Param('id') id: string)
    @Post(':id/approve') approve(@Param('id') id: string)
  }
  ```
  
- `CategoriesController`: Category management
  ```typescript
  @Controller('api/categories')
  export class CategoriesController {
    @Get() findAll()
    @Post() create(@Body() dto: CreateCategoryDto)
    @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateCategoryDto)
    @Delete(':id') remove(@Param('id') id: string)
    @Get(':id/feeds') getFeeds(@Param('id') id: string)
    @Post(':id/feeds') addFeed(@Param('id') id: string, @Body() dto: AddFeedDto)
  }
  ```
  
- `PromptsController`, `ScheduleController`, `ConfigController`, `AnalyticsController`: Similar patterns

**Services (Business Logic Layer)**
- `ContentGeneratorService`: AI content generation orchestrator
  - `generatePost(Category, Prompt, Context)` - Generate single post
  - `selectPrompt(Category)` - Prompt selection strategy
  - `buildContext(Category)` - Gather RSS/URL content
  - `validateUniqueness(String)` - Check for duplicates
  
- `LLMService`: LLM API integration abstraction
  - `generate(String prompt, Map<String, String> params)` - Call LLM
  - `handleRateLimits()` - Retry logic
  - `switchModel(String modelName)` - Fallback mechanism
  
- `TwitterService`: X.com/Twitter integration
  - `postTweet(String content, Media)` - Single tweet
  - `postThread(List<String> tweets)` - Tweet thread
  - `uploadMedia(byte[])` - Media upload
  - `fetchPostMetrics(String tweetId)` - Get engagement stats
  
- `SchedulerService`: Job orchestration
  - `schedulePost(Post, LocalDateTime)` - Schedule single post
  - `autoFillQueue()` - Fill empty slots (called hourly)
  - `executeScheduledPosts()` - Post at scheduled time (called every minute)
  - `rescheduleFailedPosts()` - Retry failed posts
  
- `IngestionService`: External content fetching
  - `fetchRSSFeeds(List<String> urls)` - Parse RSS feeds
  - `scrapeArticle(String url)` - Extract article content
  - `summarizeContent(String)` - Generate summary for LLM context
  - `cacheContent(Content)` - Store in database
  
- `ModerationService`: Content safety
  - `checkProfanity(String)` - Filter inappropriate content
  - `validateBrandSafety(String)` - Check against brand guidelines
  - `requiresApproval(Post)` - Determine if manual review needed
  
- `AnalyticsService`: Performance tracking
  - `syncPostMetrics()` - Fetch latest engagement data from X
  - `calculateCategoryPerformance()` - Aggregate stats
  - `identifyOptimalTimes()` - Analyze best posting times

**Entities (TypeORM Database Models)**
TypeORM entities use decorators for schema definition:
```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column('text')
  content: string;
  
  @Column({ type: 'varchar', length: 20 })
  status: PostStatus;
  
  @Column({ type: 'timestamp', nullable: true })
  scheduledTime: Date;
  
  @ManyToOne(() => Category, category => category.posts)
  category: Category;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```
(Other entities: `Category`, `Prompt`, `ScheduleSlot`, `Configuration`, `SourceContent`, `RssFeed`, `PostMetric`)

**Background Jobs (BullMQ Processors)**
BullMQ provides Redis-backed, reliable job processing:

- `AutoFillQueueProcessor`: 
  ```typescript
  @Processor('auto-fill-queue')
  export class AutoFillQueueProcessor {
    @Process()
    async handleAutoFill(job: Job) {
      // Runs every hour via cron
      // Fills next 7 days of empty slots
    }
  }
  ```
  
- `PostExecutorProcessor`: Runs every minute, publishes scheduled posts
- `RssRefreshProcessor`: Runs every hour, fetches new RSS content  
- `MetricsSyncProcessor`: Runs every 6 hours, updates engagement metrics
- `CleanupProcessor`: Runs daily, archives old posts

**Job Scheduling**:
```typescript
// In AppModule or dedicated scheduler
@Cron('0 * * * *') // Every hour
async scheduleAutoFill() {
  await this.autoFillQueue.add('auto-fill', {});
}

@Cron('* * * * *') // Every minute
async schedulePostExecution() {
  await this.postExecutorQueue.add('execute-posts', {});
}
```

### 4.2 Frontend Architecture (React + TypeScript)

#### Component Structure
```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard widgets
│   ├── posts/           # Post management
│   ├── categories/      # Category management
│   ├── prompts/         # Prompt editor
│   ├── schedule/        # Time slot configuration
│   ├── analytics/       # Charts and metrics
│   └── settings/        # Configuration forms
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
├── types/               # TypeScript interfaces
└── styles/              # Global styles
```

#### Key Components
- `AppLayout`: Main layout with sidebar navigation and header
- `Dashboard`: Overview with metrics, upcoming posts, activity feed
- `QueueView`: Drag-and-drop post queue management with calendar
- `PostEditor`: Rich text editor with character count, media upload, thread preview
- `CategoryManager`: CRUD interface for categories with RSS feed config
- `PromptLibrary`: Prompt templates with syntax highlighting and testing
- `ScheduleConfig`: Visual time slot builder with recurring patterns
- `AnalyticsDashboard`: Charts (engagement over time, category performance)
- `SettingsPanel`: API key configuration, system preferences, notifications

## 5. Data Model (Database Schema)

### 5.1 Core Tables

**`categories`**
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    priority INT DEFAULT 1,           -- Higher = more frequent
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**`prompts`**
```sql
CREATE TABLE prompts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,            -- Template with {variables}
    category_id BIGINT,               -- NULL = standalone prompt
    weight INT DEFAULT 1,             -- For weighted random selection
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**`schedule_slots`**
```sql
CREATE TABLE schedule_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    time TIME NOT NULL,               -- e.g., 09:00:00
    days_of_week VARCHAR(20) NOT NULL, -- e.g., "MON,WED,FRI" or "DAILY"
    category_id BIGINT,               -- Optional: force category for this slot
    timezone VARCHAR(50) DEFAULT 'UTC',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

**`posts`**
```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,      -- DRAFT, SCHEDULED, POSTED, FAILED, APPROVED
    scheduled_time TIMESTAMP,
    posted_time TIMESTAMP,
    category_id BIGINT,
    prompt_id BIGINT,                 -- Which prompt generated this
    slot_id BIGINT,                   -- Which slot this fills
    parent_post_id BIGINT,            -- For threads (NULL = first post)
    thread_position INT DEFAULT 0,    -- 0 = single post, 1,2,3... = thread parts
    external_id VARCHAR(50),          -- Twitter/X post ID
    media_url VARCHAR(500),           -- Optional media attachment
    retry_count INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE SET NULL,
    FOREIGN KEY (slot_id) REFERENCES schedule_slots(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE CASCADE
);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_time ON posts(scheduled_time);
CREATE INDEX idx_posts_external_id ON posts(external_id);
```

**`source_content`** (RSS/URL ingested content)
```sql
CREATE TABLE source_content (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500),
    summary TEXT,                     -- LLM-generated summary
    raw_content TEXT,                 -- Original content
    published_date TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_count INT DEFAULT 0,         -- Track how many posts used this
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX idx_source_category ON source_content(category_id);
CREATE INDEX idx_source_fetched ON source_content(fetched_at);
```

**`rss_feeds`**
```sql
CREATE TABLE rss_feeds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    last_fetched TIMESTAMP,
    last_error TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**`post_metrics`** (X.com engagement data)
```sql
CREATE TABLE post_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    likes INT DEFAULT 0,
    retweets INT DEFAULT 0,
    replies INT DEFAULT 0,
    impressions INT DEFAULT 0,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
CREATE INDEX idx_metrics_post ON post_metrics(post_id);
```

**`configurations`** (Key-value store for system settings)
```sql
CREATE TABLE configurations (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT FALSE,  -- Flag for sensitive data
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.2 Configuration Keys (Examples)
- `gemini.api.key`: Gemini API key (encrypted)
- `gemini.model.primary`: Default model (e.g., "gemini-1.5-pro")
- `gemini.model.fallback`: Fallback model
- `twitter.api.key`: X.com API key (encrypted)
- `twitter.api.secret`: X.com API secret (encrypted)
- `twitter.access.token`: OAuth access token (encrypted)
- `twitter.access.secret`: OAuth access token secret (encrypted)
- `system.timezone`: Default timezone (e.g., "America/New_York")
- `autofill.days.ahead`: How many days to auto-fill (default: 7)
- `content.uniqueness.check.last.n`: Check last N posts for uniqueness (default: 100)
- `moderation.enabled`: Enable content moderation (true/false)
- `retry.max.attempts`: Max retry attempts for failed posts (default: 3)

## 6. Configuration Files

### 6.1 Backend Configuration (Node.js + NestJS)

**`package.json`** (Backend dependencies)
```json
{
  "name": "borgpost-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main.js",
    "build": "nest build",
    "test": "jest",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/typeorm": "^10.0.1",
    "@nestjs/config": "^3.1.1",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/bull": "^10.1.0",
    "@nestjs/cache-manager": "^2.2.0",
    "typeorm": "^0.3.19",
    "pg": "^8.11.3",
    "sqlite3": "^5.1.7",
    "bullmq": "^5.1.0",
    "ioredis": "^5.3.2",
    "@google/generative-ai": "^0.2.1",
    "twitter-api-v2": "^1.15.2",
    "axios": "^1.6.5",
    "axios-retry": "^4.0.0",
    "rss-parser": "^3.13.0",
    "cheerio": "^1.0.0-rc.12",
    "@mozilla/readability": "^0.5.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "date-fns": "^3.0.6",
    "nanoid": "^5.0.4",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/testing": "^10.3.0",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

**`.env`** (Environment variables - NOT committed to git)
```bash
# Application
NODE_ENV=development
PORT=3000

# Database - Development (SQLite)
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/borgpost.db

# Database - Production (PostgreSQL)
# DATABASE_TYPE=postgres
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_NAME=borgpost
# DATABASE_USERNAME=borgpost_user
# DATABASE_PASSWORD=secure_password_here

# Redis (for BullMQ job queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_PRIMARY=gemini-1.5-pro
GEMINI_MODEL_FALLBACK=gemini-1.5-flash

# X.com/Twitter
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_token_secret

# Optional
OPENAI_API_KEY=optional_for_fallback

# System Settings
TIMEZONE=UTC
AUTO_FILL_DAYS_AHEAD=7
UNIQUENESS_CHECK_LAST_N=100
MODERATION_ENABLED=false
RETRY_MAX_ATTEMPTS=3
```

**`tsconfig.json`** (TypeScript configuration)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`ormconfig.ts`** (TypeORM configuration)
```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export default new DataSource({
  type: process.env.DATABASE_TYPE as any,
  database: process.env.DATABASE_PATH || process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
});
```

### 6.2 Frontend Configuration

**`vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

**`package.json`** (Key dependencies)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.15.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

## 7. API Endpoints (Complete Specification)

### 7.1 Posts Management

**List Posts**
```
GET /api/posts?status=SCHEDULED&category_id=1&limit=50&offset=0
Response: {
  "posts": [
    {
      "id": 1,
      "content": "...",
      "status": "SCHEDULED",
      "scheduled_time": "2025-11-24T09:00:00Z",
      "category": {...},
      "prompt": {...},
      "thread_position": 0,
      "media_url": null
    }
  ],
  "total": 150
}
```

**Create Manual Post**
```
POST /api/posts
Body: {
  "content": "Custom post content",
  "scheduled_time": "2025-11-24T15:00:00Z",
  "category_id": 2,
  "media_url": "https://..."
}
Response: Created post object
```

**Update Post**
```
PUT /api/posts/{id}
Body: { "content": "Updated content", "scheduled_time": "..." }
```

**Delete Post**
```
DELETE /api/posts/{id}
Response: 204 No Content
```

**Regenerate Post**
```
POST /api/posts/{id}/regenerate
Response: Updated post with new content
```

**Approve Post** (for moderation workflow)
```
POST /api/posts/{id}/approve
Response: Post status changed to SCHEDULED
```

### 7.2 Categories

```
GET /api/categories
POST /api/categories
  Body: { "name": "Tech News", "description": "...", "priority": 2 }
PUT /api/categories/{id}
DELETE /api/categories/{id}
GET /api/categories/{id}/feeds  # List RSS feeds for category
POST /api/categories/{id}/feeds
  Body: { "url": "https://techcrunch.com/feed/" }
```

### 7.3 Prompts

```
GET /api/prompts?category_id=1
POST /api/prompts
  Body: { "name": "Tech Tweet", "content": "...", "category_id": 1, "weight": 2 }
PUT /api/prompts/{id}
DELETE /api/prompts/{id}
POST /api/prompts/test
  Body: { "prompt_id": 5, "test_context": {...} }
  Response: Generated sample post
```

### 7.4 Schedule Slots

```
GET /api/slots
POST /api/slots
  Body: { "time": "09:00:00", "days_of_week": "MON,WED,FRI", "category_id": 1 }
PUT /api/slots/{id}
DELETE /api/slots/{id}
POST /api/slots/auto-fill  # Manually trigger auto-fill job
```

### 7.5 Configuration

```
GET /api/config
  Response: { "gemini.model.primary": "gemini-1.5-pro", ... }
PUT /api/config
  Body: { "key": "gemini.model.primary", "value": "gemini-1.5-flash" }
POST /api/config/test-gemini    # Test Gemini API key
POST /api/config/test-twitter   # Test X.com credentials
```

### 7.6 Analytics

```
GET /api/analytics/overview
  Response: {
    "total_posts": 1500,
    "posts_this_week": 42,
    "avg_engagement_rate": 3.5,
    "upcoming_posts": 28,
    "failed_posts": 2
  }
  
GET /api/analytics/categories
  Response: [
    { "category": "Tech", "posts": 500, "avg_likes": 45, "avg_retweets": 12 },
    ...
  ]
  
GET /api/analytics/trends?period=30days
  Response: {
    "daily_engagement": [...],
    "optimal_times": ["09:00", "14:00", "19:00"]
  }
```

### 7.7 Content Sources

```
GET /api/sources?category_id=1&limit=20
  Response: List of ingested articles/RSS items
POST /api/sources/ingest
  Body: { "url": "https://article.com", "category_id": 1 }
  Response: Scraped and summarized content
```

## 8. Security & Best Practices

### 8.1 Secret Management
- **Environment Variables**: Use `.env` file for all sensitive data (API keys, tokens)
- **Never Commit Secrets**: `.gitignore` must include `.env`, database files, logs
- **Database Encryption**: Encrypt sensitive config values (API keys) in database
- **Production**: Use cloud secret managers (AWS Secrets Manager, HashiCorp Vault) for deployment

### 8.2 Input Validation & Sanitization
- **Backend Validation**: Use `@Valid` and `@Validated` on all request DTOs
- **Prompt Injection Protection**: Sanitize user-provided prompts before LLM calls
- **URL Validation**: Validate and sanitize RSS feed URLs and article URLs
- **SQL Injection**: JPA/Hibernate with parameterized queries (built-in protection)
- **XSS Protection**: Frontend sanitizes all user-generated content display

### 8.3 API Rate Limiting & Resilience
- **Gemini Rate Limits**: 
  - Implement exponential backoff (Retry-After headers)
  - Cache LLM responses when appropriate
  - Fallback to alternate models on rate limit
- **X.com Rate Limits**:
  - Respect Twitter API v2 rate limits (50 posts per 24h, 300 per 3h)
  - Queue posts with delay if limit reached
  - Track rate limit status in database
- **External API Resilience**: Circuit breaker pattern for external APIs (Resilience4j)

### 8.4 Authentication & Authorization (Future Enhancement)
- **Phase 1**: Single-user app (no auth needed)
- **Phase 2**: Multi-user support with Spring Security
  - OAuth2 login (Google, GitHub)
  - Role-based access control (Admin, Editor, Viewer)
  - Per-user X.com accounts

### 8.5 Data Security
- **HTTPS Only**: Force HTTPS in production (nginx SSL termination)
- **CORS**: Configure proper CORS policies for frontend-backend communication
- **Database Backups**: Automated daily backups with retention policy
- **Audit Logs**: Track all configuration changes and post creations

### 8.6 Code Quality & Best Practices
- **Git Ignore**: `.gitignore` must include:
  ```
  # Environment
  .env
  .env.local
  .env.*.local
  
  # Dependencies
  node_modules/
  
  # Build outputs
  dist/
  build/
  
  # Logs
  logs/
  *.log
  npm-debug.log*
  pnpm-debug.log*
  
  # Database
  data/
  *.db
  *.sqlite
  
  # IDE
  .vscode/
  .idea/
  *.swp
  *.swo
  
  # OS
  .DS_Store
  Thumbs.db
  ```
- **Dependency Security**: 
  - Regular updates: `npm outdated` and `npm audit`
  - Automated security checks: Dependabot or Snyk
- **Static Analysis**: 
  - ESLint for code quality and consistency
  - Prettier for code formatting
  - TypeScript strict mode for type safety
- **Error Handling**: 
  - Global exception filters in NestJS (`@Catch()`)
  - Never expose internal errors or stack traces to frontend
  - Use custom error classes for different error types
- **Logging**: 
  - Winston for structured logging
  - Appropriate log levels (ERROR, WARN, INFO, DEBUG)
  - Never log API keys, tokens, or sensitive data
  - JSON format in production for easy parsing

## 9. Implementation Plan (Detailed Step-by-Step)

### Phase 1: Foundation (Week 1-2)

**Step 1: Project Setup**
- [ ] Initialize NestJS project: `nest new borgpost-backend`
- [ ] Setup TypeScript configuration (`tsconfig.json`)
- [ ] Install core dependencies (`@nestjs/typeorm`, `typeorm`, `pg`, `sqlite3`)
- [ ] Configure `.env` file with environment variables
- [ ] Setup project structure (modules, services, controllers)
- [ ] Create `.gitignore` and initialize Git repository
- [ ] Install Redis for job queues (Docker or local)

**Step 2: Database & Core Entities**
- [ ] Setup TypeORM configuration (`ormconfig.ts`)
- [ ] Create TypeORM entities with decorators:
  - `Category.entity.ts`
  - `Prompt.entity.ts`
  - `ScheduleSlot.entity.ts`
  - `Post.entity.ts`
  - `Configuration.entity.ts`
- [ ] Generate initial migration: `npm run migration:generate`
- [ ] Run migrations: `npm run migration:run`
- [ ] Create database seeder for sample data (categories, prompts)
- [ ] Test database connection

**Step 3: Basic REST API**
- [ ] Generate modules: `nest g module posts categories prompts`
- [ ] Generate controllers: `nest g controller posts categories prompts`
- [ ] Generate services: `nest g service posts categories prompts`
- [ ] Implement CRUD operations in services (using TypeORM repositories)
- [ ] Create DTOs with `class-validator` decorators
- [ ] Add validation pipes globally in `main.ts`
- [ ] Test endpoints with Postman/curl or Thunder Client

### Phase 2: Frontend Foundation (Week 2-3)

**Step 4: React Setup**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (React Router, TanStack Query, Shadcn/UI, Tailwind)
- [ ] Setup Shadcn/UI components (install CLI and configure)
- [ ] Configure Axios API client with interceptors
- [ ] Create basic layout (AppLayout, Sidebar, Header)

**Step 5: Core UI Components**
- [ ] Create `Dashboard` page (placeholder widgets)
- [ ] Create `CategoryManager` component with CRUD forms
- [ ] Create `PromptLibrary` component with CRUD forms
- [ ] Implement React Query hooks for API calls
- [ ] Add loading states and error handling

### Phase 3: Content Generation (Week 3-4)

**Step 6: LLM Integration**
- [ ] Install dependencies: `npm install @google/generative-ai axios axios-retry`
- [ ] Create LLM service module: `nest g module services/llm`
- [ ] Create `LlmService` with Gemini API client:
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai';
  ```
- [ ] Implement prompt template variable replacement (e.g., `{date}`, `{news_summary}`)
- [ ] Create `ContentGeneratorService` with generation orchestration
- [ ] Add uniqueness validation (compare with last N posts)
- [ ] Implement rate limit handling and exponential backoff
- [ ] Add fallback model switching (Pro → Flash)
- [ ] Test generation with sample prompts

**Step 7: RSS/URL Ingestion**
- [ ] Install dependencies: `npm install rss-parser cheerio @mozilla/readability`
- [ ] Create ingestion service: `nest g service services/ingestion`
- [ ] Implement RSS feed parsing with `rss-parser`
- [ ] Implement HTML article scraping with `cheerio` and `readability`
- [ ] Create `SourceContent` and `RssFeed` entities
- [ ] Add RSS feed management endpoints
- [ ] Create cron job for hourly RSS refresh using `@nestjs/schedule`
- [ ] Test RSS fetching and content extraction

### Phase 4: Scheduling & Queue (Week 4-5)

**Step 8: BullMQ Job Queue Setup**
- [ ] Install dependencies: `npm install @nestjs/bull bullmq ioredis`
- [ ] Configure BullMQ with Redis connection
- [ ] Create `ScheduleSlot` module and management endpoints
- [ ] Implement slot pattern parsing (cron-like patterns, day of week)
- [ ] Create queue definitions in app module

**Step 9: Auto-Fill Queue Logic**
- [ ] Create `AutoFillQueueProcessor` with `@Processor` decorator
- [ ] Add cron job to trigger auto-fill every hour
- [ ] Implement category selection strategy (priority-based rotation)
- [ ] Implement prompt selection strategy (weighted random)
- [ ] Generate posts to fill next 7 days of empty slots
- [ ] Add manual trigger endpoint: `POST /api/slots/auto-fill`
- [ ] Test job execution with BullMQ dashboard (optional: Bull Board)

**Step 10: Queue Management UI**
- [ ] Create `QueueView` component with calendar/list view
- [ ] Install drag-and-drop library (dnd-kit)
- [ ] Implement drag-and-drop slot reordering
- [ ] Add post editing modal with character counter
- [ ] Add regenerate button (calls backend API)
- [ ] Show slot schedule visually with timeline component
- [ ] Add filters (by status, by category)

### Phase 5: X.com Integration (Week 5-6)

**Step 11: Twitter API Setup**
- [ ] Install dependency: `npm install twitter-api-v2`
- [ ] Create `TwitterService` with OAuth 1.0a configuration
- [ ] Initialize TwitterApi client:
  ```typescript
  import { TwitterApi } from 'twitter-api-v2';
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
  ```
- [ ] Implement single tweet posting method
- [ ] Add connection test endpoint
- [ ] Test with sample tweets (use test account)

**Step 12: Threading & Media Support**
- [ ] Implement thread splitting logic (280 char limit, account for URLs)
- [ ] Add numbered thread format (1/n, 2/n) appended to content
- [ ] Implement media upload to Twitter (v2.uploadMedia)
- [ ] Handle reply-to for thread continuity
- [ ] Add thread preview in UI before posting
- [ ] Test thread posting with long content (500+ chars)

**Step 13: Post Execution Job**
- [ ] Create `PostExecutorProcessor` with BullMQ
- [ ] Add cron job to run every minute: `@Cron('* * * * *')`
- [ ] Query posts with `status='SCHEDULED'` and `scheduledTime <= now`
- [ ] Post to Twitter and update `status` to `POSTED`
- [ ] Store Twitter post ID in `externalId` field
- [ ] Implement retry logic with exponential backoff
- [ ] Handle rate limiting (track limits in database)
- [ ] Add comprehensive error handling and logging

### Phase 6: Analytics & Polish (Week 6-7)

**Step 14: Metrics Collection**
- [ ] Create `post_metrics` table and entity
- [ ] Implement Twitter metrics fetching in `TwitterService`
- [ ] Create `MetricsSyncJob` (runs every 6 hours)
- [ ] Create `AnalyticsService` with aggregation logic
- [ ] Implement analytics endpoints

**Step 15: Analytics UI**
- [ ] Install charting library (Recharts or Chart.js)
- [ ] Create `AnalyticsDashboard` with charts
- [ ] Show engagement trends over time
- [ ] Show category performance comparison
- [ ] Display optimal posting times

**Step 16: Settings & Configuration**
- [ ] Create settings page with API key inputs
- [ ] Implement encrypted storage for API keys
- [ ] Add connection test buttons (Gemini, Twitter)
- [ ] Create system preferences UI
- [ ] Add backup/export functionality

**Step 17: Error Handling & Logging**
- [ ] Configure Logback with rolling file appenders
- [ ] Add global exception handler (@ControllerAdvice)
- [ ] Implement structured error responses
- [ ] Add health check endpoints (Actuator)
- [ ] Create error notification system (optional: email alerts)

### Phase 7: Deployment (Week 7-8)

**Step 18: Docker Setup**
- [ ] Create `Dockerfile` for NestJS backend (multi-stage build):
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  
  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  CMD ["node", "dist/main.js"]
  ```
- [ ] Create `Dockerfile` for React frontend (nginx serving)
- [ ] Create `docker-compose.yml` with PostgreSQL + Redis
- [ ] Test local Docker deployment with `docker-compose up`

**Step 19: Production Database**
- [ ] Switch from SQLite to PostgreSQL in `.env`
- [ ] Update TypeORM config for PostgreSQL connection
- [ ] Run migrations on production database
- [ ] Test database migration from SQLite to PostgreSQL
- [ ] Setup automated database backups (pg_dump cron job or platform feature)

**Step 20: Deployment & Monitoring**
- [ ] Choose deployment platform (Railway recommended for simplicity)
- [ ] Railway deployment steps:
  - [ ] Connect GitHub repository
  - [ ] Add PostgreSQL service
  - [ ] Add Redis service
  - [ ] Configure environment variables
  - [ ] Deploy backend and frontend
- [ ] Alternative VPS deployment with PM2:
  - [ ] Install PM2 globally: `npm install -g pm2`
  - [ ] Create `ecosystem.config.js` for PM2
  - [ ] Start app: `pm2 start ecosystem.config.js`
  - [ ] Setup PM2 startup script: `pm2 startup`
- [ ] Configure custom domain and SSL certificate
- [ ] Setup reverse proxy with nginx (if VPS)
- [ ] Configure Winston logging to files
- [ ] Setup monitoring with PM2 or platform dashboards
- [ ] Create health check endpoint: `GET /health`
- [ ] Document deployment process in README

## 10. Testing Strategy

### 10.1 Backend Testing (Jest + NestJS Testing)
- **Unit Tests**: Service layer logic with Jest
  ```typescript
  describe('PostsService', () => {
    let service: PostsService;
    
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [PostsService],
      }).compile();
      service = module.get<PostsService>(PostsService);
    });
    
    it('should create a post', async () => {
      // Test implementation
    });
  });
  ```
- **Integration Tests**: End-to-end with in-memory database
- **API Tests**: Controller endpoints with supertest
- **External API Mocking**: Mock Gemini and Twitter APIs using Jest mocks
- **Coverage Goal**: 70%+ code coverage (run with `npm test -- --coverage`)

### 10.2 Frontend Testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright or Cypress (optional)
- **Type Safety**: TypeScript strict mode

### 10.3 Manual Testing Checklist
- [ ] End-to-end user journey (create category → add prompt → create slot → auto-fill → post)
- [ ] Test all CRUD operations
- [ ] Test error scenarios (API failures, rate limits)
- [ ] Test threading for long posts
- [ ] Verify RSS ingestion and content summarization
- [ ] Check analytics accuracy

## 11. Maintenance & Operations

### 11.1 Logging Strategy (Winston)
- **Location**: `logs/borgpost-{date}.log` (daily rotation, keep 30 days)
- **Configuration**:
  ```typescript
  import * as winston from 'winston';
  import 'winston-daily-rotate-file';
  
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'logs/borgpost-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
      }),
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });
  ```
- **Levels**:
  - `error`: System failures, API errors, uncaught exceptions
  - `warn`: Rate limits reached, retries, deprecated usage
  - `info`: Post published, job executed, important state changes
  - `debug`: Detailed flow for troubleshooting
- **Never Log**: API keys, tokens, passwords, sensitive user data

### 11.2 Backup & Recovery
- **Database Backups**: Automated daily backup (pg_dump or cloud provider)
- **Configuration Export**: Endpoint to export all configs as JSON
- **Post History**: Archive old posts (>6 months) to separate table
- **Disaster Recovery**: Document restoration process

### 11.3 Monitoring & Alerts
- **Health Checks**: Custom endpoint `GET /health`
  ```typescript
  @Controller('health')
  export class HealthController {
    @Get()
    async check() {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        services: {
          gemini: await this.checkGemini(),
          twitter: await this.checkTwitter(),
        }
      };
    }
  }
  ```
- **Metrics**: 
  - PM2 metrics (CPU, memory, restart count)
  - Custom metrics endpoint `GET /metrics` (post count, success rate, queue size)
  - BullMQ dashboard (optional: Bull Board UI)
- **Alerting**: Email/Slack/Discord webhooks for:
  - Post publishing failures (3+ consecutive failures)
  - API key expiration or invalid credentials
  - Database connection lost
  - Redis connection lost
  - High error rate (>10% in last hour)
- **Dashboard**: 
  - PM2 web dashboard
  - Optional: Grafana + Prometheus for detailed metrics
  - BullMQ queue monitoring

### 11.4 Routine Maintenance
- **Weekly**:
  - Review error logs
  - Check post success rate
  - Monitor API rate limit usage
- **Monthly**:
  - Update dependencies (security patches)
  - Review and optimize database queries
  - Analyze category performance
  - Clean up unused prompts
- **Quarterly**:
  - Database optimization (VACUUM, ANALYZE)
  - Review and update prompts based on performance
  - Audit and rotate API keys

### 11.5 Troubleshooting Guide
| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Posts not publishing | Check `logs/borgpost.log` for errors | Verify X.com API credentials, check rate limits |
| Content generation failing | Check Gemini API key validity | Test with `/api/config/test-gemini` |
| RSS feeds not updating | Check `rss_feeds` table `last_error` column | Verify RSS URL is valid and accessible |
| Queue not auto-filling | Check Quartz job status | Manually trigger `/api/slots/auto-fill` |
| High memory usage | Check Actuator metrics | Reduce cache size or restart application |

## 12. Future Enhancements

### 12.1 Near-Term (3-6 months)
- Multi-user support with authentication
- Post scheduling preview/calendar view
- A/B testing for prompts (track which prompts perform best)
- Image generation integration (DALL-E, Stable Diffusion)
- More social platforms (LinkedIn, Bluesky, Mastodon)

### 12.2 Long-Term (6-12 months)
- AI-powered optimal posting time recommendations
- Automatic hashtag suggestions
- Competitor analysis and trend detection
- Mobile app (React Native)
- Advanced analytics (sentiment analysis, audience growth prediction)
- Content calendar with team collaboration
- Integration with content management systems (WordPress, Ghost)
