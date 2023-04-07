import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { API_URL, CLUSTER_FIND_ERROR, SALARY_CLUSTER_ID } from './hh.constants';
import { HhResponse } from './hh.models';
import { HhData } from '../top-page/top-page.model';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HhService {
	private readonly token: string;

	constructor(
		// просто инжектим сервис конфигурации без реализации forRootAsync
		private readonly configService: ConfigService,
		// Инжектим сервис для http-запросов
		private readonly httpService: HttpService,
	) {
		// получаем токен из env
		this.token = this.configService.get('HH_TOKEN') ?? '';
	}

	// тут мы будем получать данные с АПИ хх.ру
	async getData(text: string) {
		try {
			// lastValueFrom кастует вложенный в него код в Observable и ждёт получения от него данных
			const { data } = await lastValueFrom(
				// тут мы отправляем запрос на получение ответа от hh.ru
				this.httpService.get<HhResponse>(API_URL.vacancies, {
					// параметры запроса
					params: {
						// текст запроса ровно тот, который пришёл
						text,
						// информацию мы хотим получать по кластерам
						clusters: true,
					},
					// заголовки
					headers: {
						// пользователь, который запрашивает данные
						'User-Agent': 'GainTop/2.3 (smoli@gmail.com)',
						// авторизация запроса
						Authorization: 'Bearer ' + this.token,
					},
				}),
			);

			// возвращаем отпаршенные даныне
			return this.parseData(data);
		} catch (e) {
			// если получим ошибку, то нужно будет её вывести
			Logger.error(e);
		}
	}

	// тут мы будем парсить полученные данные
	private parseData(data: HhResponse): HhData {
		// ищем кластер, id которого = salary
		const salaryCluster = data.clusters.find((c) => c.id === SALARY_CLUSTER_ID);

		// если кластер не найден, то нужно будет выкинуть ошибку
		if (!salaryCluster) {
			throw new Error(CLUSTER_FIND_ERROR);
		}

		// зарплата джуна
		// выбираем вторую запись из полученного массива зарплат
		const juniorSalary = this.getSalaryFromString(salaryCluster.items[1].name);

		// зарплата мидла
		const middleSalary = this.getSalaryFromString(
			// берём зарплату из середины списка
			salaryCluster.items[Math.ceil(salaryCluster.items.length / 2)].name,
		);

		// зарплата сеньора
		const seniorSalary = this.getSalaryFromString(
			// выбираем из списка самую высокую зарплату
			salaryCluster.items[salaryCluster.items.length - 1].name,
		);

		return {
			// количество вакансий
			count: data.found,
			// зарплаты
			juniorSalary,
			middleSalary,
			seniorSalary,
			// дата обновления
			updatedAt: new Date(),
		};
	}

	// тут мы будем получать зарплату цифрой из полученного ответа
	private getSalaryFromString(s: string): number {
		// выбираем несколько подряд идущих чисел
		const numberRegExp = /(\d+)/g;

		// сохраняем все совпадения по regexp
		const res = s.match(numberRegExp);

		// если результата нет
		if (!res) {
			return 0;
		}

		// если всё ок, то вернём число
		return Number(res[0]);
	}
}
