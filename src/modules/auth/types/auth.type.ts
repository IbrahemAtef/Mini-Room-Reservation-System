import { UserRole } from 'generated/prisma/enums';

export type JSON_Web_Token_Payload = {
  sub: string;
  role: UserRole;
};
