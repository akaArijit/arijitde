/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ChatService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Send message to AI assistant
     * @param requestBody
     * @returns SuccessResponse AI response
     * @throws ApiError
     */
    public chatMessage(
        requestBody: {
            message: string;
            context?: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
}
