import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// декоратор для получения почты из запроса
export const UserEmail = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	// тут мы получаем тот запрос, который прилетел в роут
	const request = ctx.switchToHttp().getRequest();

	// далее возвращаем пользователя, который состоит из чистого нашего email
	return request.user;
});
