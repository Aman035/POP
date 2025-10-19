# POP Frontend

**Predict on Posts** - A decentralized prediction market platform that transforms social media polls into onchain betting opportunities.

## Overview

POP is a Next.js-based web application that enables users to create, participate in, and manage prediction markets directly from social media polls. Built on Arbitrum with PYUSD collateral, it provides a seamless bridge between social media engagement and decentralized finance.

## Features

### Core Functionality
- **Market Creation**: Transform Twitter/X and Farcaster polls into prediction markets
- **Real-time Betting**: Place bets with PYUSD and watch odds update live
- **Social Integration**: Seamless integration with Twitter/X and Farcaster platforms
- **Browser Extension**: Embedded widgets for direct betting from social feeds
- **Advanced Analytics**: Performance tracking, ROI analysis, and leaderboards

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme**: Professional dark theme with gold accent colors
- **Interactive Components**: Smooth animations and transitions using Framer Motion
- **Accessibility**: Built with Radix UI components for full accessibility support

### Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **Component Library**: Comprehensive UI component system
- **State Management**: Client-side state management with React hooks

## Architecture

### Application Structure
```
app/
├── page.tsx                 # Landing page
├── layout.tsx               # Root layout
├── app/                     # Main application
│   ├── layout.tsx          # App layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── markets/            # Market browsing and details
│   ├── create/             # Market creation wizard
│   ├── leaderboard/        # User rankings
│   ├── activity/           # User activity feed
│   ├── bookmarks/          # Saved markets
│   ├── history/            # Betting history
│   └── settings/           # User preferences
└── extension/              # Browser extension demo
```

### Component Organization
```
components/
├── branding/               # Logo and splash components
├── create/                 # Market creation wizard
├── extension/              # Browser extension components
├── layout/                 # App header and sidebar
├── markets/                # Market-related components
└── ui/                     # Reusable UI components
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_ARBITRUM_RPC_URL=your_arbitrum_rpc_url
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   NEXT_PUBLIC_PYUSD_ADDRESS=your_pyusd_contract_address
   ```

### Development

1. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

1. **Build the application**
   ```bash
   pnpm build
   # or
   npm run build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   # or
   npm start
   ```

## User Flow

### Market Creation Flow
1. **Poll Detection**: User pastes a social media poll URL
2. **Platform Recognition**: System identifies Twitter/X or Farcaster
3. **Market Configuration**: Set parameters (end date, creator fee, resolution source)
4. **Validation**: Verify poll accessibility and market viability
5. **Deployment**: Create onchain market with PYUSD collateral

### Betting Flow
1. **Market Discovery**: Browse active markets or find via social feeds
2. **Market Analysis**: View odds, pool size, and participant count
3. **Bet Placement**: Connect wallet and stake PYUSD on prediction
4. **Real-time Updates**: Watch odds change as others participate
5. **Resolution**: Automatic payout when market resolves

### Extension Integration
1. **Social Media Detection**: Extension identifies polls on Twitter/X and Farcaster
2. **Quick Bet Widget**: Inline betting interface without leaving social platform
3. **Market Creation**: Direct market creation from social posts
4. **Portfolio Tracking**: View positions and performance from extension popup

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript compiler
- **Build Tool**: Next.js built-in bundler

### Blockchain Integration
- **Network**: Arbitrum
- **Collateral**: PYUSD (PayPal USD)
- **Wallet Integration**: Web3 wallet connection
- **Smart Contracts**: Custom prediction market contracts

## Project Structure

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `hooks/` - Custom React hooks
- `public/` - Static assets and images
- `styles/` - Global CSS and Tailwind configuration

### Component Categories
- **Layout Components**: App header, sidebar, and navigation
- **Market Components**: Market cards, betting panels, charts
- **Extension Components**: Browser extension UI elements
- **UI Components**: Reusable design system components
- **Branding Components**: Logo and visual identity elements

## Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow Next.js App Router conventions
- Implement responsive design patterns
- Use semantic HTML and accessibility best practices

### Component Development
- Create reusable components in `components/ui/`
- Use Radix UI primitives for complex interactions
- Implement proper TypeScript interfaces
- Include proper error boundaries and loading states

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the established design system
- Implement dark theme consistently
- Use custom CSS variables for theming

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `pnpm build`
2. Deploy the `.next` folder to your hosting provider
3. Configure environment variables on your server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

---

**Note**: This is an experimental application for demonstration purposes. Not an offer to gamble. Use where permitted by local laws and regulations.
