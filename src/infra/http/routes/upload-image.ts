import { uploadImage } from '@/app/functions/upload-image';
import { db } from '@/infra/db';
import { uploads } from '@/infra/db/schemas/uploads';
import { isLeft, isRight, unwrapEither } from '@/shared/either';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    server.post('/uploads', {
        schema: {
            summary: 'Upload an image',
            tags: ['uploads'],
            consumes: ['multipart/form-data'],
            response: {
                201: z.object({ uploadId: z.string() }),
                400: z.object({ message: z.string() })
            }
        }
    }, async (request, reply) => {
        const uploadedFile = await request.file({
            limits: {
                fileSize: 1024 * 1024 * 2, // 2MB
            }
        })

        if(!uploadedFile){
            return reply.status(400).send({ message: 'No file uploaded' })
        }

        const uploadImageResult = await uploadImage({
            fileName: uploadedFile.filename,
            contentType: uploadedFile.mimetype,
            contentStream: uploadedFile.file,
        })

        // Erro de tamanho do arquivo
        if(uploadedFile.file.truncated) {
            return reply.status(400).send({ message: 'File size limit reached' })
        }

        if(isRight(uploadImageResult)){
            return reply.status(201).send({ uploadId: 'teste' })
        }

        const error = unwrapEither(uploadImageResult)

        switch (error.constructor.name){
            case 'InvalidFileFormat':
                return reply.status(400).send({ message: error.message })
        }
    })

}