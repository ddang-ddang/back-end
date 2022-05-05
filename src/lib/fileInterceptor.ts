import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const customFileIntercept = (options: {
  fieldname: string;
  dest: string;
  maxFileSize: number;
  fileCount: number;
  allowFileTypes: string[];
}) =>
  FileInterceptor(options.fieldname, {
    storage: diskStorage({
      destination: options.dest,
    }),
    limits: {
      fileSize: options.maxFileSize,
      files: options.fileCount,
    },
    fileFilter(
      req: any,
      file: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      },
      callback: (error: Error | null, acceptFile: boolean) => void
    ) {
      if (!options.allowFileTypes.includes(file.mimetype))
        return callback(new BadRequestException('invalid file type.'), false);
      return callback(null, true);
    },
  });
