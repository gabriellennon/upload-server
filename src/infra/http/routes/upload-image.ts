import { db } from '@/infra/db';
import { uploads } from '@/infra/db/schemas/uploads';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    server.post('/uploads', {
        schema: {
            summary: 'Upload an image',
            consumes: ['multipart/form-data'],
            response: {
                201: z.object({ uploadId: z.string() }),
                409: z.object({ message: z.string() }).describe('Upload already exists'),
            }
        }
    }, async (request, reply) => {
        const uploadedFile = await request.file({
            limits: {
                fileSize: 1024 * 1024 * 2, // 2MB
            }
        })


        await db.insert(uploads).values({
            name: 'Teste',
            remoteKey: 'Teste',
            remoteUrl: 'Teste',
        })
        return reply.status(201).send({ uploadId: 'teste' })
    })

}