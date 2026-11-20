/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssessService {
    /**
     * Create risk assessment
     * @returns SuccessResponse Assessment created
     * @throws ApiError
     */
    public static createAssessment({
        requestBody,
    }: {
        requestBody: {
            age: number;
            goal: 'WEALTH_CREATION' | 'RETIREMENT' | 'CHILD_EDUCATION' | 'HOUSE_PURCHASE' | 'MARRIAGE' | 'TAX_SAVING' | 'PASSIVE_INCOME' | 'NOT_SURE_YET';
            ageRange?: string;
            lifeStage?: string;
            investmentTenure?: string;
            isCompletePortfolio?: boolean;
            investmentStyle?: string;
            expectedReturn?: string;
            riskBehavior?: string;
            monthlyInvestment?: string;
            emergencyFund?: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assess',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get assessment by ID
     * @returns SuccessResponse Assessment found
     * @throws ApiError
     */
    public static getAssessment({
        id,
    }: {
        id: string,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assess/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
    /**
     * Get user's latest assessment
     * @returns SuccessResponse Assessment found
     * @throws ApiError
     */
    public static getUserAssessment({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assess/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
}
