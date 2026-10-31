import { OpenAPIV3 } from 'openapi-types';

/**
 * Standard API response helpers
 */
export function success(schema?: OpenAPIV3.SchemaObject): OpenAPIV3.ResponseObject {
  return {
    description: 'Successful response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: schema,
          },
        },
      };
  };
}

export function error(status: number, description: string): OpenAPIV3.ResponseObject {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            detail: { type: 'string' },
            instance: { type: 'string' },
          },
        },
      };
  };
}

export function validationError(): OpenAPIV3.ResponseObject {
  return {
    description: 'Validation Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
        },
      };
  };
}

export function unauthorized(): OpenAPIV3.ResponseObject {
  return {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Unauthorized' },
          },
        },
      };
  };
}

export function forbidden(): OpenAPIV3.ResponseObject {
  return {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Forbidden' },
          },
        },
      };
  };
}

export function notFound(): OpenAPIV3.ResponseObject {
  return {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Not Found' },
          },
        },
      };
  };
}

export function tooManyRequests(): OpenAPIV3.ResponseObject {
  return {
    description: 'Too Many Requests',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Too many requests, please try again later.' },
          },
        },
      };
  };
}

export function internalError(): OpenAPIV3.ResponseObject {
  return {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Internal server error' },
          },
        },
      };
  };
}
