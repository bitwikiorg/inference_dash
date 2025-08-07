
# Inference Balances Dashboard

Ultra-simple single-endpoint in-memory dashboard with automated deployment.

## Features
- Single API endpoint for balance updates
- Real-time dashboard frontend
- Basic Auth protection
- Automated CI/CD pipeline
- Zero-downtime deployments

## API Endpoints
- **POST** `/api/balances` - Update balances (Basic Auth required)
  - Body: `{ "balances": { "VCU": <number>, "DIEM": <number> }, "timestamp": "<ISO optional>" }`
- **GET** `/api/balances` - Get current balances (public)
- **GET** `/healthz` - Health check endpoint

## Quick Start

### Local Development
1. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. Install and run:
```bash
npm install
npm run dev  # Development mode
# OR
npm start    # Production mode
```

3. Frontend available at `http://localhost:3000/`

### Deployment
This project auto-deploys to Vercel on push to `main` branch.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup instructions.

## Configuration

### Environment Variables
- `API_USER` - Basic auth username (required)
- `API_PASS` - Basic auth password (required)  
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development|production)

### n8n Integration
Configure Set node output:
```json
{
  "balances": { "VCU": <number>, "DIEM": <number> },
  "timestamp": "{{$now}}"
}
```

Send via HTTP Request node (POST) with Basic Auth using `API_USER` and `API_PASS`.

## Architecture
- **Backend**: Express.js with in-memory storage
- **Frontend**: Vanilla JS with terminal-style UI
- **Auth**: HTTP Basic Authentication
- **Deployment**: Vercel with GitHub Actions CI/CD

## Notes
- Memory resets on restart (intended for simple use case)
- Data updates typically happen hourly via n8n
- Frontend shows daily resource allocation resets at 00:00 UTC-1
- No automatic frontend refresh (reload manually to see updates)