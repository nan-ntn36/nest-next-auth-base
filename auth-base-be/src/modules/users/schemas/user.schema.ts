import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;
  @Prop()
  name: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  phone: string;
  @Prop()
  address: string;
  @Prop()
  image: string;
  @Prop({ default: 'user' })
  role: string;
  @Prop({ default: 'local' })
  accountType: string;
  @Prop({ default: false })
  isActive: boolean;
  @Prop()
  codeId: string;
  @Prop()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
