import {
	Controller,
	HttpCode,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileElementResponse } from './dto/file-element.response';
import { FilesService } from './files.service';
import { MFile } from './mfile.class';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('files'))
	async uploadFiles(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponse[]> {
		// сохраняем в контроллер массив изображений
		const saveArray: MFile[] = [new MFile(file)];

		// проверяем, является ли файл изображением
		if (file.mimetype.includes('image')) {
			const webp = await this.filesService.convertToWebP(file.buffer);
			saveArray.push(
				new MFile({
					originalname: `${file.originalname.split('.')[0]}.webp`,
					buffer: webp,
				}),
			);
		}

		// возвращаем ссылки на сохранённые файлы на клиент
		return this.filesService.saveFiles(saveArray);
	}
}
