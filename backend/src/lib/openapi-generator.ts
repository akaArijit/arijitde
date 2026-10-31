import { OpenAPIV3 } from 'openapi-types';
import { z } from 'zod';

/**
 * OpenAPI 3.0 Specification Generator
 * Generates OpenAPI 3.0 specification from Zod schemas and route definitions
 */

export interface OpenAPIGeneratorOptions {
  title: string;
  version: string;
  description?: string;
  servers?: OpenAPIV3.ServerObject[];
  securitySchemes?: Record<string, OpenAPIV3.SecuritySchemeObject>;
  tags?: OpenAPIV3.TagObject[];
  externalDocs?: OpenAPIV3.ExternalDocumentationObject;
}

export class OpenAPIGenerator {
  private spec: OpenAPIV3.Document;
  private components: {
    schemas: Record<string, OpenAPIV3.SchemaObject>;
    securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject>;
    parameters: Record<string, OpenAPIV3.ParameterObject>;
    responses: Record<string, OpenAPIV3.ResponseObject>;
    requestBodies: Record<string, OpenAPIV3.RequestBodyObject>;
  };
  private paths: Record<string, OpenAPIV3.PathItemObject>;

  constructor(options: OpenAPIGeneratorOptions) {
    this.spec = {
      openapi: '3.0.3',
      info: {
        title: options.title,
        version: options.version,
        description: options.description,
        contact: {
          name: 'FinAnalysis API Support',
          email: 'support@finanalysis.site',
        },
        license: {
          name: 'Proprietary',
        },
      },
      servers: options.servers || [
        { url: 'https://api.finanalysis.site/api/v1', description: 'Production server' },
        { url: 'http://localhost:5000/api/v1', description: 'Development server' },
      ],
      tags: options.tags || [],
      externalDocs: options.externalDocs,
      components: {
        securitySchemes: options.securitySchemes || {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token for authentication',
          },
          refreshToken: {
            type: 'apiKey',
            in: 'cookie',
            name: 'refreshToken',
            description: 'Refresh token stored in httpOnly cookie',
          },
          csrfToken: {
            type: 'apiKey',
            in: 'header',
            name: 'x-csrf-token',
            description: 'CSRF token for state-changing operations',
          },
        },
      },
      paths: {},
    };

    this.components = {
      schemas: {},
      securitySchemes: (this.spec.components?.securitySchemes || {}) as Record<string, OpenAPIV3.SecuritySchemeObject>,
      parameters: {},
      responses: {},
      requestBodies: {},
    };
    this.paths = {};
  }

  /**
   * Convert Zod schema to OpenAPI schema
   */
  zodToOpenAPI(schema: z.ZodTypeAny, name?: string): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
    const def = this.zodToSchemaDef(schema);
    if (name) {
      this.components.schemas[name] = def;
      return { $ref: `#/components/schemas/${name}` };
    }
    return def;
  }

  private zodToSchemaDef(schema: z.ZodTypeAny): OpenAPIV3.SchemaObject {
    const def = schema._def;

    switch (def.typeName) {
      case 'ZodString': {
        const checks = def.checks || [];
        let format: string | undefined;
        let pattern: string | undefined;
        let minLength: number | undefined;
        let maxLength: number | undefined;

        for (const check of checks) {
          switch (check.kind) {
            case 'email':
              format = 'email';
              break;
            case 'uuid':
              format = 'uuid';
              break;
            case 'url':
              format = 'uri';
              break;
            case 'datetime':
            case 'datetime-iso':
              format = 'date-time';
              break;
            case 'date':
              format = 'date';
              break;
            case 'regex':
              pattern = check.regex.source;
              break;
            case 'min':
              minLength = check.value;
              break;
            case 'max':
              maxLength = check.value;
              break;
          }
        }

        return {
          type: 'string',
          ...(format && { format }),
          ...(pattern && { pattern }),
          ...(minLength !== undefined && { minLength }),
          ...(maxLength !== undefined && { maxLength }),
        };
      }

      case 'ZodNumber': {
        const checks = def.checks || [];
        let minimum: number | undefined;
        let maximum: number | undefined;
        let exclusiveMinimum: boolean | undefined;
        let exclusiveMaximum: boolean | undefined;

        for (const check of checks) {
          switch (check.kind) {
            case 'min':
              minimum = check.value;
              exclusiveMinimum = !check.inclusive;
              break;
            case 'max':
              maximum = check.value;
              exclusiveMaximum = !check.inclusive;
              break;
            case 'int':
              // Handled by type
              break;
          }
        }

        return {
          type: 'number',
          format: def.coerce ? undefined : 'double',
          ...(minimum !== undefined && { minimum }),
          ...(maximum !== undefined && { maximum }),
          ...(exclusiveMinimum !== undefined && { exclusiveMinimum }),
          ...(exclusiveMaximum !== undefined && { exclusiveMaximum }),
        };
      }

      case 'ZodBoolean':
        return { type: 'boolean' };

      case 'ZodArray': {
        const itemSchema = this.zodToSchemaDef(def.type);
        const checks = def.checks || [];
        let minItems: number | undefined;
        let maxItems: number | undefined;

        for (const check of checks) {
          if (check.kind === 'min') minItems = check.value;
          if (check.kind === 'max') maxItems = check.value;
        }

        return {
          type: 'array',
          items: itemSchema,
          ...(minItems !== undefined && { minItems }),
          ...(maxItems !== undefined && { maxItems }),
        };
      }

      case 'ZodObject': {
        const shape = def.shape();
        const properties: Record<string, OpenAPIV3.SchemaObject> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
          const zodSchema = value as z.ZodTypeAny;
          properties[key] = this.zodToSchemaDef(zodSchema);
          if (!zodSchema.isOptional()) {
            required.push(key);
          }
        }

        return {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
          additionalProperties: def.catchall ? this.zodToSchemaDef(def.catchall) : false,
        };
      }

      case 'ZodOptional':
        return this.zodToSchemaDef(def.innerType);

      case 'ZodNullable':
        return {
          ...this.zodToSchemaDef(def.innerType),
          nullable: true,
        };

      case 'ZodDefault':
        return {
          ...this.zodToSchemaDef(def.innerType),
          default: def.defaultValue(),
        };

      case 'ZodEnum':
        return {
          type: 'string',
          enum: def.values,
        };

      case 'ZodNativeEnum':
        return {
          type: 'string',
          enum: Object.values(def.enum),
        };

      case 'ZodUnion':
        return {
          oneOf: def.options.map((opt: z.ZodTypeAny) => this.zodToSchemaDef(opt)),
        };

      case 'ZodIntersection':
        return {
          allOf: [this.zodToSchemaDef(def.left), this.zodToSchemaDef(def.right)],
        };

      case 'ZodDate':
        return { type: 'string', format: 'date-time' };

      case 'ZodNull':
        return { type: 'string', nullable: true };

      case 'ZodUndefined':
        return { type: 'string', nullable: true };

      case 'ZodAny':
        return {};

      case 'ZodUnknown':
        return {};

      case 'ZodNever':
        return { not: {} };

      case 'ZodVoid':
        return { type: 'string', nullable: true };

      case 'ZodBigInt':
        return { type: 'string', format: 'int64' };

      case 'ZodPromise':
        return this.zodToSchemaDef(def.type);

      case 'ZodEffects':
        // Refinements don't affect the schema
        return this.zodToSchemaDef(def.schema);

      case 'ZodLiteral':
        const literalType = typeof def.value;
        const validTypes = ['string', 'number', 'boolean'] as const;
        const schemaType = validTypes.includes(literalType as 'string' | 'number' | 'boolean') ? literalType : 'string';
        return {
          type: schemaType as 'string' | 'number' | 'boolean' | 'integer' | undefined,
          enum: [def.value],
        };

      case 'ZodRecord':
        return {
          type: 'object',
          additionalProperties: this.zodToSchemaDef(def.valueType),
        };

      case 'ZodMap':
        return {
          type: 'object',
          additionalProperties: this.zodToSchemaDef(def.valueType),
        };

      case 'ZodSet':
        return {
          type: 'array',
          items: this.zodToSchemaDef(def.valueType),
          uniqueItems: true,
        };

      case 'ZodTuple':
        return {
          type: 'array',
          items: def.items.map((item: z.ZodTypeAny) => this.zodToSchemaDef(item)),
          minItems: def.items.length,
          maxItems: def.items.length,
        };

      default:
        return { type: 'object' };
    }
  }

  /**
   * Add a schema to components
   */
  addSchema(name: string, schema: OpenAPIV3.SchemaObject): this {
    this.components.schemas[name] = schema;
    return this;
  }

  /**
   * Add a path to the spec
   */
  addPath(
    path: string,
    method: string,
    operation: OpenAPIV3.OperationObject
  ): this {
    if (!this.paths[path]) {
      this.paths[path] = {} as OpenAPIV3.PathItemObject;
    }
    (this.paths[path] as Record<string, OpenAPIV3.OperationObject>)[method.toLowerCase()] = operation;
    return this;
  }

  /**
   * Add a response component
   */
  addResponse(name: string, response: OpenAPIV3.ResponseObject): this {
    this.components.responses[name] = response;
    return this;
  }

  /**
   * Add a request body component
   */
  addRequestBody(name: string, requestBody: OpenAPIV3.RequestBodyObject): this {
    this.components.requestBodies[name] = requestBody;
    return this;
  }

  /**
   * Add a parameter component
   */
  addParameter(name: string, parameter: OpenAPIV3.ParameterObject): this {
    this.components.parameters[name] = parameter;
    return this;
  }

  /**
   * Build the final OpenAPI document
   */
  build(): OpenAPIV3.Document {
    this.spec.components = {
      ...this.spec.components,
      schemas: this.components.schemas,
      securitySchemes: this.components.securitySchemes,
      parameters: this.components.parameters,
      responses: this.components.responses,
      requestBodies: this.components.requestBodies,
    };
    this.spec.paths = this.paths;
    return this.spec;
  }

  /**
   * Export as JSON string
   */
  toJSON(space?: number): string {
    return JSON.stringify(this.build(), null, space);
  }

  /**
   * Export as YAML string (requires js-yaml)
   */
  toYAML(): string {
    // Would require js-yaml package
    throw new Error('YAML export requires js-yaml package');
  }
}

/**
 * Standard API response helpers
 */

/**
 * Create standard security requirement
 */
export const bearerAuthSecurity = [{ bearerAuth: [] }];

/**
 * Create standard pagination parameters
 */
export const paginationParams = [
  {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 1, default: 1 },
    description: 'Page number',
  },
  {
    name: 'limit',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    description: 'Items per page',
  },
] as const;

/**
 * Create standard cursor-based pagination parameters
 */
export const cursorPaginationParams = [
  {
    name: 'cursor',
    in: 'query',
    schema: { type: 'string' },
    description: 'Cursor for pagination',
  },
  {
    name: 'limit',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    description: 'Items per page',
  },
] as const;