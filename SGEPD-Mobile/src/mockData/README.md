# Mock Data Setup

This mobile app includes a comprehensive mock data system for development and testing.

## Overview

The mock data system provides:
- **Mock authentication** with test user credentials
- **Mock datasets** for clients, screens, locations, and tickets
- **Realistic data** including dates, references, and status fields
- **In-memory persistence** of mock data changes during the session
- **Network simulation** with configurable delays

## Features

### Mock Users (for Authentication)

Three test users are available for login:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ADMIN |
| `tech` | `tech123` | TECHNICIEN |
| `client` | `client123` | CLIENT |

Use these credentials to test the app with different user roles.

### Mock Data Included

- **3 Clients** - ACME Corporation, Tech Solutions Ltd, Digital Services Inc
- **3 Screens** - Various screen types and statuses
- **3 Locations** - Office and warehouse locations
- **4 Tickets** - With different statuses (Open, InProgress, Resolved)

### Realistic Features

- Proper database-like ID generation
- Timestamps in ISO format
- Relationships between entities (client-screen, location-screen, etc.)
- Status enumerations (Active, Inactive, Open, InProgress, etc.)
- Complete mock API responses

## Configuration

### Enable/Disable Mock Mode

Edit [src/mockData/mockConfig.js](src/mockData/mockConfig.js):

```javascript
// Set to true for mock data, false for real API
export const USE_MOCK_DATA = true;

// Simulate network delay (milliseconds)
export const MOCK_DELAY = 300;
```

### Network Delay Simulation

The `MOCK_DELAY` parameter simulates realistic network latency. Adjust it to test loading states:

```javascript
export const MOCK_DELAY = 0;    // No delay (instant)
export const MOCK_DELAY = 300;  // 300ms delay (realistic)
export const MOCK_DELAY = 1000; // 1 second delay (slow network)
```

## File Structure

```
src/
├── mockData/
│   ├── mockData.js        # All mock data definitions
│   ├── mockConfig.js      # Configuration (USE_MOCK_DATA flag)
│   └── README.md          # This file
├── services/
│   ├── authService.js     # Updated with mock auth
│   ├── clientService.js   # Updated with mock clients
│   ├── screenService.js   # Updated with mock screens
│   ├── locationService.js # Updated with mock locations
│   └── ticketService.js   # Updated with mock tickets
```

## How It Works

Each service checks the `USE_MOCK_DATA` flag:

1. **If `USE_MOCK_DATA === true`:**
   - Returns mock data from `mockData.js`
   - Simulates network delay with `simulateNetworkDelay()`
   - Performs in-memory create/update/delete operations

2. **If `USE_MOCK_DATA === false`:**
   - Makes real API calls via axios
   - Requires backend services running on `http://10.0.2.2:8090/api`

### Example Service Code

```javascript
export const fetchClients = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    return mockClients;
  }
  const response = await api.get('/clients');
  return response.data;
};
```

## Testing Workflow

### 1. Develop with Mock Data (Recommended)

Keep `USE_MOCK_DATA = true` during development:
- No backend dependency
- Instant feedback
- Test UI with realistic data

```bash
# Start the app with mock data
npm start
# or
npx expo start --web
```

### 2. Switch to Real API

When ready to test with backend:

1. Update [src/mockData/mockConfig.js](src/mockData/mockConfig.js):
   ```javascript
   export const USE_MOCK_DATA = false;
   ```

2. Ensure backend services are running:
   ```bash
   docker-compose up -d
   cd auth-service && ./mvnw spring-boot:run
   cd user-service && ./mvnw spring-boot:run
   ```

3. The app will use real API endpoints at `http://10.0.2.2:8090/api`

## In-Memory Persistence

Mock data operations are persisted in memory during the app session:

```javascript
// Create a new client
await addClient({ nom: 'New Company', email: 'new@company.com' });

// The client is added to mockClients array and will appear in subsequent fetches
const clients = await fetchClients(); // Includes the newly created client
```

**Note:** Data is NOT persisted between app restarts. Refresh the app to reset to original mock data.

## Adding More Mock Data

To add more mock data, edit [src/mockData/mockData.js](src/mockData/mockData.js):

```javascript
// Add to MOCK_CLIENTS, MOCK_SCREENS, MOCK_LOCATIONS, or MOCK_TICKETS

export const MOCK_CLIENTS = [
  // ... existing clients ...
  {
    id: 4,
    nom: 'Your New Client',
    email: 'new@client.com',
    phone: '+212 5 XX XX XX XX',
    address: 'Address',
    type: 'Enterprise',
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];
```

Then update the corresponding service to use the new data:

```javascript
let nextMockId = Math.max(...MOCK_CLIENTS.map(c => c.id)) + 1;
```

## Troubleshooting

### "Cannot find module 'mockConfig'" or "Cannot find module 'mockData'"

Ensure the directory structure exists:
```
src/
  mockData/
    mockConfig.js
    mockData.js
```

### Authentication fails with mock data

Check the credentials in [mockData.js](src/mockData/mockData.js):

```javascript
export const MOCK_USERS = [
  { username: 'admin', password: 'admin123', ... }
];
```

Use exactly these credentials when logging in.

### Mock data not appearing in screens

1. Verify `USE_MOCK_DATA = true` in `mockConfig.js`
2. Check that stores are calling `loadClients()`, `loadScreens()`, etc.
3. Verify the mock data arrays are properly initialized in `mockData.js`

### Need to reset mock data

Restart the app - all mock data will be reset to the original values from `mockData.js`.

## Best Practices

1. **Use mock data for development** - Faster, no backend required
2. **Test with real API before deployment** - Switch `USE_MOCK_DATA = false`
3. **Keep mock data realistic** - Use real-world data formats and relationships
4. **Adjust MOCK_DELAY for testing** - Test UI loading states and error handling
5. **Document your mock data** - Note what each mock entity represents

## Integration with Backend

When the real backend is running:

1. Set `USE_MOCK_DATA = false` in mockConfig.js
2. Ensure Docker PostgreSQL is running: `docker-compose up -d`
3. Auth service running on `http://localhost:8081`
4. API Gateway running on `http://localhost:8090`

The app will automatically use the real API endpoints without code changes.
