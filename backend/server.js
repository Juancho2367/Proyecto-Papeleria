const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
// Nota: En Vercel, la conexión debe manejarse con cuidado para no agotar el pool,
// pero connectDB ya maneja la conexión básica.
connectDB();

const app = express();

// --- SEGURIDAD ---

// 1. Helmet: Set security headers
app.use(helmet());

// 2. Cors: Configuración explícita (Ajústala con tu dominio de frontend en producción)
app.use(cors({
  origin: '*', // En producción, cambia esto por tu dominio de Vercel Frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting: Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 peticiones por IP por ventana
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos'
});
// Aplicar rate limiting a todas las rutas que empiezan por /api
app.use('/api', limiter);

// 4. Data Sanitization: NoSQL Injection protection
app.use(mongoSanitize());

// --- FIN SEGURIDAD ---

app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body para prevenir DoS

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// Root route for testing
app.get('/', (req, res) => {
  res.send('API Papelería Running...');
});

const PORT = process.env.PORT || 5001;

// Vercel Serverless Export
// Si estamos en entorno local, escuchamos en el puerto.
// Si estamos en Vercel, exportamos la app para que Vercel la maneje como Serverless Function.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;