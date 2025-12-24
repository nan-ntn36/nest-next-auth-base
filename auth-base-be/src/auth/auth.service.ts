import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword } from '@/helper/util';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new BadRequestException(`User not found with email: ${username}`);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(`Invalid password`);
    }
    return user;
  }

  async login(user: any) {
    // chuyển dữ liệu vào jwt (bên nhận được sẽ là trong validate của jwt.strategy.ts)
    const payload = { username: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }
}
