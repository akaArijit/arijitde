/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PortfolioService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create portfolio
     * @param requestBody
     * @returns any Portfolio created
     * @throws ApiError
     */
    public createPortfolio(
        requestBody: {
            name: string;
            assessmentId: string;
            description?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/portfolio',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get portfolio by ID
     * @param id
     * @returns SuccessResponse Portfolio found
     * @throws ApiError
     */
    public getPortfolio(
        id: string,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/portfolio/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update portfolio
     * @param id
     * @param requestBody
     * @returns any Portfolio updated
     * @throws ApiError
     */
    public updatePortfolio(
        id: string,
        requestBody: {
            name?: string;
            description?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/portfolio/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Resource not found`,
            },
        });
    }
    /**
     * Delete portfolio (soft delete)
     * @param id
     * @returns any Portfolio deleted
     * @throws ApiError
     */
    public deletePortfolio(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/portfolio/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
    /**
     * Get user portfolios
     * @param userId
     * @returns SuccessResponse List of portfolios
     * @throws ApiError
     */
    public getUserPortfolios(
        userId: string,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/portfolio/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
