/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $SupportQuery = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        userId: {
            type: 'string',
            format: 'uuid',
        },
        subject: {
            type: 'string',
        },
        message: {
            type: 'string',
        },
        priority: {
            type: 'Enum',
        },
        status: {
            type: 'string',
            isNullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
        },
    },
} as const;
