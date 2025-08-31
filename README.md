# Property managers Reviews Dashboards

A modern, intuitive dashboard system for managing and displaying guest reviews across Flex Living properties. This application integrates with the Hostaway API to fetch review data, provides managers with tools to curate reviews, and displays approved reviews on property pages.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd flex-living-reviews-dashboard
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies (if separate)
   cd client && npm install && cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Hostaway API Configuration
   HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
   HOSTAWAY_ACCOUNT_ID=61148
   HOSTAWAY_BASE_URL=https://api.hostaway.com/v1

   # Google Places API (optional)
   GOOGLE_PLACES_API_KEY=your_google_api_key_here

   # Database
   DATABASE_URL=sqlite:./reviews.db

   # Application
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build && npm start
   ```

6. **Access the application**
   - Manager Dashboard: `http://localhost:3000/dashboard`
   - Property Pages: `http://localhost:3000/properties/:id`
   - API Endpoint: `http://localhost:3000/api/reviews/hostaway`

## Tech Stack

### Backend

- **Node.js** with **Express.js** - API server and routing
- **TypeScript** - Type safety and better developer experience
- **SQLite** - Local database for review storage and curation state
- **Prisma** - Database ORM and migrations
- **Axios** - HTTP client for external API calls

### Frontend

- **React 18** with **TypeScript** - Component-based UI
- **Next.js 14** - Full-stack React framework with SSR/SSG
- **Tailwind CSS** - Utility-first CSS framework
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Form handling and validation
- **Lucide React** - Icon library

### Development Tools

- **ESLint** + **Prettier** - Code formatting and linting
- **Husky** - Git hooks for code quality
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing

## Architecture & Design Decisions

### 1. API-First Approach

Following the assessment requirements, we implemented a robust API layer that serves as the backbone:

- **GET `/api/reviews/hostaway`** - Fetches and normalizes review data
- **POST `/api/reviews/approve`** - Manager approval workflow
- **GET `/api/reviews/public/:propertyId`** - Public-facing approved reviews

### 2. Data Normalization Strategy

Raw Hostaway API responses are transformed into a consistent format:

```typescript
interface NormalizedReview {
  id: string;
  propertyId: string;
  guestName: string;
  rating: number;
  comment: string;
  categories: ReviewCategory[];
  submittedAt: Date;
  source: "hostaway" | "google" | "airbnb";
  status: "pending" | "approved" | "rejected";
  isPubliclyVisible: boolean;
}
```

### 3. Manager Dashboard Features

The dashboard provides comprehensive review management capabilities:

- **Property Performance Overview** - Aggregated ratings and trends
- **Multi-level Filtering** - By rating, date range, property, channel, category
- **Bulk Actions** - Approve/reject multiple reviews efficiently
- **Trend Analysis** - Visual charts showing performance over time
- **Issue Detection** - Automated highlighting of recurring problems

### 4. Curation Workflow

Implemented a three-state review system:

- **Pending** - Newly fetched reviews awaiting manager review
- **Approved** - Reviews selected for public display
- **Rejected** - Reviews hidden from public view (with reasoning)

### 5. Public Display Integration

Reviews are seamlessly integrated into existing property pages:

- **Responsive Design** - Matches Flex Living's visual identity
- **Performance Optimized** - Only approved reviews are fetched
- **SEO Friendly** - Server-side rendering for better search visibility

## API Behaviors

### Hostaway Integration

```typescript
// GET /api/reviews/hostaway
{
  "success": true,
  "data": {
    "reviews": NormalizedReview[],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "lastSync": "2025-08-31T10:30:00Z"
}
```

**Key Behaviors:**

- **Automatic Polling** - Syncs new reviews every 30 minutes
- **Duplicate Prevention** - Uses review ID and hash comparison
- **Error Resilience** - Graceful handling of API downtime
- **Rate Limiting** - Respects Hostaway API limits (100 requests/hour)

### Google Reviews Integration

```typescript
// GET /api/reviews/google/:placeId
{
  "success": true,
  "data": {
    "reviews": GoogleReview[],
    "placeDetails": PlaceDetails,
    "averageRating": 4.6
  }
}
```

**Implementation Notes:**

- **Places API Integration** - Fetches reviews using Place ID
- **Review Limitations** - Google provides only 5 most recent reviews
- **Refresh Strategy** - Updates every 24 hours due to API constraints
- **Fallback Handling** - Continues operation if Google integration fails

## Key Features

### Manager Dashboard

- Real-time property performance metrics
- Advanced filtering and search capabilities
- Bulk review approval/rejection
- Trend analysis with interactive charts
- Automated issue flagging for common problems

### Review Display

- Clean, modern design consistent with Flex Living branding
- Mobile-responsive layout
- Loading states and error handling
- Pagination for properties with many reviews

### Data Management

- Automated review synchronization
- Intelligent duplicate detection
- Comprehensive audit trail
- Export functionality for reporting

## Testing Strategy

Following the test-first approach from the development methodology:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**Test Coverage:**

- API endpoint functionality
- Review normalization logic
- Manager dashboard interactions
- Public review display
- Error handling scenarios

## 🚀 Deployment

### Production Setup

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- Hostaway API credentials
- Database connection string
- Google Places API key (optional)

## 📈 Future Enhancements

- **Multi-channel Integration** - Airbnb, Booking.com APIs
- **Advanced Analytics** - Sentiment analysis, keyword extraction
- **Mobile App** - React Native companion app for managers
- **Automation Rules** - Auto-approve reviews meeting specific criteria
- **Integration APIs** - Webhook support for external systems
