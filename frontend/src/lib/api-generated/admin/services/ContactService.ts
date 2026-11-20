/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContactService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Submit contact form
     * @param requestBody
     * @returns SuccessResponse Contact submitted
     * @throws ApiError
     */
    public submitContact(
        requestBody: {
            name: string;
            email: string;
            phone?: string;
            subject?: string;
            message: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
