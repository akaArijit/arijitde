/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $ContactMessage = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        name: {
            type: 'string',
        },
        email: {
            type: 'string',
            format: 'email',
        },
        phone: {
            type: 'string',
            isNullable: true,
        },
        subject: {
            type: 'string',
            isNullable: true,
        },
        message: {
            type: 'string',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
    },
} as const;
