# ImpactBoard - Event Management Platform

A modern, full-stack event management platform with coaching features, built with React, Express, and Supabase. Features a clean white + green theme with smooth animations and comprehensive admin capabilities.

## 🚀 Features

### Core Functionality
- **Event Management**: Create, edit, delete events with image uploads
- **Coach Profiles**: Manage coach profiles with expertise areas and certifications
- **Booking System**: Users can book events with double-booking prevention
- **Admin Dashboard**: Complete CRUD operations for events and coaches
- **User Profiles**: Manage user information and preferences
- **Excel Reporting**: Automated booking reports with daily/weekly summaries

### User Experience
- **Browse Without Login**: Users can explore events and coaches without authentication
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Smooth Animations**: Framer Motion powered page transitions and card animations
- **Modern UI**: Clean white + green theme with gradients and shadows
- **Toast Notifications**: Real-time feedback for all user actions

### Technical Features
- **Image Optimization**: Automatic resizing and compression to ~1MB
- **Form Validation**: Comprehensive frontend and backend validation
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet.js security headers and CORS protection
- **Loose Coupling**: Supabase abstracted behind service layer for easy replacement

## 🏗️ Architecture

```
eventful-pathways/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API client
│   └── index.css          # Global styles
├── backend/               # Express.js API server
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic layer
│   ├── middleware/        # Authentication & validation
│   └── server.js          # Express server entry point
└── supabase/              # Database migrations
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Shadcn/ui** for UI components
- **React Router DOM** for routing
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express.js
- **PostgreSQL** via Supabase
- **Sharp** for image optimization
- **ExcelJS** for report generation
- **Helmet.js** for security
- **Rate limiting** for API protection

### Authentication & Database
- **Supabase Auth** for user authentication
- **Supabase Storage** for file uploads
- **PostgreSQL** for data persistence
- **Custom users table** linked to Supabase auth

## 📋 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/me` - Get current user

### Events
- `GET /events` - List all events (with filters)
- `GET /events/:id` - Get event details
- `POST /events` - Create event (admin only)
- `PUT /events/:id` - Update event (admin only)
- `DELETE /events/:id` - Delete event (admin only)

### Coaches
- `GET /coaches` - List all coaches
- `GET /coaches/:id` - Get coach details
- `POST /coaches` - Create coach (admin only)
- `PUT /coaches/:id` - Update coach (admin only)
- `DELETE /coaches/:id` - Delete coach (admin only)

### Bookings
- `GET /bookings/my-bookings` - Get user's bookings
- `POST /bookings` - Create booking
- `DELETE /bookings/:id` - Cancel booking

### Users
- `GET /users` - List all users (admin only)
- `PUT /users/profile` - Update user profile
- `GET /users/admin/bookings-report` - Download Excel report (admin only)

## 🔧 Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# Frontend Supabase (same as above)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin Configuration
ADMIN_EMAIL=admin@impactboard.com
ADMIN_PASSWORD=impactboard1212

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project with PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventful-pathways
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## 🏗️ Build & Deployment

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client:root  # Start frontend only
```

### Production Build
```bash
npm run build        # Build frontend
npm start           # Start production server
```

### Deployment Checklist

1. **Environment Setup**
   - [ ] Configure production environment variables
   - [ ] Set up PostgreSQL database
   - [ ] Configure Supabase project
   - [ ] Set up file storage bucket

2. **Security**
   - [ ] Enable HTTPS
   - [ ] Configure CORS for production domain
   - [ ] Set up rate limiting
   - [ ] Enable security headers

3. **Performance**
   - [ ] Enable compression
   - [ ] Configure caching headers
   - [ ] Optimize images
   - [ ] Set up CDN for static assets

4. **Monitoring**
   - [ ] Set up error logging
   - [ ] Configure health checks
   - [ ] Set up uptime monitoring

## 👨‍💼 Admin Usage

### Admin Login
- **Email**: admin@impactboard.com
- **Password**: impactboard1212

### Admin Capabilities

1. **Event Management**
   - Create new events with images
   - Edit existing events
   - Delete events
   - Mark events as sold out
   - View all bookings

2. **Coach Management**
   - Add new coaches (max 30)
   - Edit coach profiles
   - Delete coaches
   - Manage expertise areas and certifications

3. **Reports**
   - Download Excel reports with booking summaries
   - View daily/weekly booking statistics
   - Track user engagement

4. **User Management**
   - View all registered users
   - Monitor user activity
   - Access user profiles

### Excel Report Features
- **Booking Details**: User info, event details, booking timestamps
- **Daily Summaries**: Bookings and cancellations per day
- **Weekly Summaries**: Aggregated weekly statistics
- **Admin Download**: Access via `/users/admin/bookings-report`

## 🔒 Security Features

- **Authentication**: JWT-based auth with Supabase
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive form validation
- **Rate Limiting**: API protection against abuse
- **CORS**: Configured for production domains
- **Helmet.js**: Security headers
- **SQL Injection Protection**: Parameterized queries

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Modern Cards**: Gradient backgrounds with shadows
- **Toast Notifications**: Real-time user feedback
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages

## 🧪 Testing

```bash
# Run backend tests (if implemented)
npm test

# Run frontend tests (if implemented)
npm run test:frontend
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using React, Express, and Supabase**
# event-main
