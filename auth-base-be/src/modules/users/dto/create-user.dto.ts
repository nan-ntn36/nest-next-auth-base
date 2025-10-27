import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'name', example: 'John Doe' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
  @ApiProperty({ description: 'email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
  @ApiProperty({ description: 'password', example: 'password123' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
  @IsOptional()
  phone: string;
  @IsOptional()
  address: string;
  @IsOptional()
  image: string;
}
