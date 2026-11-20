/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $Score = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        portfolioId: {
            type: 'string',
            format: 'uuid',
        },
        total: {
            type: 'number',
        },
        goalAlignment: {
            type: 'number',
        },
        assetAlloc: {
            type: 'number',
        },
        diversification: {
            type: 'number',
        },
        discipline: {
            type: 'number',
        },
        efficiency: {
            type: 'number',
        },
        tag: {
            type: 'string',
        },
        insights: {
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
        portfolio: {
            type: 'Portfolio',
        },
    },
} as const;
