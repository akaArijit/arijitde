/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $Portfolio = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        userId: {
            type: 'string',
            format: 'uuid',
        },
        assessmentId: {
            type: 'string',
            isNullable: true,
            format: 'uuid',
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
            isNullable: true,
        },
        totalValue: {
            type: 'number',
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
