import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getModelToken } from 'nestjs-typegoose';
import { Types } from 'mongoose';

describe('ReviewService', () => {
	let service: ReviewService;

	const exec = { exec: jest.fn() };
	const reviewRepositoryFactory = () => ({ find: () => exec });

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReviewService,
				{
					// эта функция будет возвращать моковые зависимости для тестов
					useFactory: reviewRepositoryFactory,
					// здесь мы провайдим токен, который вставляем в модель
					provide: getModelToken('ReviewModel'), // получаем токен указанной модели
				},
			],
		}).compile();

		service = module.get<ReviewService>(ReviewService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('findByProduct working', async () => {
		// генерируем id
		const id = new Types.ObjectId().toHexString();

		// создаём моковые данные
		reviewRepositoryFactory()
			.find()
			// возвращаем единоразово моковые данные с id продукта
			.exec.mockReturnValueOnce([{ productId: id }]);

		// ищем продукт по id в моковых данных
		const res = await service.findByProductId(id);

		// мы ожидаем, что свойство id продукта нулевого элемента будет = id
		expect(res[0].productId).toBe(id);
	});
});
