/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScoreService {
    /**
     * Calculate score
     * @returns SuccessResponse Score calculated
     * @throws ApiError
     */
    public static calculateScore({
        requestBody,
    }: {
        requestBody: {
            portfolioId: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/score',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get scores for portfolio
     * @returns SuccessResponse Scores found
     * @throws ApiError
     */
    public static getPortfolioScores({
        portfolioId,
    }: {
        portfolioId: string,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/score/portfolio/{portfolioId}',
            path: {
                'portfolioId': portfolioId,
            },
        });
    }
}
