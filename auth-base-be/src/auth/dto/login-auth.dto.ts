// login.swagger.dto.ts
import { ApiProperty } from '@nestjs/swagger';
export class LoginSwaggerDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'User password',
  })
  password: string;
}
