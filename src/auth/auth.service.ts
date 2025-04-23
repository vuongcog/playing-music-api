import { User } from './../entities/user.entity';
import { console } from 'node:inspector/promises';
import { RegisterDto } from './dto/auth.register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUserName(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const exitingUser = await this.userService.findByUserNameForRegister(
      registerDto.username,
    );
    if (exitingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    const existingEmail = await this.userService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role,
    });

    const { password, ...result } = newUser;

    const payload = { username: newUser.username, sub: newUser.id };
    return {
      user: result,
      access_token: this.jwtService.sign(payload),
    };
  }
}
