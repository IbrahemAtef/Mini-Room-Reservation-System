import { userValidationSchema } from 'src/modules/user/util/user.validation.schema';
import { ZodType } from 'zod';
import { LoginDTO, RegisterDTO } from '../dto/auth.dto';

// register = base schema
export const registerValidationSchema =
  userValidationSchema satisfies ZodType<RegisterDTO>;

// login = pick email and password from base schema
export const loginValidationSchema = registerValidationSchema.pick({
  email: true,
  password: true,
}) satisfies ZodType<LoginDTO>;
