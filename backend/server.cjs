const express = require('express');
const expressCoreValidator = require('express-core-validator');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(expressCoreValidator());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Mock data - Fundraisers
const fundraisers = [
  {
    id: 1,
    title: 'Save the Ocean',
    description: 'Help us clean up our oceans and protect marine life. Every dollar counts in our mission to preserve the beauty of our planet.',
    goal: 50000,
    raised: 32500,
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
    category: 'Environment',
    organizer: 'Ocean Conservation Society'
  },
  {
    id: 2,
    title: 'Education for All',
    description: 'Providing educational resources to underserved communities. Help us build a brighter future through education.',
    goal: 75000,
    raised: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    createdAt: '2024-02-01T10:00:00Z',
    status: 'active',
    category: 'Education',
    organizer: 'Education Foundation'
  },
  {
    id: 3,
    title: 'Food Bank Support',
    description: 'Helping local food banks feed families in need. Your donation helps put food on the table for those who need it most.',
    goal: 30000,
    raised: 18500,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
    createdAt: '2024-02-10T10:00:00Z',
    status: 'active',
    category: 'Hunger Relief',
    organizer: 'Community Food Bank'
  },
  {
    id: 4,
    title: 'Animal Shelter Renovation',
    description: 'Renovating our local animal shelter to provide better care for rescued animals. Help us create a safe haven for our furry friends.',
    goal: 40000,
    raised: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    createdAt: '2024-01-20T10:00:00Z',
    status: 'active',
    category: 'Animals',
    organizer: 'Paws & Claws Rescue'
  },
  {
    id: 5,
    title: 'Clean Water Initiative',
    description: 'Bringing clean, safe drinking water to communities in need. Every donation helps us install water filtration systems.',
    goal: 100000,
    raised: 67500,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
    createdAt: '2024-01-05T10:00:00Z',
    status: 'active',
    category: 'Health',
    organizer: 'Water for All Foundation'
  },
  {
    id: 6,
    title: 'Youth Sports Program',
    description: 'Supporting youth sports programs in underserved areas. Help kids stay active and learn valuable life skills through sports.',
    goal: 25000,
    raised: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    createdAt: '2024-02-15T10:00:00Z',
    status: 'completed',
    category: 'Sports',
    organizer: 'Youth Sports Alliance'
  }
];

// Mock data - Donations
const donations = [
  { id: 1, fundraiserId: 1, amount: 50, donorName: 'John Doe', message: 'Great cause!', createdAt: '2024-01-20T14:30:00Z', anonymous: false },
  { id: 2, fundraiserId: 1, amount: 100, donorName: 'Jane Smith', message: 'Keep up the good work!', createdAt: '2024-01-21T09:15:00Z', anonymous: false },
  { id: 3, fundraiserId: 2, amount: 25, donorName: 'Bob Johnson', message: '', createdAt: '2024-02-05T16:45:00Z', anonymous: false },
  { id: 4, fundraiserId: 1, amount: 250, donorName: 'Sarah Williams', message: 'This is so important!', createdAt: '2024-01-22T11:20:00Z', anonymous: false },
  { id: 5, fundraiserId: 3, amount: 75, donorName: 'Mike Davis', message: 'Happy to help!', createdAt: '2024-02-11T08:30:00Z', anonymous: false },
  { id: 6, fundraiserId: 2, amount: 500, donorName: 'Anonymous', message: 'Keep doing great work!', createdAt: '2024-02-06T14:00:00Z', anonymous: true },
  { id: 7, fundraiserId: 4, amount: 100, donorName: 'Emily Chen', message: 'Love animals!', createdAt: '2024-01-21T15:45:00Z', anonymous: false },
  { id: 8, fundraiserId: 5, amount: 1000, donorName: 'Robert Taylor', message: 'Water is life', createdAt: '2024-01-10T10:00:00Z', anonymous: false },
  { id: 9, fundraiserId: 1, amount: 30, donorName: 'Lisa Anderson', message: '', createdAt: '2024-01-23T13:15:00Z', anonymous: false },
  { id: 10, fundraiserId: 4, amount: 200, donorName: 'David Brown', message: 'Thank you for all you do!', createdAt: '2024-01-22T09:30:00Z', anonymous: false }
];

// Utility functions
const findFundraiserById = (id) => fundraisers.find(f => f.id === id);
const findDonationById = (id) => donations.find(d => d.id === id);
const getNextId = (array) => Math.max(0, ...array.map(item => item.id)) + 1;

// Validation helpers
const validateDonation = (amount, donorName) => {
  const errors = [];
  
  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (amount > 100000) {
    errors.push('Amount cannot exceed $100,000');
  }
  
  if (!donorName || donorName.trim() === '') {
    errors.push('Donor name is required');
  }
  
  if (donorName && donorName.trim().length < 2) {
    errors.push('Donor name must be at least 2 characters');
  }
  
  if (donorName && donorName.trim().length > 100) {
    errors.push('Donor name must be less than 100 characters');
  }
  
  return errors;
};

// Routes

// GET /api/fundraisers - Get all fundraisers with optional filtering and sorting
app.get('/api/fundraisers', (req, res) => {
  try {
    let result = [...fundraisers];
    
    // Filter by status
    if (req.query.status) {
      result = result.filter(f => f.status === req.query.status);
    }
    
    // Filter by category
    if (req.query.category) {
      result = result.filter(f => f.category === req.query.category);
    }
    
    // Search by title or description
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(searchTerm) ||
        f.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResult = result.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedResult,
      pagination: {
        page,
        limit,
        total: result.length,
        totalPages: Math.ceil(result.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fundraisers',
      error: error.message
    });
  }
});

// GET /api/fundraisers/:id - Get a specific fundraiser
app.get('/api/fundraisers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const fundraiser = fundraisers.find(f => f.id === id);
  
  if (!fundraiser) {
    return res.status(404).json({
      success: false,
      message: 'Fundraiser not found'
    });
  }
  
  res.json({
    success: true,
    data: fundraiser
  });
});

// GET /api/fundraisers/:id/donations - Get donations for a fundraiser with optional sorting
app.get('/api/fundraisers/:id/donations', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if fundraiser exists
    const fundraiser = findFundraiserById(id);
    if (!fundraiser) {
      return res.status(404).json({
        success: false,
        message: 'Fundraiser not found'
      });
    }
    
    let fundraiserDonations = donations.filter(d => d.fundraiserId === id);
    
    // Sort donations
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    
    fundraiserDonations.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDonations = fundraiserDonations.slice(startIndex, endIndex);
    
    // Calculate totals
    const totalAmount = fundraiserDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalCount = fundraiserDonations.length;
    
    res.json({
      success: true,
      data: paginatedDonations,
      summary: {
        totalAmount,
        totalCount,
        averageAmount: totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : 0
      },
      pagination: {
        page,
        limit,
        total: fundraiserDonations.length,
        totalPages: Math.ceil(fundraiserDonations.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
});

// POST /api/fundraisers/:id/donations - Create a new donation
app.post('/api/fundraisers/:id/donations', (req, res) => {
  try {
    const fundraiserId = parseInt(req.params.id);
    const { amount, donorName, message, anonymous } = req.body;
    
    // Check if fundraiser exists
    const fundraiser = findFundraiserById(fundraiserId);
    if (!fundraiser) {
      return res.status(404).json({
        success: false,
        message: 'Fundraiser not found'
      });
    }
    
    // Check if fundraiser is active
    if (fundraiser.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot donate to a fundraiser that is not active'
      });
    }
    
    // Validate donation data
    const validationErrors = validateDonation(amount, donorName);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Create donation
    const donationAmount = parseFloat(amount);
    const newDonation = {
      id: getNextId(donations),
      fundraiserId,
      amount: donationAmount,
      donorName: anonymous ? 'Anonymous' : donorName.trim(),
      message: message ? message.trim() : '',
      createdAt: new Date().toISOString(),
      anonymous: anonymous || false
    };
    
    donations.push(newDonation);
    
    // Update fundraiser raised amount
    fundraiser.raised += donationAmount;
    
    // Check if goal is reached
    if (fundraiser.raised >= fundraiser.goal && fundraiser.status === 'active') {
      fundraiser.status = 'completed';
    }
    
    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: newDonation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
});

// GET /api/stats - Get overall statistics
app.get('/api/stats', (req, res) => {
  try {
    const totalFundraisers = fundraisers.length;
    const activeFundraisers = fundraisers.filter(f => f.status === 'active').length;
    const totalRaised = fundraisers.reduce((sum, f) => sum + f.raised, 0);
    const totalGoal = fundraisers.reduce((sum, f) => sum + f.goal, 0);
    const totalDonations = donations.length;
    const totalDonationAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    
    res.json({
      success: true,
      data: {
        fundraisers: {
          total: totalFundraisers,
          active: activeFundraisers,
          completed: totalFundraisers - activeFundraisers
        },
        fundraising: {
          totalRaised,
          totalGoal,
          percentage: totalGoal > 0 ? ((totalRaised / totalGoal) * 100).toFixed(2) : 0
        },
        donations: {
          totalCount: totalDonations,
          totalAmount: totalDonationAmount,
          averageAmount: totalDonations > 0 ? (totalDonationAmount / totalDonations).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// GET /api/categories - Get all fundraiser categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(fundraisers.map(f => f.category))].filter(Boolean);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

