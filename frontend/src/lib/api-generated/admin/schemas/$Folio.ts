/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $Folio = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        clientName: {
            type: 'string',
        },
        clientPan: {
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
        folioNumber: {
            type: 'string',
        },
        schemeName: {
            type: 'string',
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
    },
} as const;
