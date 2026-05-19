require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const chatHandler = require('./socket/chatHandler');

// Import routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const jobRoutes = require('./routes/jobs');
const swipeRoutes = require('./routes/swipes');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const reviewsRoutes = require('./routes/reviews');
const contractRoutes = require('./routes/contract');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TRABAWHO API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/contracts', contractRoutes);

// Initialize Socket.io chat handler
chatHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log('✅ Models synced');

    server.listen(PORT, () => {
      console.log(`\n🚀 TRABAWHO API running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\nMake sure MySQL is running. You can start it with:');
    console.error('  docker-compose up -d mysql\n');
    process.exit(1);
  }
}

start();
