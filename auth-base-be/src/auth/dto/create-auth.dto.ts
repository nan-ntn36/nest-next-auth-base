import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: 'email', example: 'admin@example.com' })
  @IsNotEmpty({ message: 'is not empty email' })
  email: string;
  @ApiProperty({ description: 'password', example: 'password123' })
  @IsNotEmpty({ message: 'is not empty password' })
  password: string;
  @ApiProperty({ description: 'name', example: 'John Doe' })
  @IsOptional()
  name?: string;
}
