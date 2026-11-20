/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ScoreService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Calculate score
     * @param requestBody
     * @returns SuccessResponse Score calculated
     * @throws ApiError
     */
    public calculateScore(
        requestBody: {
            portfolioId: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
     * @param portfolioId
     * @returns SuccessResponse Scores found
     * @throws ApiError
     */
    public getPortfolioScores(
        portfolioId: string,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/score/portfolio/{portfolioId}',
            path: {
                'portfolioId': portfolioId,
            },
        });
    }
}
