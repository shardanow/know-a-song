import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRights = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRights) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    for (const right of requiredRights) {
      if (user.rights[right]) return true;
    }
    throw new ForbiddenException('You do not have the required permissions');
  }
}
