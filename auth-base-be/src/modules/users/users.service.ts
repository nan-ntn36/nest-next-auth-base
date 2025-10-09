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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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
}
