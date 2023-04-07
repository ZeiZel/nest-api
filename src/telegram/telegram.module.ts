import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ITelegramModuleAsyncOptions } from './telegram.interface';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';

@Global()
@Module({})
export class TelegramModule {
	// тут мы создаём асинхронно наш модуль
	static forRootAsync(options: ITelegramModuleAsyncOptions): DynamicModule {
		// создаём асинхронные опции в качестве провайдера
		// в качестве провайдера для того, чтобы в любом месте его можно было достать по токену TELEGRAM_MODULE_OPTIONS
		const asyncOptions = this.createAsyncOptionsProvider(options);
		return {
			module: TelegramModule,
			imports: options.imports,
			providers: [TelegramService, asyncOptions],
			exports: [TelegramService],
		};
	}

	// эта функция будет возвращать готовый провайдер, в который будет внедрены useFactory и опции
	private static createAsyncOptionsProvider(options: ITelegramModuleAsyncOptions): Provider {
		return {
			// провайдим опции по токену
			provide: TELEGRAM_MODULE_OPTIONS,
			// используем фэктори
			useFactory: async (...args: any[]) => {
				// тут мы вызываем фэктори, который передали уже внутри options для формирования конфигурации
				const config = await options.useFactory(...args);
				return config;
			},
			// инжектим внутрь провайдера необходимые зависимости (например, если нам нужен будет ConfigService)
			inject: options.inject || [],
		};
	}
}
