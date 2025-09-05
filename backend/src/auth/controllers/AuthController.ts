import bcrypt from "bcryptjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "../../common/controllers/BaseController";
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from "../types";

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

export class AuthController extends BaseController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password, organization } =
        request.body as RegisterData;

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return this.sendError(
          reply,
          "User with this email already exists",
          409
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Find existing organization by name first, then by domain
      const domain = email.split("@")[1];
      let organizationRecord = await this.prisma.organization.findFirst({
        where: {
          OR: [{ name: organization }, { domain }],
        },
      });

      // Create organization only if it doesn't exist
      if (!organizationRecord) {
        organizationRecord = await this.prisma.organization.create({
          data: {
            name: organization,
            domain,
          },
        });
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          organizationId: organizationRecord.id,
        },
        include: {
          organization: true,
        },
      });

      // Generate JWT
      const token = (request.server as any).jwt.sign({
        userId: user.id,
        email: user.email,
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      return this.sendSuccess(
        reply,
        {
          message: "User registered successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization.name,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
          },
          token,
        },
        201
      );
    } catch (error) {
      (request.server as any).log.error("Registration error:", error as Error);
      console.error("Detailed registration error:", error);
      return this.sendError(reply, `Failed to register user: ${(error as Error).message}`);
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as LoginData;

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });

      if (!user || !user.isActive) {
        return this.sendUnauthorizedError(reply, "Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.sendUnauthorizedError(reply, "Invalid email or password");
      }

      // Generate JWT
      const token = (request.server as any).jwt.sign({
        userId: user.id,
        email: user.email,
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return this.sendSuccess(reply, {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization.name,
          organizationId: user.organizationId,
        },
        token,
      });
    } catch (error) {
      (request.server as any).log.error("Login error:", error as Error);
      return this.sendError(reply, "Failed to login");
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;

      // Remove current session
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        await this.prisma.userSession.deleteMany({
          where: {
            userId,
            token,
          },
        });
      }

      return this.sendSuccess(reply, {
        message: "Logout successful",
      });
    } catch (error) {
      (request.server as any).log.error("Logout error:", error as Error);
      return this.sendError(reply, "Failed to logout");
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId, email } = request.user as any;

      // Generate new JWT
      const token = (request.server as any).jwt.sign({
        userId,
        email,
      });

      // Update session
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const oldToken = authHeader.replace("Bearer ", "");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.userSession.updateMany({
          where: {
            userId,
            token: oldToken,
          },
          data: {
            token,
            expiresAt,
          },
        });
      }

      return this.sendSuccess(reply, {
        message: "Token refreshed successfully",
        token,
      });
    } catch (error) {
      (request.server as any).log.error("Token refresh error:", error as Error);
      return this.sendError(reply, "Failed to refresh token");
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.user as any;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true,
        },
      });

      if (!user) {
        return this.sendNotFoundError(reply, "User not found");
      }

      return this.sendSuccess(reply, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization.name,
          organizationId: user.organizationId,
          phone: user.phone,
          avatar: user.avatar,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      (request.server as any).log.error("Get profile error:", error as Error);
      return this.sendError(reply, "Failed to get user profile");
    }
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { currentPassword, newPassword } =
        request.body as ChangePasswordData;
      const { userId } = request.user as any;

      // Get user with password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        return this.sendNotFoundError(reply, "User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return this.sendUnauthorizedError(
          reply,
          "Current password is incorrect"
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      return this.sendSuccess(reply, {
        message: "Password changed successfully",
      });
    } catch (error) {
      (request.server as any).log.error(
        "Change password error:",
        error as Error
      );
      return this.sendError(reply, "Failed to change password");
    }
  }
}
