import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors"
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors} from 'fastify-type-provider-zod'
import { uploadImageRoute } from "./routes/upload-image";

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

server.register(uploadImageRoute)

server.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log('HTTP server running on http://localhost:3333');
});