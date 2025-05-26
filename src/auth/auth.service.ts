import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { isUUID } from 'class-validator';
import * as moment from 'moment';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      console.log(password);
      console.log(userData);

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      console.log(user);

      await this.userRepository.save(user);
      delete user.password;
      console.log('Hasta awui bien');

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
      // TODO: Retornar el JWT de acceso
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  async GetAllUsers() {
    return await this.userRepository.find();
  }
  getProfile(user: User): User {
    return user;
  }
  getUser(user: User): string {
    return user.fullName.split(' ')[0];
  }
  async getConnectedUser() {
    const users = await this.GetAllUsers();
    const connectedUsers = users.filter((user) => user.socketId);
    return connectedUsers;
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, username } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { username },
      select: { password: true, id: true }, //! OJO!
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (username)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    const token = this.getJwtToken({ id: user.id });
    const expiresAt = moment().add(5, 'hour').unix() * 1000; // 1 hora    return {
    console.log(expiresAt);

    return {
      ...user,
      token: token,
      expireIn: expiresAt,
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findOneById(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid id');
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    return user;
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    console.log(error.detail);

    if (error.code === '23505')
      throw new BadRequestException({
        message: error.detail,
        alreadyExists: true,
      });

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
