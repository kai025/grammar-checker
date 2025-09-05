import type { FastifyPluginAsync } from "fastify";
import Joi from "joi";
import { UsersController } from "../controllers/UsersController";

// Type definitions
type ErrorReply = { error: string; message: string };

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
}

interface UserStats {
  grammarAnalyses: number;
}

interface UpdateProfileData {
  name?: string;
  phone?: string | null;
  organization?: string | null;
}

interface DeleteAccountData {
  password: string;
  confirmation: string;
}

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  const usersController = new UsersController((fastify as any).prisma);

  // Add authentication to all routes
  fastify.addHook("preHandler", (fastify as any).authenticate);

  // Update user profile
  fastify.patch<{
    Body: UpdateProfileData;
    Reply: { user: User } | ErrorReply;
  }>("/profile", async (request, reply) => {
    const updateProfileSchema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      phone: Joi.string().max(20).optional().allow(null, ""),
      organization: Joi.string().max(100).optional().allow(null, ""),
    });

    const { error } = updateProfileSchema.validate(request.body);
    if (error) {
      return usersController.sendValidationError(
        reply,
        error.details[0].message
      );
    }

    return usersController.updateProfile(request, reply);
  });

  // Get user sessions
  fastify.get<{
    Reply: { sessions: UserSession[] } | ErrorReply;
  }>("/sessions", async (request, reply) => {
    return usersController.getSessions(request, reply);
  });

  // Revoke session
  fastify.delete<{
    Params: { sessionId: string };
    Reply: { message: string } | ErrorReply;
  }>("/sessions/:sessionId", async (request, reply) => {
    return usersController.revokeSession(request, reply);
  });

  // Delete user account
  fastify.delete<{
    Body: DeleteAccountData;
    Reply: { message: string } | ErrorReply;
  }>("/account", async (request, reply) => {
    const deleteAccountSchema = Joi.object({
      password: Joi.string().required(),
      confirmation: Joi.string().valid("DELETE_MY_ACCOUNT").required(),
    });

    const { error } = deleteAccountSchema.validate(request.body);
    if (error) {
      return usersController.sendValidationError(
        reply,
        error.details[0].message
      );
    }

    return usersController.deleteAccount(request, reply);
  });

  // Get organization users
  fastify.get<{
    Reply: { users: User[] } | ErrorReply;
  }>("/organization", async (request, reply) => {
    return usersController.getOrganizationUsers(request, reply);
  });

  // Get user statistics
  fastify.get<{
    Reply: { stats: UserStats } | ErrorReply;
  }>("/stats", async (request, reply) => {
    return usersController.getUserStats(request, reply);
  });

  // Upload avatar (placeholder - would need proper file handling)
  fastify.post<{
    Reply: { message: string; avatarUrl: string } | ErrorReply;
  }>("/avatar", async (request, reply) => {
    return usersController.uploadAvatar(request, reply);
  });
};

export default usersRoutes;
