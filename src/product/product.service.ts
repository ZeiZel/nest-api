import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ProductModel } from './product.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductDto } from './dto/find-product.dto';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel(ProductModel) private readonly productModel: ModelType<ProductModel>,
	) {}

	async create(dto: CreateProductDto) {
		return this.productModel.create(dto);
	}

	async findById(id: string) {
		return this.productModel.findById(id).exec();
	}

	async deleteById(id: string) {
		return this.productModel.findByIdAndDelete(id).exec();
	}

	async patchById(id: string, dto: CreateProductDto) {
		return this.productModel
			.findByIdAndUpdate(id, dto, {
				new: true, // запрашиваем возврат не нового, а старого документа
			})
			.exec();
	}

	async findWithReviews(dto: FindProductDto) {
		return this.productModel
			.aggregate([
				{ $match: { categories: dto.category } },
				{ $sort: { _id: 1 } },
				{ $limit: dto.limit },
				{
					$lookup: {
						from: 'Review',
						localField: '_id',
						foreignField: 'productId',
						as: 'reviews',
					},
				},
				{
					$addFields: {
						reviewCount: {
							$size: '$reviews',
						},
						reviewAvg: {
							$avg: '$reviews.rating',
						},
						// перезапишем вышеописанное поле обзора
						reviews: {
							// вставим сюда функцию
							$function: {
								// тело функции
								body: `function (reviews) {
									reviews.sort(
										(a, b) => new Date(b.createdAt) - new Date(b.createdAt),
									);
									return reviews;
								}`,
								// описываем массив аргументов функции
								args: ['$reviews'],
								// язык, на котором написана функция
								lang: 'js',
							},
						},
					},
				},
			])
			.exec();
	}
}
