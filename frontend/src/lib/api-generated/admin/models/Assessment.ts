/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Assessment = {
    id?: string;
    userId?: string;
    age?: number;
    goal?: Assessment.goal;
    ageRange?: string | null;
    lifeStage?: string | null;
    investmentTenure?: string | null;
    isCompletePortfolio?: boolean | null;
    investmentStyle?: string | null;
    expectedReturn?: string | null;
    riskBehavior?: string | null;
    monthlyInvestment?: string | null;
    emergencyFund?: string | null;
    createdAt?: string;
    updatedAt?: string;
};
export namespace Assessment {
    export enum goal {
        WEALTH_CREATION = 'WEALTH_CREATION',
        RETIREMENT = 'RETIREMENT',
        CHILD_EDUCATION = 'CHILD_EDUCATION',
        HOUSE_PURCHASE = 'HOUSE_PURCHASE',
        MARRIAGE = 'MARRIAGE',
        TAX_SAVING = 'TAX_SAVING',
        PASSIVE_INCOME = 'PASSIVE_INCOME',
        NOT_SURE_YET = 'NOT_SURE_YET',
    }
}

