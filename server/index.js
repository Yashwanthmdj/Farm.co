require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Reminder = require('./models/Reminder');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { sendReminderSMS } = require('./utils/fast2sms');

// Optional dependency: helmet (security headers). Falls back to a no-op
// middleware if it isn't installed so the server still boots.
let helmet = null;
try {
  helmet = require('helmet');
} catch (err) {
  console.warn('⚠️  helmet not installed - skipping security headers middleware. Run `npm install helmet` to enable.');
}

// Optional dependency: express-rate-limit. Falls back to a no-op middleware
// if it isn't installed so the server still boots.
let rateLimit = null;
try {
  rateLimit = require('express-rate-limit');
} catch (err) {
  console.warn('⚠️  express-rate-limit not installed - skipping API rate limiting. Run `npm install express-rate-limit` to enable.');
}

// Import routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const chatRoutes = require('./routes/chatRoutes');
const multilingualChatRoutes = require('./routes/multilingualChat');
const weatherRoutes = require('./routes/weatherRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const speechToTextRoutes = require('./routes/speechToText');
const soilAnalysisRoutes = require('./routes/soilAnalysisRoutes');
const diseaseDetectionRoutes = require('./routes/diseaseDetectionRoutes');
const farmerProductRoutes = require('./routes/farmerProductRoutes');
const cropPricesRoutes = require('./routes/cropPricesRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const schemesRoutes = require('./routes/schemesRoutes');
const irrigationRoutes = require('./routes/irrigationRoutes');

const app = express();

// Ensure required runtime directories exist before anything tries to write to them.
const audioDir = path.join(__dirname, 'public/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security headers (no-op if helmet isn't installed)
if (helmet) {
  app.use(helmet({
    // Allow serving/loading of cross-origin static assets (uploads/audio)
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
}

// Middleware
// CORS — allow configured frontend origin(s) in production
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no Origin) and local/dev when CLIENT_URL unset
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limit API traffic, but keep chat/reminders usable during local testing.
// ReminderWatcher + dashboard polling can burn through a tight limit quickly.
if (rateLimit) {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.API_RATE_LIMIT || 2000),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    skip: (req) => {
      const url = req.originalUrl || req.url || '';
      // Never block the AI chat or reminder delivery paths with global limits
      return (
        url.includes('/api/multilingual-chat') ||
        url.includes('/api/chat') ||
        url.includes('/api/reminders') ||
        url.includes('/health')
      );
    },
  });
  app.use('/api/', apiLimiter);
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/multilingual-chat', multilingualChatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/speech-to-text', speechToTextRoutes);
app.use('/api/soil-analysis', soilAnalysisRoutes);
app.use('/api/disease-detection', diseaseDetectionRoutes);
app.use('/api/farmer-products', farmerProductRoutes);

// Add missing routes
app.use('/api/tractor', require('./routes/tractorRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));

// New routes
app.use('/api/crop-prices', cropPricesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/irrigation', irrigationRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use('/audio', express.static(__dirname + '/public/audio'));

app.use('/uploads/products', express.static(path.join(__dirname, 'uploads/products')));

// Health check (always available)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Serve React build when present (single-URL deploy / ngrok / Render)
const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/audio')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log('📦 Serving React app from client/build');
} else {
  app.get('/', (req, res) => {
    res.send('Farm.co Backend Running — build the client (cd client && npm run build) to serve the UI from this server.');
  });
}

// Global error handler - catches any errors passed via next(err) or thrown
// synchronously inside route handlers, so the process never crashes and
// clients always get a JSON error response instead of a hung connection.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Cron job: runs every minute — delivers due reminders (in-app + SMS)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({ date: { $lte: now }, isSent: { $ne: true } });
    if (dueReminders.length) {
      console.log(`[CRON] Due reminders: ${dueReminders.length} at ${now.toISOString()}`);
    }

    for (const reminder of dueReminders) {
      const user = await User.findById(reminder.userId);

      // Always create an in-app notification so the UI can surface it
      try {
        await Notification.create({
          userId: reminder.userId,
          title: 'Farm.co Reminder',
          message: reminder.message,
        });
      } catch (notifErr) {
        console.error('[CRON] Notification create failed:', notifErr.message);
      }

      // Try SMS if we have a phone — failure must not block marking as delivered in-app
      if (user && user.phone) {
        try {
          const { normalizeIndianPhone } = require('./utils/fast2sms');
          const phone = normalizeIndianPhone(user.phone) || user.phone;
          await sendReminderSMS(phone, user.name, reminder.message, reminder.date);
          console.log(`[CRON] SMS sent for reminder ${reminder._id}`);
        } catch (err) {
          console.error(`[CRON] SMS failed for ${reminder._id}:`, err.message);
        }
      }

      reminder.isSent = true;
      await reminder.save();
    }
  } catch (err) {
    console.error('[CRON] Reminder job error:', err.message);
  }
});

// MongoDB connection string MUST come from the environment. We no longer
// fall back to a hardcoded URI (which previously contained live credentials
// committed to source) - if it's missing, fail fast with a clear message
// instead of silently connecting to someone else's database.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in your environment/.env file.');
  console.error('💡 Create a server/.env file with a line like:');
  console.error('   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<dbname>');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Successfully connected to MongoDB!');
  console.log('🗄️  Database:', mongoose.connection.name);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API base URL: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Troubleshooting tips:');
  console.log('   - Check your MONGODB_URI in .env file');
  console.log('   - Verify username and password');
  console.log('   - Ensure network access is configured in MongoDB Atlas');
  console.log('   - Check if your cluster is running');
});
