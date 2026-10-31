import { OpenAPIV3 } from 'openapi-types';

type ResponseObject = OpenAPIV3.ResponseObject;
type SchemaObject = OpenAPIV3.SchemaObject;

function makeSchema(props: Record<string, SchemaObject | undefined>): SchemaObject {
    return {
        type: 'object',
        properties: props as Record<string, SchemaObject>,
    };
}

function makeContent(schema: SchemaObject): ResponseObject['content'] {
    return {
        'application/json': { schema },
    };
}

function createSuccessResponse(schema?: OpenAPIV3.SchemaObject): OpenAPIV3.ResponseObject {
    const response: OpenAPIV3.ResponseObject = {
        description: 'Successful response',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: true },
            data: schema ?? { type: 'object' },
        })),
    };
    return response;
}

export const success = createSuccessResponse;

function makeErrorSchema(status: number, title: string, detail: string, instance?: string): SchemaObject {
    const props: Record<string, SchemaObject> = {
        type: { type: 'string', format: 'uri', example: `https://httpstatuses.com/${status}` },
        title: { type: 'string', example: title },
        status: { type: 'integer', example: status },
        detail: { type: 'string', example: detail },
    };
    if (instance !== undefined) {
        props.instance = { type: 'string', format: 'uri', example: instance };
    }
    return makeSchema(props);
}

export function error(
    status: number,
    title: string,
    detail: string,
    instance?: string,
    _extensions?: Record<string, unknown>
): OpenAPIV3.ResponseObject {
    return {
        description: `Error ${status}`,
        content: makeContent(makeErrorSchema(status, title, detail, instance)),
    };
}

export function validationError(): OpenAPIV3.ResponseObject {
    return {
        description: 'Validation Error',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            details: {
                type: 'array',
                items: makeSchema({
                    field: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'string' },
                }),
            },
        })),
    };
}

export function unauthorized(): OpenAPIV3.ResponseObject {
    return {
        description: 'Unauthorized',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Unauthorized' },
        })),
    };
}

export function forbidden(): OpenAPIV3.ResponseObject {
    return {
        description: 'Forbidden',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Forbidden' },
        })),
    };
}

export function notFound(): OpenAPIV3.ResponseObject {
    return {
        description: 'Not Found',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
        })),
    };
}

export function tooManyRequests(): OpenAPIV3.ResponseObject {
    return {
        description: 'Too Many Requests',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Too many requests, please try again later.' },
        })),
    };
}

export function internalError(): OpenAPIV3.ResponseObject {
    return {
        description: 'Internal Server Error',
        content: makeContent(makeSchema({
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Internal server error' },
        })),
    };
}