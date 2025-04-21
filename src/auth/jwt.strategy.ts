import { UserService } from './../services/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: 'JWT_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    const { ...result } = user;
    return result;
  }
}
