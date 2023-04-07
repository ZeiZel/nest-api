import { Injectable } from '@nestjs/common';
import { TopLevelCategory, TopPageModel } from './top-page.model';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { addDays } from 'date-fns';
import { Types } from 'mongoose';

@Injectable()
export class TopPageService {
	constructor(
		@InjectModel(TopPageModel) private readonly topPageModel: ModelType<TopPageModel>,
	) {}

	async create(dto: CreateTopPageDto) {
		return this.topPageModel.create(dto);
	}

	async findById(id: string) {
		return this.topPageModel.findById(id).exec();
	}

	async findByAlias(alias: string) {
		return this.topPageModel.findOne({ alias }).exec();
	}

	async findAll() {
		return this.topPageModel.find({}).exec();
	}

	async findByCategory(firstCategory: TopLevelCategory) {
		return this.topPageModel
			.aggregate()
			.match({
				firstCategory,
			})
			.group({
				_id: { secondCategory: '$secondCategory' },
				pages: {
					$push: { alias: '$alias', title: '$title', _id: '$_id', category: '$category' },
				},
			})
			.exec();
	}

	async findByText(text: string) {
		return this.topPageModel.find({ $text: { $search: text, $caseSensitive: false } }).exec();
	}

	async deleteById(id: string) {
		return this.topPageModel.findByIdAndRemove(id).exec();
	}

	// так же сюда может прилететь не только строка, но и Types.ObjectId
	async updateById(id: string | Types.ObjectId, dto: CreateTopPageDto) {
		return this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

	// метод, который будет искать все те записи, нужные для обновления
	async findForHhUpdate(date: Date) {
		return this.topPageModel
			.find({
				firstCategory: 0,
				// условие на выборку даты
				$or: [
					// если есть запись даты обновления, то выполняем поиск
					{ 'hh.updatedAt': { $lt: addDays(date, -1) } },
					// если даты обновления нет
					{ 'hh.updatedAt': { $exists: false } },
				],
			})
			.exec();
	}
}
