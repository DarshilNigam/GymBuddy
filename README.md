# GymBuddy

### AI-Powered Computer Vision Fitness Platform

GymBuddy is a browser-based fitness platform that uses real-time computer vision to track exercise repetitions and provide form feedback directly through the user's camera.

## Live Demo

https://gymbuddy-drab.vercel.app/

## What GymBuddy Does

- Real-time push-up repetition counting
- Real-time sit-up repetition counting
- Computer vision pose tracking
- Exercise-specific form validation
- Anti-false-repetition detection
- Workout session tracking
- Workout history
- Personal best tracking
- Streak tracking
- Progress analytics
- Supabase authentication
- Cloud workout persistence
- Responsive light/dark interface

## Core Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- MediaPipe Tasks Vision
- Supabase
- PostgreSQL
- Vercel

## Computer Vision

GymBuddy uses MediaPipe Pose Landmarker for browser-based human pose estimation.

The system analyzes body landmarks and exercise-specific biomechanics to determine valid repetitions.

Push-ups use kinematic measurements including:
- shoulder-elbow-wrist angle
- body alignment
- movement trajectory
- depth
- lockout
- angular velocity
- frame-to-frame motion validation

Sit-ups use:
- torso angle
- hip/knee/ankle relationships
- grounded-body validation
- movement trajectory
- depth
- return-to-start validation

The repetition engine includes safeguards against sudden movement and implausible motion so that arbitrary camera movement is not treated as a valid repetition.

## Privacy

Camera processing is performed in the browser using client-side computer vision.

GymBuddy does not upload workout video to an external server for repetition counting.

Only workout/session data required by the application is persisted.

## Architecture

```text
src/
├── engine/
│   ├── geometry/
│   ├── filtering/
│   ├── exercises/
│   └── pose/
├── hooks/
├── services/
├── components/
├── pages/
├── types/
└── lib/
```

The architecture separates:
- pose detection
- geometric calculations
- temporal filtering
- exercise detection
- workout state
- persistence
- UI

This keeps the computer-vision engine modular and testable.

## Authentication & Data

Supabase provides:
- authentication
- user profiles
- workout session persistence
- row-level security

Workout records are scoped to the authenticated user.

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## Testing

Run the project's existing test suite using the package.json test command:

```bash
npm test
```

Before committing, verify:
- tests pass
- TypeScript passes
- production build succeeds

## Deployment

GymBuddy is deployed using Vercel.

Environment variables required:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never commit environment variable values or private Supabase credentials.

## Project Status

Production deployment is live.

The core GymBuddy experience is implemented:
Landing → Authentication → Exercise Selection → Camera Setup → AI Workout → Results → Dashboard / Progress

## Author

Darshil Nigam

GitHub:
https://github.com/DarshilNigam
