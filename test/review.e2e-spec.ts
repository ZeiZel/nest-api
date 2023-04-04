import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';

const productId = new Types.ObjectId().toHexString();

const testDto: CreateReviewDto = {
	name: 'Olek',
	rating: 3.5,
	title: '',
	description: '',
	productId,
};

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string; // id созданного объекта

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// передаём запрос на создание нового обзора
	it('/review/create (POST) - success', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send(testDto) // отправляем объект на сервер
			.expect(201)
			.then(({ body }: request.Response) => {
				// присваиваем id ответа
				createdId = body._id;

				// описываем, что мы ожидаем наличие значения
				expect(createdId).toBeDefined();
			});
	});

	it('/review/create (POST) - fail', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send({ ...testDto, rating: 0 })
			.expect(400)
			.then(({ body }: request.Response) => {
				console.log(body);
			});
	});

	// передаём запрос на получение нового обзора - успешный запрос
	it('/review/getByProduct/:productId (GET) - success', async () => {
		return request(app.getHttpServer())
			.get('/review/getByProduct/' + productId)
			.expect(200)
			.then(({ body }: request.Response) => {
				// так как нам приходит массив из одного элемента, то длина должна быть = 1
				expect(body.length).toBe(1);
			});
	});

	// передаём запрос на получение нового обзора, но ответ будет с ошибкой
	it('/review/getByProduct/:productId (GET) - fail', async () => {
		return request(app.getHttpServer())
			.get('/review/getByProduct/' + new Types.ObjectId().toHexString())
			.expect(200)
			.then(({ body }: request.Response) => {
				// тут нам уже должен прийти пустой массив
				expect(body.length).toBe(0);
			});
	});

	// передаём запрос на удаление нового обзора
	it('/review/:id (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/review/' + createdId)
			.expect(200);
	});

	// передаём запрос на удаление нового обзора, но с ошибкой
	it('/review/:id (DELETE) - fail', () => {
		return (
			request(app.getHttpServer())
				.delete('/review/' + new Types.ObjectId().toHexString())
				// ожидаем получить 404 NOT_FOUND
				.expect(404, {
					statusCode: 404,
					message: REVIEW_NOT_FOUND,
				})
		);
	});

	// после всех тестов
	afterAll(() => {
		// отключаемся от БД
		disconnect();
	});
});
