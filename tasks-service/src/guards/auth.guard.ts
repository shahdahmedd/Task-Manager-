import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.get(`${authServiceUrl}/auth/validate`, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.data.valid) {
        request.user = response.data.user;
        return true;
      }

      throw new UnauthorizedException('Invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new UnauthorizedException('Authentication service unavailable');
    }
  }
}

