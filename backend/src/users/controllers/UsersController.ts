import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../../common/controllers/BaseController";
import { getOrganizationId } from "../../common/middleware/auth";

interface UpdateProfileData {
  name?: string;
  phone?: string;
  organization?: string;
}

export class UsersController extends BaseController {
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;
      const updateData = request.body as UpdateProfileData;

      // Remove organization from updateData since it's a relation
      const { organization: _, ...userUpdateData } = updateData;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...userUpdateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organization: true,
          phone: true,
          avatar: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.sendSuccess(reply, {
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      (request.server as any).log.error("Update profile error:", error);
      return this.sendError(reply, "Failed to update profile");
    }
  }

  async getSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;

      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          token: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Hide full token, only show last 4 characters
      const safeSessions = sessions.map((session: any) => ({
        ...session,
        token: `****${session.token.slice(-4)}`,
      }));

      return this.sendSuccess(reply, {
        sessions: safeSessions,
      });
    } catch (error) {
      (request.server as any).log.error("Get sessions error:", error);
      return this.sendError(reply, "Failed to get sessions");
    }
  }

  async getOrganizationUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;
      const organizationId = await getOrganizationId(this.prisma, userId);

      const users = await this.prisma.user.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      });

      return this.sendSuccess(reply, {
        users,
      });
    } catch (error) {
      (request.server as any).log.error("Get organization users error:", error);
      return this.sendError(reply, "Failed to get organization users");
    }
  }

  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;

      const [grammarAnalysesCount] = await Promise.all([
        this.prisma.grammarAnalysis.count({ where: { userId } }),
      ]);

      return this.sendSuccess(reply, {
        stats: {
          grammarAnalyses: grammarAnalysesCount,
        },
      });
    } catch (error) {
      (request.server as any).log.error("Get stats error:", error);
      return this.sendError(reply, "Failed to get user statistics");
    }
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;
      const data = await (request as any).file();

      if (!data) {
        return this.sendValidationError(reply, "No file uploaded");
      }

      // Validate file type
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return this.sendValidationError(
          reply,
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        );
      }

      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (data.file.readableLength > maxSize) {
        return this.sendValidationError(
          reply,
          "File size too large. Maximum size is 2MB."
        );
      }

      // In a real implementation, you would:
      // 1. Save the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // 2. Resize/optimize the image
      // 3. Update the user's avatar URL in the database

      // For now, we'll just return a placeholder response
      const avatarUrl = `https://example.com/avatars/${userId}.jpg`; // Placeholder

      await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      });

      return this.sendSuccess(reply, {
        message: "Avatar uploaded successfully",
        avatarUrl,
      });
    } catch (error) {
      (request.server as any).log.error("Upload avatar error:", error);
      return this.sendError(reply, "Failed to upload avatar");
    }
  }

  async revokeSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.params as { sessionId: string };
      const { userId } = request.user as any;

      await this.prisma.userSession.deleteMany({
        where: {
          id: sessionId,
          userId,
        },
      });

      return this.sendSuccess(reply, {
        message: "Session revoked successfully",
      });
    } catch (error) {
      (request.server as any).log.error("Revoke session error:", error);
      return this.sendError(reply, "Failed to revoke session");
    }
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { password } = request.body as { password: string };
      const { userId } = request.user as any;

      // Get user and verify password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return this.sendNotFoundError(reply, "User not found");
      }

      const bcrypt = require("bcryptjs");
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.sendValidationError(reply, "Password is incorrect");
      }

      // Soft delete - deactivate account instead of hard delete
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
          updatedAt: new Date(),
        },
      });

      // Delete all sessions
      await this.prisma.userSession.deleteMany({
        where: { userId },
      });

      return this.sendSuccess(reply, {
        message: "Account deactivated successfully",
      });
    } catch (error) {
      (request.server as any).log.error("Delete account error:", error);
      return this.sendError(reply, "Failed to delete account");
    }
  }
}
