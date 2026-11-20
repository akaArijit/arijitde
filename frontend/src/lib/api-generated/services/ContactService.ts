/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContactService {
    /**
     * Submit contact form
     * @returns SuccessResponse Contact submitted
     * @throws ApiError
     */
    public static submitContact({
        requestBody,
    }: {
        requestBody: {
            name: string;
            email: string;
            phone?: string;
            subject?: string;
            message: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/contact',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
}
