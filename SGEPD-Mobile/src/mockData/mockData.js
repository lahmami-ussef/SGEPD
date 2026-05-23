// Mock authentication credentials for testing
export const MOCK_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@sgepd.com',
    role: 'ADMIN'
  },
  {
    username: 'tech',
    password: 'tech123',
    email: 'tech@sgepd.com',
    role: 'TECHNICIEN'
  },
  {
    username: 'client',
    password: 'client123',
    email: 'client@sgepd.com',
    role: 'CLIENT'
  }
];

// Mock token for development (fake JWT-like token)
export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTYyNDAwMDAwMH0.mock_token_for_development';

// Mock clients data
export const MOCK_CLIENTS = [
  {
    id: 1,
    nom: 'ACME Corporation',
    email: 'contact@acme.com',
    phone: '+212 5 00 00 00 00',
    address: '123 Business Street, Casablanca',
    type: 'Enterprise',
    status: 'Active',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    nom: 'Tech Solutions Ltd',
    email: 'info@techsol.com',
    phone: '+212 5 11 11 11 11',
    address: '456 Innovation Avenue, Rabat',
    type: 'SME',
    status: 'Active',
    createdAt: '2025-02-01T14:20:00Z'
  },
  {
    id: 3,
    nom: 'Digital Services Inc',
    email: 'support@digiserv.com',
    phone: '+212 5 22 22 22 22',
    address: '789 Digital Road, Fes',
    type: 'Startup',
    status: 'Inactive',
    createdAt: '2025-02-10T09:15:00Z'
  }
];

// Mock screens data
export const MOCK_SCREENS = [
  {
    id: 1,
    reference: 'SCR-001',
    name: 'Main Office Screen',
    clientId: 1,
    clientName: 'ACME Corporation',
    location: 'Main Office',
    size: '55"',
    resolution: '4K',
    model: 'Samsung LH55B',
    status: 'Active',
    lastMaintenance: '2025-05-10T08:00:00Z',
    createdAt: '2025-01-20T11:00:00Z'
  },
  {
    id: 2,
    reference: 'SCR-002',
    name: 'Reception Screen',
    clientId: 1,
    clientName: 'ACME Corporation',
    location: 'Reception',
    size: '43"',
    resolution: 'Full HD',
    model: 'LG 43UP550',
    status: 'Active',
    lastMaintenance: '2025-05-05T10:30:00Z',
    createdAt: '2025-01-22T14:00:00Z'
  },
  {
    id: 3,
    reference: 'SCR-003',
    name: 'Conference Screen',
    clientId: 2,
    clientName: 'Tech Solutions Ltd',
    location: 'Conference Room',
    size: '65"',
    resolution: '4K',
    model: 'Sony Bravia XR',
    status: 'Maintenance',
    lastMaintenance: '2025-05-15T13:00:00Z',
    createdAt: '2025-02-05T16:00:00Z'
  }
];

// Mock locations data
export const MOCK_LOCATIONS = [
  {
    id: 1,
    nom: 'Casablanca Downtown',
    adresse: '123 Business Street, Casablanca',
    clientId: 1,
    clientName: 'ACME Corporation',
    latitude: 33.5731,
    longitude: -7.5898,
    type: 'Office',
    zone: 'North',
    status: 'Active',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    nom: 'Rabat Government District',
    adresse: '456 Innovation Avenue, Rabat',
    clientId: 2,
    clientName: 'Tech Solutions Ltd',
    latitude: 34.0209,
    longitude: -6.8416,
    type: 'Office',
    zone: 'Center',
    status: 'Active',
    createdAt: '2025-02-01T14:20:00Z'
  },
  {
    id: 3,
    nom: 'Fes Medina',
    adresse: '789 Digital Road, Fes',
    clientId: 3,
    clientName: 'Digital Services Inc',
    latitude: 34.0640,
    longitude: -5.0040,
    type: 'Warehouse',
    zone: 'South',
    status: 'Inactive',
    createdAt: '2025-02-10T09:15:00Z'
  }
];

// Mock tickets data
export const MOCK_TICKETS = [
  {
    id: 1,
    reference: 'TKT-2025-001',
    screenId: 1,
    screenRef: 'SCR-001',
    clientId: 1,
    clientName: 'ACME Corporation',
    type: 'Maintenance',
    priority: 'High',
    status: 'Open',
    description: 'Screen not turning on, no display signal',
    assignedTo: 'tech',
    createdAt: '2025-05-20T09:00:00Z',
    dueDate: '2025-05-22T17:00:00Z',
    updatedAt: '2025-05-20T09:00:00Z'
  },
  {
    id: 2,
    reference: 'TKT-2025-002',
    screenId: 2,
    screenRef: 'SCR-002',
    clientId: 1,
    clientName: 'ACME Corporation',
    type: 'Repair',
    priority: 'Medium',
    status: 'InProgress',
    description: 'Remote control not responding',
    assignedTo: 'tech',
    createdAt: '2025-05-18T10:30:00Z',
    dueDate: '2025-05-25T17:00:00Z',
    updatedAt: '2025-05-20T14:15:00Z'
  },
  {
    id: 3,
    reference: 'TKT-2025-003',
    screenId: 3,
    screenRef: 'SCR-003',
    clientId: 2,
    clientName: 'Tech Solutions Ltd',
    type: 'Installation',
    priority: 'High',
    status: 'Resolved',
    description: 'New screen installation and configuration',
    assignedTo: 'tech',
    createdAt: '2025-05-10T08:00:00Z',
    dueDate: '2025-05-15T17:00:00Z',
    updatedAt: '2025-05-15T16:00:00Z',
    interventionReport: 'Screen successfully installed and tested. All cables connected properly. Configuration completed.'
  },
  {
    id: 4,
    reference: 'TKT-2025-004',
    screenId: 1,
    screenRef: 'SCR-001',
    clientId: 1,
    clientName: 'ACME Corporation',
    type: 'Support',
    priority: 'Low',
    status: 'Open',
    description: 'Request for software update',
    assignedTo: null,
    createdAt: '2025-05-19T15:45:00Z',
    dueDate: '2025-05-29T17:00:00Z',
    updatedAt: '2025-05-19T15:45:00Z'
  }
];

// Statistics for dashboard
export const MOCK_DASHBOARD_STATS = {
  totalClients: MOCK_CLIENTS.length,
  activeClients: MOCK_CLIENTS.filter(c => c.status === 'Active').length,
  totalScreens: MOCK_SCREENS.length,
  activeScreens: MOCK_SCREENS.filter(s => s.status === 'Active').length,
  totalLocations: MOCK_LOCATIONS.length,
  totalTickets: MOCK_TICKETS.length,
  openTickets: MOCK_TICKETS.filter(t => t.status === 'Open').length,
  inProgressTickets: MOCK_TICKETS.filter(t => t.status === 'InProgress').length,
  resolvedTickets: MOCK_TICKETS.filter(t => t.status === 'Resolved').length
};

export default {
  MOCK_USERS,
  MOCK_TOKEN,
  MOCK_CLIENTS,
  MOCK_SCREENS,
  MOCK_LOCATIONS,
  MOCK_TICKETS,
  MOCK_DASHBOARD_STATS
};
