# FinPal - AI-Powered Personal Finance Management

FinPal is a modern, AI-powered personal finance management web application designed specifically for Indian users who want to analyze and track their UPI-based digital spending.

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

## 🛠 Technical Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **React Router 6** for client-side routing
- **TailwindCSS 3** with custom theme
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Radix UI** for accessible components
- **Lucide React** for icons

### Styling Architecture

- **Custom Tailwind Theme**: Extended with FinPal brand colors and glassmorphism utilities
- **CSS Variables**: HSL-based color system for easy theming
- **Responsive Design**: Mobile-first breakpoints
- **Component Library**: Comprehensive UI components with variants

### Code Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (buttons, cards, etc.)
│   └── layout/          # Layout components (Sidebar, MobileNav, AppLayout)
├── pages/               # Route components
├── lib/                 # Utility functions
├── hooks/               # Custom React hooks
└── App.tsx              # Main app with routing
```

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
