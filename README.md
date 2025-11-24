# EcoTech - Sustainable Energy Management System

A web-based application to help users monitor and reduce their energy consumption while tracking their environmental impact.

## Features

- Device registration and energy consumption tracking
- Personalized energy-saving recommendations
- Environmental impact reporting
- Rewards and gamification system
- Educational content about Green Computing and SDGs
- Multi-language support (English and Portuguese)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router
- **Forms**: React Hook Form
- **Charts**: Recharts
- **i18n**: i18next

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── services/       # API services
├── store/          # Redux store and slices
├── utils/          # Utility functions
├── i18n/           # Internationalization files
└── types/          # TypeScript type definitions
```

## Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT
