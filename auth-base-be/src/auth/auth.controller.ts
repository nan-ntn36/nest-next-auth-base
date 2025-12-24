import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './passport/local/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt/jwt-auth.guard';
import { Public } from '@/decorator/customizeMetadata';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginSwaggerDto } from './dto/login-auth.dto';
import { BrevoProviders } from '@/providers/brevoProviders';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly brevoProviders: BrevoProviders,
  ) {}

  // login -> local strategy(1) -> service(validateUser)(2) -> service(login)(3)

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @ApiBody({ type: LoginSwaggerDto })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  // profile -> jwt strategy -> validate(jwt.strategy.ts)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @Get('mail')
  @Public()
  async sendTestEmail() {
    const custumSubject =
      'To activate your account, please use the following activation code';
    const htmlContent = `
       <!DOCTYPE html>
<html>

<head>
    <title>Hỏi Dân IT Activation Email</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body
    style="margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; background-color: #FAFAFA; color: #222222;">
    <div style="max-width: 600px; margin: 0 auto;">
        Test email
    </div>
</body>

</html>
    `;
    await this.brevoProviders.sendEmail(
      'ntrungnghia.job@gmail.com',
      custumSubject,
      htmlContent,
    );
    return { message: 'Test email sent successfully' };
  }
}
