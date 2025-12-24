import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from '@/helper/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { isEmail } from 'class-validator';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { BrevoProviders } from '@/providers/brevoProviders';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private brevoProvider: BrevoProviders,
    private configService: ConfigService,
  ) {}

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email });
    return !!user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, name, email, phone, address, image } = createUserDto;

    const emailExists = await this.isEmailExist(email);
    if (emailExists) {
      throw new BadRequestException(`Email already exists: ${email}`);
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      image,
    });
    createdUser.save();
    return createdUser;
  }

  async findAll(
    query: string,
    pageSize: number,
    current: number,
  ): Promise<any> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItem = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItem / pageSize);
    const skipItems = (current - 1) * pageSize;

    const users = await this.userModel
      .find(filter)
      .sort(sort as any)
      .skip(skipItems)
      .limit(pageSize)
      .select('-password -__v');
    return {
      users,
      totalPage,
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid MongoDB ObjectId: ${id}`);
    }
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException(`Email is required`);
    }
    if (isEmail(email) === false) {
      throw new BadRequestException(`Invalid email format: ${email}`);
    }
    const user = await this.userModel.findOne({ email }).select('-__v').lean();
    if (!user)
      throw new BadRequestException(`User not found with email: ${email}`);
    return user;
  }

  async update(updateUserDto: UpdateUserDto) {
    const { _id, ...updateData } = updateUserDto;
    return await this.userModel.updateOne({ _id: _id }, { ...updateData });
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid MongoDB ObjectId: ${id}`);
    }
    if (!(await this.userModel.exists({ _id: id }))) {
      throw new BadRequestException(`User not found with id: ${id}`);
    }
    return await this.userModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
  }

  async handleRegister(createAuthDto: CreateAuthDto) {
    const { password, name, email } = createAuthDto;

    const emailExists = await this.isEmailExist(email);
    if (emailExists) {
      throw new BadRequestException(`Email already exists: ${email}`);
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      isActive: false,
      codeId: uuidv4(),
      codeExpired: dayjs().add(5, 'minute').toDate(),
    });

    const custumSubject =
      'To activate your account, please use the following activation code';
    const htmlContent = `
       <!DOCTYPE html>
<html>

<head>
    <title> Activation Email</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body
    style="margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; background-color: #FAFAFA; color: #222222;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0070f3; padding: 24px; color: #ffffff;">
            <h1
                style="font-size: 24px; font-weight: 700; line-height: 1.25; margin-top: 0; margin-bottom: 15px; text-align: center;">
                Welcome to @hoidanit</h1>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
            <p style="margin-top: 0; margin-bottom: 24px;">Hello ${user.name},</p>
            <p style="margin-top: 0; margin-bottom: 24px;">Thank you for registering with @ngia. To activate your
                account, please use the following activation code:</p>
            <h2
                style="font-size: 20px; font-weight: 700; line-height: 1.25; margin-top: 0; margin-bottom: 15px; text-align: center;">
                ${user.codeId}</h2>
            <p style="margin-top: 0; margin-bottom: 24px;">Please enter this code on the activation page within the next
                5 minutes.</p>
            <p style="margin-top: 0; margin-bottom: 24px;">If you did not register for a @ngia account, please
                ignore this email.</p>
        </div>
        <div style="background-color: #f6f6f6; padding: 24px;">
            <p style="margin-top: 0; margin-bottom: 24px;">
                If you have any questions, please don't hesitate to contact
                us at <a href="" target="_blank"
                    style="color: #000; text-decoration:none;">@ngia
                </a>
            </p>
        </div>
    </div>
</body>

</html>
    `;
    //Gọi tới Provider gửi mail
    await this.brevoProvider.sendEmail(user.email, custumSubject, htmlContent);
    return {
      _id: user._id,
    };
  }
}
