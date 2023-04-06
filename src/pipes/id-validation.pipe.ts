import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { ID_VALIDATION_ERROR } from './id-validation.constants';

// создадим класс, который будет экстендится от трансформа пайпа
@Injectable() // для попадения в дерево зависимостей
export class IdValidationPipe implements PipeTransform {
	// далее реализуем метод трансформации
	// 1арг - сами данные, 2 - метаданные о том, где располагаются эти данные
	transform(value: string, metadata: ArgumentMetadata) {
		// данные обязательно должны приходить к нам из param
		if (metadata.type != 'param') {
			return value;
		}

		// далее нужно проверить значения на валидность
		// если значение не подходит под ObjectID
		if (!Types.ObjectId.isValid(value)) {
			throw new BadRequestException(ID_VALIDATION_ERROR);
		}

		return value;
	}
}
