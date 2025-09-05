import { FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export abstract class BaseController {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  protected sendSuccess<T>(reply: FastifyReply, data: T, statusCode: number = 200) {
    return reply.code(statusCode).send(data);
  }

  protected sendError(reply: FastifyReply, message: string, statusCode: number = 500) {
    return reply.code(statusCode).send({
      error: this.getErrorTitle(statusCode),
      message,
    });
  }

  public sendValidationError(reply: FastifyReply, message: string) {
    return this.sendError(reply, message, 400);
  }

  protected sendNotFoundError(reply: FastifyReply, message: string = 'Resource not found') {
    return this.sendError(reply, message, 404);
  }

  protected sendUnauthorizedError(reply: FastifyReply, message: string = 'Unauthorized') {
    return this.sendError(reply, message, 401);
  }

  private getErrorTitle(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Validation Error';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
