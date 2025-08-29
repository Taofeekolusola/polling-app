# Polling App Architecture

## 🏗️ System Overview

This is a full-stack polling application built with Next.js 15, Supabase, and deployed on Vercel. The app features real-time voting, QR code sharing, and user authentication.

## 📁 Project Structure

```
polling-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── signin/page.tsx       # Sign in page
│   │   ├── signup/page.tsx       # Sign up page
│   │   └── layout.tsx           # Auth layout
│   ├── (polls)/                  # Poll routes
│   │   ├── page.tsx             # Polls list
│   │   ├── create/page.tsx      # Create poll
│   │   ├── [id]/page.tsx        # Poll detail
│   │   └── [id]/vote/page.tsx   # Voting interface
│   ├── api/                      # API routes
│   │   ├── auth/                # Auth endpoints
│   │   ├── polls/               # Poll endpoints
│   │   └── webhooks/            # Webhook handlers
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   ├── polls/                   # Poll-specific components
│   └── shared/                  # Shared components
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase clients
│   ├── auth/                   # Auth utilities
│   ├── polls/                  # Poll business logic
│   └── qr/                     # QR code utilities
├── types/                       # TypeScript types
├── hooks/                       # Custom React hooks
└── middleware.ts               # Auth middleware
```

## 🗄️ Database Schema

### Tables

1. **profiles** - User profiles (extends Supabase auth.users)
2. **polls** - Poll metadata and settings
3. **poll_options** - Individual poll options
4. **votes** - User votes with anti-fraud measures
5. **qr_codes** - QR code mappings for polls

### Key Features

- **Real-time subscriptions** for live vote updates
- **Row Level Security (RLS)** for data protection
- **Anonymous voting** with fingerprint tracking
- **Multiple vote prevention** with unique constraints

## 🔐 Security Architecture

### Authentication
- Supabase Auth with email/password
- Session management with SSR support
- Protected routes via middleware
- Row Level Security policies

### Voting Security
- IP address tracking for anonymous votes
- Browser fingerprinting for duplicate prevention
- Rate limiting on vote endpoints
- Unique constraints per poll/user combination

## 📱 QR Code System

### Generation
- Server-side QR code generation using `qrcode` library
- Unique codes for each poll
- Support for both view and vote URLs

### Scanning
- Client-side QR code scanning with `react-qr-scanner`
- URL parsing and validation
- Direct navigation to poll pages

## 🚀 Deployment Architecture

### Vercel
- Edge functions for API routes
- Automatic deployments from Git
- Global CDN for static assets
- Analytics and monitoring

### Supabase
- PostgreSQL database
- Real-time subscriptions
- Edge functions for complex operations
- Built-in authentication

## 🔄 Real-time Features

### Live Updates
- Supabase real-time subscriptions
- WebSocket connections for vote updates
- Optimistic UI updates
- Conflict resolution for concurrent votes

### Performance
- Server-side rendering for SEO
- Client-side hydration for interactivity
- Edge caching for static content
- Database connection pooling

## 🛠️ Development Tools

### Core Libraries
- **Next.js 15** - React framework with App Router
- **Supabase** - Backend as a Service
- **shadcn/ui** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Additional Tools
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date utilities
- **qrcode** - QR code generation
- **react-qr-code** - QR code display
- **react-qr-scanner** - QR code scanning

## 📊 Monitoring & Analytics

### Vercel Analytics
- Page view tracking
- Performance monitoring
- Error tracking
- User behavior analysis

### Supabase Monitoring
- Database performance
- Query optimization
- Real-time connection monitoring
- Error logging

## 🔧 Setup Instructions

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Configure RLS policies

3. **Environment variables**
   ```bash
   cp env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🚀 Production Deployment

1. **Vercel Setup**
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy automatically

2. **Supabase Production**
   - Enable production database
   - Configure custom domains
   - Set up monitoring

3. **Domain Configuration**
   - Configure custom domain in Vercel
   - Update Supabase redirect URLs
   - Set up SSL certificates

## 🔮 Future Enhancements

- **Advanced Analytics** - Poll insights and trends
- **Social Features** - Comments and sharing
- **Mobile App** - React Native companion
- **API Access** - Public API for integrations
- **Advanced Security** - Two-factor authentication
- **Internationalization** - Multi-language support

