# Alma Lifestyle Ecommerce

**Status**: Foundation Complete ✓ | **Next Phase**: Phase 1 Implementation

Luxury Punjabi/Panjabi fashion ecommerce platform targeting UAE and Bangladesh audiences.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase PostgreSQL
- **Validation**: Zod
- **Animation**: Framer Motion
- **Testing**: Vitest
- **Deployment**: Vercel

## Development Approach

- **Admin-First**: Complete backend & admin UI before customer pages
- **API-First**: All business logic in APIs, admin uses same endpoints
- **Database-First**: Schema designed for scalability and audit compliance
- **Type-Safe**: Strict TypeScript with branded types

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (admin)/        # Admin routes
│   ├── (shop)/         # Customer routes
│   ├── auth/           # Authentication
│   └── api/v1/         # API endpoints
├── components/         # React components
│   ├── admin/          # Admin-only components
│   ├── shop/           # Customer components
│   └── shared/         # Shared components
├── lib/                # Utilities & configurations
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
├── server/             # Server-side code
└── styles/             # Global styles
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## Development Phases

See `docs/DEVELOPMENT_PHASES.md` for the 16-week roadmap.

**Current Phase**: Foundation Setup (Complete)
**Next Phase**: Phase 1 - Database & Authentication

## Documentation

All documentation is in the `docs/` folder:

- `ARCHITECTURE.md` - System design & principles
- `DATABASE_SCHEMA.md` - Complete database design
- `CODING_STANDARDS.md` - Code quality guidelines
- `DEVELOPMENT_PHASES.md` - Development roadmap
- `ADMIN_WORKFLOW.md` - Admin operations guide
- `FOLDER_STRUCTURE.md` - Project organization

## Contributing

1. Follow the coding standards in `docs/CODING_STANDARDS.md`
2. Write tests for new features
3. Ensure TypeScript strict mode compliance
4. Run `npm run lint` and `npm run type-check` before committing

## License

Private - Alma Lifestyle Internal Use Only

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
