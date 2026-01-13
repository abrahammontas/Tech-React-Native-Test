# Givebutter Assessment Backend API

A Node.js/Express backend API for the Givebutter assessment project.

## Features

- RESTful API endpoints for fundraisers and donations
- Request logging middleware
- Comprehensive error handling
- Data validation
- Pagination support
- Filtering and sorting
- Statistics endpoint

## API Endpoints

### Fundraisers

- `GET /api/fundraisers` - Get all fundraisers
  - Query parameters:
    - `status` - Filter by status (active, completed)
    - `category` - Filter by category
    - `search` - Search in title and description
    - `sortBy` - Sort field (title, createdAt, raised, goal)
    - `sortOrder` - Sort order (asc, desc)
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)

- `GET /api/fundraisers/:id` - Get a specific fundraiser

- `GET /api/fundraisers/:id/donations` - Get donations for a fundraiser
  - Query parameters:
    - `sortBy` - Sort field (amount, createdAt, donorName)
    - `sortOrder` - Sort order (asc, desc)
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 20)

- `POST /api/fundraisers/:id/donations` - Create a new donation
  - Body:
    ```json
    {
      "amount": 50,
      "donorName": "John Doe",
      "message": "Great cause!",
      "anonymous": false
    }
    ```

### Statistics

- `GET /api/stats` - Get overall statistics about fundraisers and donations

- `GET /api/categories` - Get all fundraiser categories

### Health

- `GET /health` - Health check endpoint

## Response Format

All endpoints return JSON in the following format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## Validation Rules

### Donation Creation

- `amount`: Required, must be a positive number, max $100,000
- `donorName`: Required, 2-100 characters
- `message`: Optional
- `anonymous`: Optional boolean

## Mock Data

The API includes mock data for:
- 6 fundraisers across different categories
- 10 donations across various fundraisers

## Running the Server

```bash
npm install
npm start
# or for development with auto-reload:
npm run dev
```

The server runs on `http://localhost:3000` by default.

## Environment Variables

Create a `.env` file:

```
PORT=3000
NODE_ENV=development
```

