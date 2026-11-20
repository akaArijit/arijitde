/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $Lead = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        userId: {
            type: 'string',
            format: 'uuid',
        },
        name: {
            type: 'string',
        },
        phone: {
            type: 'string',
        },
        scoreId: {
            type: 'string',
            isNullable: true,
            format: 'uuid',
        },
        slot: {
            type: 'string',
            isNullable: true,
            format: 'date-time',
        },
        status: {
            type: 'Enum',
        },
        notes: {
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
        user: {
            type: 'User',
        },
    },
} as const;
