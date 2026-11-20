/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $PaginatedData = {
    properties: {
        items: {
            type: 'array',
            contains: {
                type: 'dictionary',
                contains: {
                    properties: {
                    },
                },
            },
            isRequired: true,
        },
        total: {
            type: 'number',
            isRequired: true,
        },
        page: {
            type: 'number',
        },
        nextCursor: {
            type: 'string',
            isNullable: true,
        },
        nextCursorId: {
            type: 'string',
            isNullable: true,
        },
    },
} as const;
