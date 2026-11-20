/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PortfolioService {
    /**
     * Create portfolio
     * @returns any Portfolio created
     * @throws ApiError
     */
    public static createPortfolio({
        requestBody,
    }: {
        requestBody: {
            name: string;
            assessmentId: string;
            description?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns SuccessResponse Portfolio found
     * @throws ApiError
     */
    public static getPortfolio({
        id,
    }: {
        id: string,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
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
     * @returns any Portfolio updated
     * @throws ApiError
     */
    public static updatePortfolio({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            name?: string;
            description?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns any Portfolio deleted
     * @throws ApiError
     */
    public static deletePortfolio({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns SuccessResponse List of portfolios
     * @throws ApiError
     */
    public static getUserPortfolios({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/portfolio/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
