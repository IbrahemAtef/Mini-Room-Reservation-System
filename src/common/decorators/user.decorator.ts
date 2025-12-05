import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserResponseDTO } from 'src/modules/auth/dto/auth.dto';

type RequestUser = UserResponseDTO['user'];
export const User = createParamDecorator(
  (
    key: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user!;

    // If @User() → return full user object
    // If @User('id') → return user.id
    return key ? user[key] : user;
  },
);
