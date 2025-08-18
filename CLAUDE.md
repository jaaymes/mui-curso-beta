# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using React 19, built with TypeScript and styled with CSS Modules. The project follows Next.js App Router conventions and uses Turbopack for fast development builds.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (fast refresh)
- `npm run build` - Build production version
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint with Next.js TypeScript rules

### Development Server
The dev server runs on http://localhost:3000 with Turbopack enabled for faster compilation.

## Architecture & Structure

### App Router Structure
- Uses Next.js 13+ App Router (`src/app/` directory)
- `src/app/layout.tsx` - Root layout with Geist font configuration
- `src/app/page.tsx` - Homepage component
- `src/app/globals.css` - Global styles
- CSS Modules for component-specific styling (`*.module.css`)

### TypeScript Configuration
- Strict TypeScript enabled with Next.js plugin
- Path alias `@/*` maps to `./src/*`
- Target ES2017 with Next.js optimizations

### Styling Approach
- CSS Modules for component styling
- Geist and Geist Mono fonts from Google Fonts
- CSS custom properties for font variables

### ESLint Configuration
- Uses flat config format (`eslint.config.mjs`)
- Extends `next/core-web-vitals` and `next/typescript`
- Configured for Next.js and TypeScript best practices

## Key Dependencies

### Runtime
- Next.js 15.4.6 with App Router
- React 19.1.0 (latest stable)
- TypeScript 5+ with strict mode

### Development
- ESLint with Next.js config
- @eslint/eslintrc for flat config compatibility

## Notes for Development

- This is a fresh project scaffold - no custom business logic yet implemented
- Uses latest Next.js and React versions (bleeding edge)
- Turbopack is enabled by default for faster development builds
- Font optimization through `next/font/google` for Geist family
- Ready for expansion with additional features and components