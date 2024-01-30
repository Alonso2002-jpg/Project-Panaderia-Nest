import { Controller, Logger, UseInterceptors, UploadedFile, Req, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express'
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ApiNotFoundResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('storage')
@ApiTags('Storage')
export class StorageController {
    private readonly logger = new Logger(StorageController.name);
    constructor(private readonly storageService: StorageService) {}

    //@Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.UPLOADS_DIR || './storage-dir',
                filename: (req, file, cb) => {
                    const fileName = uuidv4()
                    const fileExt = extname(file.originalname)
                    cb(null, `${fileName}${fileExt}`)
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)){
                    cb(new BadRequestException('Unsupported file.'), false)
                } else {
                    cb(null, true)
                }
            },
        }),
    ) storeFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request){
        this.logger.log(`Uploading file: ${file}`)
        if (!file){
            throw new BadRequestException('File not found.')
        }

        const apiVersion = process.env.API_VERSION
            ? `/${process.env.API_VERSION}`
            : '';
        const url = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${file.filename}`
        return {
            originalname: file.originalname,
            filename: file.filename,
            size: file.size,
            mimeType: file.mimetype,
            path: file.path,
            url: url,
        }
    }

    @Get(':filename')
    @ApiResponse({
        status: 200,
        description:
            'The file has been found and the file is returned in the response',
        type: String,
    })
    @ApiParam({
        name: 'filename',
        description: 'File name',
        type: String,
    })
    @ApiNotFoundResponse({
        description: 'The file does not exist',
    })
    getFile(@Param('filename') filename: string, @Res() res: Response){
        this.logger.log(`Searching file ${filename}`)
        const filePath = this.storageService.findFile(filename)
        this.logger.log(`File found ${filePath}`)
        res.sendFile(filePath)
    }
}