/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $Assessment = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        userId: {
            type: 'string',
            format: 'uuid',
        },
        age: {
            type: 'number',
        },
        goal: {
            type: 'Enum',
        },
        ageRange: {
            type: 'string',
            isNullable: true,
        },
        lifeStage: {
            type: 'string',
            isNullable: true,
        },
        investmentTenure: {
            type: 'string',
            isNullable: true,
        },
        isCompletePortfolio: {
            type: 'boolean',
            isNullable: true,
        },
        investmentStyle: {
            type: 'string',
            isNullable: true,
        },
        expectedReturn: {
            type: 'string',
            isNullable: true,
        },
        riskBehavior: {
            type: 'string',
            isNullable: true,
        },
        monthlyInvestment: {
            type: 'string',
            isNullable: true,
        },
        emergencyFund: {
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
