# Mysta Landing Page

A modern landing page built with Next.js, React, and Tailwind CSS.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Headless UI](https://headlessui.com/) - Unstyled UI components
- [AOS](https://michalsnik.github.io/aos/) - Animate On Scroll Library

## Requirements

- Node.js 16.x or higher
- pnpm 8.x or higher

## Quick Start

1. Clone the repository and navigate to the directory

```bash
git clone <repository-url>
cd landing
```

2. Copy the environment variables file

```bash
cp .env.example .env
```

3. Install dependencies

```bash
pnpm install
```

4. Start the development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the website.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting

## Project Structure

```
landing/
├── app/           # Next.js app directory
├── components/    # React components
├── public/        # Static files
├── styles/       # Global styles
└── types/        # TypeScript type definitions
```

## Deployment

This project can be deployed on any platform that supports Next.js, such as Vercel, Netlify, or self-hosted servers.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
