import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import Fastify, { type FastifyInstance } from "fastify";

// Load environment variables
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
    trustProxy: true,
  });

  // Security plugins
  await app.register(import("@fastify/helmet"), {
    contentSecurityPolicy: false, // Disable CSP for API
  });

  await app.register(import("@fastify/cors"), {
    origin: (origin, cb) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://grammar-checker.vercel.app",
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      app.log.warn(`CORS blocked request from origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Sensible plugin for HTTP errors and other utilities
  await app.register(import("@fastify/sensible"));

  // JWT plugin
  await app.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET || "super-secret-key",
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  });

  // Multipart plugin for file uploads
  await app.register(import("@fastify/multipart"), {
    limits: {
      fileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || "10485760"), // 10MB
    },
  });

  // Add Prisma to Fastify instance
  app.decorate("prisma", prisma);

  // Authentication decorator
  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      const decoded = await request.jwtVerify();
      // Ensure user object is properly set
      request.user = decoded;
    } catch (err: any) {
      // If token is expired, try to refresh it
      if (err.message === "Authorization token expired") {
        try {
          const refreshResponse = await app.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: request.cookies,
          });

          if (refreshResponse.statusCode === 200) {
            const { token } = JSON.parse(refreshResponse.body);
            // Set the new token in the request for the current operation
            request.headers.authorization = `Bearer ${token}`;
            await request.jwtVerify();
            return;
          }
        } catch {
          // Refresh failed, continue to unauthorized response
        }
      }

      // Throw instead of sending the response directly so callers can
      // optionally catch and ignore auth failures (e.g., public endpoints)
      throw app.httpErrors.unauthorized("Invalid or missing token");
    }
  });

  // Health check
  app.get("/health", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch {
      throw app.httpErrors.serviceUnavailable("Database connection failed");
    }
  });

  // Register routes by domain
  await app.register(import("./auth/routes/auth"), { prefix: "/api/auth" });
  await app.register(import("./users/routes/users"), { prefix: "/api/users" });
  await app.register(import("./grammar/routes/grammar.routes"), {
    prefix: "/api/grammar",
  });

  // TODO: Move remaining routes to their respective domains
  // await app.register(import("./routes/workflows"), { prefix: "/api/workflows" });
  // await app.register(import("./routes/forecasts"), { prefix: "/api/forecasts" });
  // await app.register(import("./routes/financial-data"), { prefix: "/api/financial-data" });
  // await app.register(import("./routes/financial"), { prefix: "/api/financial" });
  // await app.register(import("./routes/alerts"), { prefix: "/api/alerts" });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    // Validation errors
    if (error.validation) {
      return reply.code(400).send({
        error: "Validation Error",
        message: "Request validation failed",
        details: error.validation,
      });
    }

    // JWT errors
    if (error.message === "Authorization token expired") {
      return reply.code(401).send({
        error: "Token Expired",
        message: "Your session has expired. Please log in again.",
      });
    }

    // Prisma errors
    if (error.code === "P2002") {
      return reply.code(409).send({
        error: "Conflict",
        message: "A record with this data already exists",
      });
    }

    if (error.code === "P2025") {
      return reply.code(404).send({
        error: "Not Found",
        message: "The requested resource was not found",
      });
    }

    // Default error
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Internal Server Error" : error.message;

    return reply.code(statusCode).send({
      error: statusCode === 500 ? "Internal Server Error" : error.name,
      message,
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
};

const start = async (): Promise<void> => {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || "3001");
    const host = "0.0.0.0";

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { buildApp };
