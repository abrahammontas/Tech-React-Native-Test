# Givebutter Senior Mobile Engineer Assessment

This repository contains the assessment project for the Senior Mobile Engineer position at Givebutter.

## Project Structure

```
.
├── backend/          # Node.js Express API (almost complete)
│   ├── server.js     # Main server file with API endpoints
│   └── package.json  # Backend dependencies
│
├── mobile/           # React Native Expo app
│   ├── src/
│   │   ├── screens/  # App screens
│   │   └── services/ # API service layer
│   ├── App.tsx       # Main app component
│   └── package.json  # Mobile dependencies
│
└── ASSESSMENT.md     # Detailed assessment instructions
```

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3000`

### Mobile App

```bash
cd mobile
npm install
npm start
```

Then scan the QR code with Expo Go or use a simulator.

## API Endpoints

- `GET /api/fundraisers` - Get all fundraisers
- `GET /api/fundraisers/:id` - Get a specific fundraiser
- `GET /api/fundraisers/:id/donations` - Get donations for a fundraiser
- `POST /api/fundraisers/:id/donations` - Create a new donation

## Assessment Tasks

See [ASSESSMENT.md](./ASSESSMENT.md) for detailed task instructions.

## Technologies

- **Backend:** Node.js, Express
- **Mobile:** React Native, Expo, TypeScript, React Query, React Navigation

