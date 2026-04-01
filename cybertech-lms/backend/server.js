const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const fs       = require('fs');

dotenv.config();

const app = express();

// Ensure uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/trainers',    require('./routes/trainers'));
app.use('/api/materials',   require('./routes/materials'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/batches',     require('./routes/batches'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB Connected'); app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`)); })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = app;
