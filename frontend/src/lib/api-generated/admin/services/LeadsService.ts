/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LeadsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create lead
     * @param requestBody
     * @returns SuccessResponse Lead created
     * @throws ApiError
     */
    public createLead(
        requestBody: {
            name: string;
            phone: string;
            scoreId?: string;
            slot?: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * List leads (admin)
     * @param status
     * @param page
     * @param limit
     * @param cursor
     * @param cursorId
     * @returns PaginatedResponse Paginated leads
     * @throws ApiError
     */
    public listLeads(
        status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED',
        page: number = 1,
        limit: number = 10,
        cursor?: string,
        cursorId?: string,
    ): CancelablePromise<PaginatedResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/leads',
            query: {
                'status': status,
                'page': page,
                'limit': limit,
                'cursor': cursor,
                'cursorId': cursorId,
            },
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Get current user's bookings
     * @returns SuccessResponse User bookings
     * @throws ApiError
     */
    public getMyBookings(): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/leads/my-bookings',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get available slots
     * @returns any Available slots
     * @throws ApiError
     */
    public getAvailability(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/leads/availability',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Book advisory session (authenticated)
     * @param requestBody
     * @returns any Session booked
     * @throws ApiError
     */
    public bookSession(
        requestBody: {
            slot1: string;
            slot2: string;
            slot3: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads/book-session',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Book advisory session (public)
     * @param requestBody
     * @returns any Session booked
     * @throws ApiError
     */
    public bookSessionPublic(
        requestBody: {
            name: string;
            phone: string;
            email: string;
            slot1: string;
            slot2: string;
            slot3: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads/book-session-public',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get current user's advisory sessions
     * @returns SuccessResponse User sessions
     * @throws ApiError
     */
    public getMySessions(): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/leads/my-sessions',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Update lead status (admin)
     * @param id
     * @param requestBody
     * @returns any Lead updated
     * @throws ApiError
     */
    public updateLeadStatus(
        id: string,
        requestBody: {
            status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';
            notes?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/leads/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden - Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
}
