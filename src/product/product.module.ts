import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { ProductModel } from './product.model';

@Module({
	controllers: [ProductController],
	imports: [
		// подключаем локально для модуля модели
		TypegooseModule.forFeature([
			{
				typegooseClass: ProductModel, // класс модели
				// опции схемы данных
				schemaOptions: {
					collection: 'Product', // имя коллекции
				},
			},
		]),
	],
})
export class ProductModule {}
