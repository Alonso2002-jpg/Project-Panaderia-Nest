import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../../auth/auth.service'
import { User } from '../../user/entities/user.entity'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'La_Mejor_Panaderia_Del_Mundo_XD',
        'utf-8',
      ).toString('base64'),
    })
  }

  async validate(payload: User) {
    const id = payload.id
    return await this.authService.validateUser(id)
  }
}
