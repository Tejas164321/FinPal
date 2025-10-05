# 💰 FinPal — AI-Powered Personal Finance Tracker

[![Made with Vite](https://img.shields.io/badge/Made%20with-Vite-blueviolet?style=flat-square&logo=vite)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)]()
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

> FinPal helps Indian users manage their digital money smartly 💸 — powered by AI insights, UPI transaction analysis, and a beautiful dark glassmorphism dashboard.

![FinPal Dashboard Preview](./preview.png)

## 🚀 Features

### ✨ Core Features

- **Smart UPI Transaction Analysis**: Upload and parse transaction history from GPay, PhonePe, and bank statements
- **AI-Powered Categorization**: Hybrid system using rule-based classification + Google Gemini AI fallback
- **Real-time Dashboard**: Visual financial overview with income, expenses, and savings tracking
- **Budget Management**: Set spending limits with real-time alerts and progress tracking
- **Investment Simulator**: Calculate SIP and FD returns with compound interest formulas
- **AI Insights**: Personalized spending analysis and budget recommendations
- **Mobile-First Design**: Fully responsive with glassmorphism UI and dark theme

### 🎨 Design System

- **Dark Theme**: Default dark mode with purple accent colors
- **Glassmorphism UI**: Beautiful frosted glass effects with backdrop blur
- **Responsive Layout**: Mobile-first design with collapsible sidebar navigation
- **Smooth Animations**: Framer Motion powered transitions and hover effects
- **Modern Typography**: Clean, readable fonts with proper contrast ratios

### 📱 Pages Implemented

#### 1. Homepage (`/`)

- Hero section with compelling value proposition
- Feature highlights with animated cards
- Benefits section with statistics
- User testimonials
- Call-to-action sections
- Smooth scroll navigation

#### 2. Dashboard (`/dashboard`)

- Financial overview cards (Income, Expenses, Savings, Budget Status)
- Interactive charts using Recharts:
  - Monthly trends (Area chart)
  - Category breakdown (Pie chart)
- Budget progress bars with alerts
- Recent transactions with AI/Rule source indicators
- Mobile-responsive layout

#### 3. Placeholder Pages (Ready for Development)

- **Transactions** (`/transactions`): File upload and transaction management
- **Budgets** (`/budgets`): Budget creation and monitoring
- **AI Insights** (`/ai-insights`): Gemini-powered analysis and chat
- **Investments** (`/investments`): SIP calculators and portfolio comparison

## 🛠 Technical Stack (Detailed Breakdown)

### Frontend Architecture
The frontend is built as a React-based single-page application with modern tooling and a comprehensive UI component library.

**Core Framework & Language:**
- **React 18** with TypeScript: Provides type-safe component development with the latest React features like concurrent rendering and automatic batching
- **Vite**: Modern build tool offering fast development server, instant hot module replacement (HMR), and optimized production builds

**Routing & State Management:**
- **React Router 6**: Client-side routing for navigation between different application pages
- **@tanstack/react-query**: Powerful data fetching and caching library for server state management, API calls, and background updates

**Styling & UI Components:**
- **TailwindCSS 3**: Utility-first CSS framework with custom theme configuration including FinPal's brand colors (purple gradients) and glassmorphism effects
- **Radix UI**: Complete set of unstyled, accessible UI primitives (accordion, dialog, dropdown-menu, popover, tabs, toast, tooltip, etc.) providing the foundation for consistent, accessible components
- **Framer Motion**: Animation library for smooth transitions, hover effects, and interactive UI elements
- **Lucide React**: Modern icon library with consistent, scalable SVG icons
- **shadcn/ui**: Component library built on top of Radix UI and Tailwind, providing pre-built, customizable UI components

**Data Visualization:**
- **Recharts**: React-based charting library for creating interactive financial charts (area charts for trends, pie charts for category breakdowns)

**Form Handling & Validation:**
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation for form data and API responses
- **@hookform/resolvers**: Integration between React Hook Form and Zod

**Additional Utilities:**
- **date-fns**: Modern JavaScript date utility library for date manipulation and formatting
- **clsx & tailwind-merge**: Utility functions for conditional CSS class management
- **class-variance-authority**: Component variant management for consistent styling
- **react-dropzone**: File upload interface for transaction data
- **sonner**: Toast notification system
- **next-themes**: Theme management (though primarily dark theme focused)

**Development Tools:**
- **TypeScript 5.5**: Full type checking and modern JavaScript features
- **Vitest**: Fast unit testing framework
- **Prettier**: Code formatting
- **ESLint**: Code linting (implied through tooling)

### Backend Architecture
The backend is a lightweight Node.js API server focused on file processing and transaction analysis.

**Runtime & Framework:**
- **Node.js** with **Express 4.18**: Minimal web framework for handling HTTP requests and file uploads

**File Processing:**
- **Multer**: Middleware for handling multipart/form-data (file uploads)
- **csv-parser**: Stream-based CSV parsing for transaction data
- **pdf-parse**: PDF text extraction for bank statements
- **xlsx**: Excel file processing for spreadsheet-based transaction data

**Utilities:**
- **CORS**: Cross-origin resource sharing for frontend-backend communication
- **dotenv**: Environment variable management

**Development:**
- **Nodemon**: Automatic server restart during development

### Project Structure & Architecture
```
FinPal/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components (sidebar, navigation)
│   │   └── charts/        # Chart components
│   ├── pages/             # Route-based page components
│   ├── lib/               # Utility functions and configurations
│   ├── hooks/             # Custom React hooks
│   └── App.tsx            # Main application component
├── server/                # Backend API
│   ├── processors/        # File processing modules
│   └── server.js          # Express server setup
├── public/                # Static assets
└── Configuration files    # Vite, Tailwind, TypeScript configs
```

### Key Technical Decisions
- **TypeScript**: Ensures type safety across the entire application
- **Component-Driven Development**: Modular, reusable components with consistent APIs
- **Mobile-First Responsive Design**: Optimized for mobile devices with progressive enhancement
- **Performance Optimization**: Lazy loading ready, optimized bundle sizes, and efficient rendering
- **Accessibility**: Semantic HTML and ARIA attributes for inclusive design
- **AI Integration Ready**: Architecture prepared for Google Gemini AI API integration

## 🎯 Design Principles

### User Experience

- **Progressive Enhancement**: Core functionality works on all devices
- **Accessibility**: Semantic HTML and ARIA attributes
- **Performance**: Optimized bundle size and lazy loading ready
- **Intuitive Navigation**: Clear visual hierarchy and user flows

### Development

- **Type Safety**: Full TypeScript coverage
- **Component Reusability**: Modular, composable components
- **Consistent Styling**: Design system with utility classes
- **Error Handling**: Graceful fallbacks and error states

## 🚀 Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Run Type Checking**

   ```bash
   npm run typecheck
   ```

4. **Run Tests**

   ```bash
   npm test
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Navigation Structure

- **Homepage**: Landing page with features and testimonials
- **Dashboard**: Main financial overview (default authenticated view)
- **Transactions**: Transaction management and file upload
- **Budgets**: Budget creation and monitoring
- **AI Insights**: AI-powered analysis and chat assistant
- **Investments**: SIP calculators and investment planning

## 🎨 Color Palette

### Primary Colors

- **Purple Gradients**: #8b5cf6 → #7c3aed → #6d28d9
- **Dark Background**: #0f0f23 → #1a1a3a → #252547
- **Glass Effects**: rgba(255, 255, 255, 0.05-0.1)

### Semantic Colors

- **Success/Income**: Green (#10b981)
- **Warning/Alerts**: Yellow (#f59e0b)
- **Error/Expenses**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

## 🔮 Future Enhancements

### Backend Integration Ready

- File upload endpoints for CSV/PDF transaction data
- User authentication with JWT tokens
- MongoDB integration for data persistence
- Google Gemini AI API integration
- Real-time notifications and alerts

### Additional Features

- **Reports**: PDF/CSV export functionality
- **Profile**: User preferences and settings
- **AI Chat**: Natural language query interface
- **Advanced Analytics**: Spending pattern analysis
- **Investment Tracking**: Portfolio performance monitoring

## 📄 License

This project is part of the FinPal financial management platform.

---

Built with ❤️ for Indian UPI users seeking better financial insights.
