import * as argon from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'generated/prisma/enums';
import { removeFields } from 'src/common/utils/object.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async register(registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    // hash password
    const hashedPassword = await this.hashPassword(registerDTO.password);
    // store user db with hashed password
    const createdUser = await this.userService.create({
      ...registerDTO,
      password: hashedPassword,
    });
    // generate jwt token
    const token = this.generateJwtToken(createdUser.id, createdUser.role);
    // return user data + token
    return {
      user: removeFields(createdUser, ['password']),
      token,
    };
  }

  async login(loginDTO: LoginDto): Promise<UserResponseDTO> {
    // find user by email
    const foundUser = await this.userService.findByEmail(loginDTO.email);

    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // flag if policies allow this
    // if (foundUser.isDeleted) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    // verify password with argon
    const isPasswordValid = await this.verifyPassword(
      loginDTO.password,
      foundUser.password,
    );
    // throw error if not match
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // generate jwt token
    const token = this.generateJwtToken(foundUser.id, foundUser.role);
    // return user data + token
    return {
      user: removeFields(foundUser, ['password']),
      token,
    };
  }

  validate(userPayload: UserResponseDTO['user']) {
    // generate jwt token
    const token = this.generateJwtToken(userPayload.id, userPayload.role);
    // return user data + token
    return {
      user: userPayload,
      token,
    };
  }

  private hashPassword(password: string) {
    return argon.hash(password);
  }

  private verifyPassword(password: string, hashedPassword: string) {
    return argon.verify(hashedPassword, password);
  }

  private generateJwtToken(userId: string, role: UserRole) {
    return this.jwtService.sign(
      { sub: userId, role },
      {
        expiresIn: '30d',
      },
    );
  }
}
