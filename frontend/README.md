# Kormek Frontend

React + Vite + TypeScript frontend for Kormek.

For full project documentation (architecture, full run/stop/test flow), see the root README:

- [../README.md](../README.md)

## Stack

- React
- Vite
- TypeScript
- Zustand
- Tailwind CSS
- React Player
- Native WebRTC APIs

## Install

```bash
cd frontend
npm install
```

## Run

```bash
cd frontend
npm run dev
```

Dev server:

- http://localhost:5173

## Stop

- Press `Ctrl + C` in the frontend terminal.

## Dev checks

```bash
cd frontend
npx tsc --noEmit
```

## Key areas

- Pages: `src/pages`
- Components: `src/components`
- State store: `src/store/useRoomStore.ts`
- WebRTC hook: `src/hooks/useWebRTC.ts`
- Shared types: `src/types.ts`
