/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $ExistingClient = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        name: {
            type: 'string',
        },
        pan: {
            type: 'string',
        },
        email: {
            type: 'string',
            isNullable: true,
        },
        mobile: {
            type: 'string',
            isNullable: true,
        },
        city: {
            type: 'string',
            isNullable: true,
        },
        aum: {
            type: 'number',
            isNullable: true,
        },
        purchaseValue: {
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
        folios: {
            type: 'array',
            contains: {
                type: 'Folio',
            },
        },
    },
} as const;
