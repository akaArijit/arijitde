/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AssessService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create risk assessment
     * @param requestBody
     * @returns SuccessResponse Assessment created
     * @throws ApiError
     */
    public createAssessment(
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
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
     * @param id
     * @returns SuccessResponse Assessment found
     * @throws ApiError
     */
    public getAssessment(
        id: string,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
     * @param userId
     * @returns SuccessResponse Assessment found
     * @throws ApiError
     */
    public getUserAssessment(
        userId: string,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
