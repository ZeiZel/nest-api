import { AuthGuard } from '@nestjs/passport';

// далее мы создаём тот же класс AuthGuard с типом jwt, только переименовываем его для удобства в JwtAuthGuard
export class JwtAuthGuard extends AuthGuard('jwt') {}
