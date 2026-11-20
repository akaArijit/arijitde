/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SupportService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Submit support query
     * @param requestBody
     * @returns SuccessResponse Support query submitted
     * @throws ApiError
     */
    public submitSupport(
        requestBody: {
            subject: string;
            message: string;
            priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
    public listSupportQueries(): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/support',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
}
