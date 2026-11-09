import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class McpAuthGuard implements CanActivate {

  canActivate(
      context: ExecutionContext,
  ): boolean {

    const request =
        context.switchToHttp().getRequest();

    const apiKey =
        request.headers['api-key'];

    if (
        apiKey !== process.env.MCP_API_KEY
    ) {
      throw new UnauthorizedException(
          'Invalid API Key',
      );
    }

    return true;
  }
}