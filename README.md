# Poker Game Simulator

A full-stack Texas Hold'em poker game simulator built with Next.js, FastAPI, and PostgreSQL.

## Features

- 6-player Texas Hold'em poker simulation
- Real-time game state tracking
- Hand history logging and persistence
- Server-side validation of game logic
- Responsive UI built with shadcn/ui
- Comprehensive test coverage

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- shadcn/ui
- Jest for testing

### Backend
- FastAPI
- Python 3.12
- PostgreSQL
- Poetry for dependency management
- pokerkit for hand evaluation

## Project Structure

```
.
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── __tests__/    # Test files
│   │   └── api/         # API client
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── game/        # Game logic
│   │   ├── models/      # Data models
│   │   └── services/    # Business logic
│   └── tests/           # Backend tests
└── docker-compose.yml    # Docker configuration
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.12
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kozlofff/poker_te
cd poker_te
```

2. Start the application using Docker Compose:
```bash
docker compose up -d
```

3. Access the application at http://localhost:3000

P.s: You may need to run the "docker compose up -d" command twice because postgresql is not fully initialized in the docker container for the first time.

## Manual Setup (Development)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend

Please before go to /backend/app/database.py and on line number 20 change host to "localhost". When you will run docker command for this project please change it back to "db".

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Game Rules

- 6-player Texas Hold'em
- Big Blind: 40 chips
- Small Blind: 20 chips
- No ante
- Standard betting rounds: preflop, flop, turn, river

## Testing

### Frontend Tests
```bash
cd frontend
npm install --save-dev jest
npm test
```

### Backend Tests
If you didn't change dbhost on manual setup go to /backend/app/database.py and on line number 20 change host to "localhost". When you will run docker command for this project please change it back to "db".

```bash
cd backend
pytest
```

## API Endpoints

### Hand Management
- `POST /api/hands` - Create a new hand
- `GET /api/hands` - List all hands
- `GET /api/hands/{hand_id}` - Get specific hand

### Game Actions
- `POST /api/games/{hand_id}/actions` - Process player action

## Acceptance Criteria

### Frontend
- [x] Single page application
- [x] Game logic implemented client-side
- [x] Server-side validation
- [x] Integration tests
- [x] Hand history display
- [x] Action logging

### Backend
- [x] RESTful API implementation
- [x] Repository pattern with raw SQL
- [x] Dataclass entities
- [x] API tests
- [x] PEP8 compliance
- [x] Correct win/loss calculations
