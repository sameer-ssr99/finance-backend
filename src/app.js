const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors());

// Body Parser
app.use(express.json());

// Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Not Found
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
