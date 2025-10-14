import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors"
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { uploadImageRoute } from "./routes/upload-image";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { transformSwaggerSchema } from "./transform-swagger-schema";

const server = fastify();

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// Error 500 and others error that I cant expect show here
server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Validation error.',
            issues: error.validation
        })
    }

    // Send error to some observability tool (Sentry/Datadog/Grafana)
    console.error(error)

    return reply.status(500).send({
        message: 'Internal server error.'
    })
})

server.register(fastifyCors, {
    origin: '*',
});

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Upload Server API',
            description: 'Upload Server API',
            version: '1.0.0',
        },
    },
    transform: transformSwaggerSchema
})

server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
})

server.register(uploadImageRoute)
server.register(fastifyMultipart)

server.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log('HTTP server running on http://localhost:3333');
});