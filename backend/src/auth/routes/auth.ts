import type { FastifyPluginAsync } from "fastify";
import Joi from "joi";
import { AuthController } from "../controllers/AuthController";

// Type definitions
type ErrorReply = { error: string; message: string };

interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organization: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Swagger schemas
const userSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    organizationId: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const authResponseSchema = {
  type: "object",
  properties: {
    user: userSchema,
    token: { type: "string" },
  },
};

const registerDataSchema = {
  type: "object",
  required: ["name", "email", "password", "organization"],
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    organization: { type: "string", minLength: 2, maxLength: 100 },
  },
};

const loginDataSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
};

const changePasswordDataSchema = {
  type: "object",
  required: ["currentPassword", "newPassword"],
  properties: {
    currentPassword: { type: "string" },
    newPassword: { type: "string", minLength: 8 },
  },
};

const errorReplySchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
};

const messageResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
};

const tokenResponseSchema = {
  type: "object",
  properties: {
    token: { type: "string" },
  },
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  organization: Joi.string().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController((fastify as any).prisma);

  // Register
  fastify.post<{
    Body: RegisterData;
    Reply: AuthResponse | ErrorReply;
  }>(
    "/register",
    {
      schema: {
        body: registerDataSchema,
        response: {
          200: authResponseSchema,
          400: errorReplySchema,
          409: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      const { error } = registerSchema.validate(request.body);
      if (error) {
        return authController.sendValidationError(
          reply,
          error.details[0].message
        );
      }

      return authController.register(request, reply);
    }
  );

  // Login
  fastify.post<{
    Body: LoginData;
    Reply: AuthResponse | ErrorReply;
  }>(
    "/login",
    {
      schema: {
        body: loginDataSchema,
        response: {
          200: authResponseSchema,
          401: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      const { error } = loginSchema.validate(request.body);
      if (error) {
        return authController.sendValidationError(
          reply,
          error.details[0].message
        );
      }

      return authController.login(request, reply);
    }
  );

  // Logout
  fastify.post<{
    Reply: { message: string } | ErrorReply;
  }>(
    "/logout",
    {
      preHandler: [(fastify as any).authenticate],
      schema: {
        response: {
          200: messageResponseSchema,
          401: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      return authController.logout(request, reply);
    }
  );

  // Refresh token
  fastify.post<{
    Reply: { token: string } | ErrorReply;
  }>(
    "/refresh",
    {
      preHandler: [(fastify as any).authenticate],
      schema: {
        response: {
          200: tokenResponseSchema,
          401: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      return authController.refreshToken(request, reply);
    }
  );

  // Get current user profile
  fastify.get<{
    Reply: { user: User } | ErrorReply;
  }>(
    "/me",
    {
      preHandler: [(fastify as any).authenticate],
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              user: userSchema,
            },
          },
          401: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      return authController.getCurrentUser(request, reply);
    }
  );

  // Change password
  fastify.patch<{
    Body: ChangePasswordData;
    Reply: { message: string } | ErrorReply;
  }>(
    "/change-password",
    {
      preHandler: [(fastify as any).authenticate],
      schema: {
        body: changePasswordDataSchema,
        response: {
          200: messageResponseSchema,
          400: errorReplySchema,
          401: errorReplySchema,
        },
      },
    },
    async (request, reply) => {
      const { error } = changePasswordSchema.validate(request.body);
      if (error) {
        return authController.sendValidationError(
          reply,
          error.details[0].message
        );
      }

      return authController.changePassword(request, reply);
    }
  );
};

export default authRoutes;
