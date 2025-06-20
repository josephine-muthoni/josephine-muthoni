const express = require('express');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/tasks');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Environment Detection
const isCodespace = process.env.CODESPACE_NAME !== undefined;
const isProduction = process.env.NODE_ENV === 'production';
const codespaceUrl = isCodespace 
  ? `https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : null;

// Enhanced CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    ...(isCodespace ? [
      codespaceUrl,
      'https://*.app.github.dev'
    ] : []),
    ...(isProduction ? [
      'https://your-production-domain.com'
    ] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    body: req.body
  });
  next();
});

// API Routes
app.use('/api/', apiLimiter);
app.use('/api/tasks', taskRoutes);

// Documentation Endpoint
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    application: 'Task Manager API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: `${baseUrl}/api-docs`,
    endpoints: {
      tasks: `${baseUrl}/api/tasks`,
      health: `${baseUrl}/health`
    },
    ...(isCodespace && { 
      codespaceUrl,
      debugInfo: {
        codespaceName: process.env.CODESPACE_NAME,
        port: PORT
      }
    })
  });
});

// Health Check with DB Connection Verification
app.get('/health', async (req, res) => {
  try {
    // Add database health check if applicable
    // await checkDatabaseConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      dependencies: {
        // Add dependency checks here
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
});

// Production Configuration
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    path: req.originalUrl,
    method: req.method,
    error: err.stack,
    body: req.body,
    headers: req.headers
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      details: err.details
    }),
    requestId: req.id
  });
});

// Server Initialization
const server = app.listen(PORT, () => {
  console.log(`\n${'-'.repeat(50)}`);
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Available URLs:`);
  
  const urls = [
    `http://localhost:${PORT}`,
    ...(isCodespace ? [codespaceUrl] : [])
  ];
  
  urls.forEach(url => {
    console.log(`\n- ${url}`);
    console.log(`  • API: ${url}/api/tasks`);
    console.log(`  • Health: ${url}/health`);
    console.log(`  • Docs: ${url}/`);
  });
  
  console.log(`\nPress CTRL+C to stop\n${'-'.repeat(50)}`);
});

// Process Management
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.stack);
  shutdown('UNHANDLED_REJECTION');
});

module.exports = server;