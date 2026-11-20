/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $SuccessResponse = {
    properties: {
        success: {
            type: 'boolean',
            isRequired: true,
        },
        data: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
            isRequired: true,
        },
    },
} as const;
