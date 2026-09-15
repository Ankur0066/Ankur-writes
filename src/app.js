const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const initAdmin = require('./initAdmin');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db');
const app = express();

app.use(helmet());



app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger/OpenAPI setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Blog Backend API',
    version: '1.0.0',
    description: 'API documentation for the blog backend'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 4000}/api`,
    },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'], // scan route files for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.get('/', (req, res) => res.json({ message: 'Blog backend API is running' }));

app.get("/health/db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.status(200).json({
      success: true,
      database: "connected",
      result: rows,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      success: false,
      database: "failed",
      error: error.message,
      code: error.code,
    });
  }
});

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use(errorHandler);

// initialize admin user if provided
initAdmin().catch((err) => console.error('Admin init error', err));

module.exports = app;
