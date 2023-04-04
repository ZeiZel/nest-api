// пишем провайдер, который экстендится от паспортной стратегии
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel } from '../user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			// откуда мы получаем JWT (из хедера запроса по Bearer)
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// игнорируем завершаемость
			ignoreExpiration: true,
			// получаем секрет
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	// тут мы опишем дополнительную валидацию (так как валидация прошла до этого момента)
	// в методе login сервиса аутентификации мы зашифровали только emailс помощью JWT
	async validate({ email }: Pick<UserModel, 'email'>) {
		// тут можно просто вернуть email, так как вся валидация пройдёт уже тогда, когда эти данные попадут в стратегию
		return email;
	}
}
