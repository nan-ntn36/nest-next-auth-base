import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const),
) {
  @IsMongoId({ message: 'Invalid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'User ID is required' })
  _id: string;
}
