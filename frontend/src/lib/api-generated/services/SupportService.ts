/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SupportService {
    /**
     * Submit support query
     * @returns SuccessResponse Support query submitted
     * @throws ApiError
     */
    public static submitSupport({
        requestBody,
    }: {
        requestBody: {
            subject: string;
            message: string;
            priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/support',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * List user's support queries
     * @returns SuccessResponse Support queries
     * @throws ApiError
     */
    public static listSupportQueries(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/support',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
}
