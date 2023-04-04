import { TypegooseModuleOptions } from 'nestjs-typegoose';
import { ConfigService } from '@nestjs/config';

const getMongoString = (configService: ConfigService) =>
	'mongodb://' +
	configService.get('MONGO_LOGIN') +
	':' +
	configService.get('MONGO_PASSWORD') +
	'@' +
	configService.get('MONGO_HOST') +
	':' +
	configService.get('MONGO_PORT') +
	'/' +
	configService.get('MONGO_AUTHDATABASE');

const getMongoOptions = () => ({});

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<TypegooseModuleOptions> => {
	return {
		uri: getMongoString(configService),
		...getMongoOptions(),
	};
};
