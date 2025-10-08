import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
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
