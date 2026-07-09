import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...rights: string[]) => SetMetadata(ROLES_KEY, rights);
