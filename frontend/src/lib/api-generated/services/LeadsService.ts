/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeadsService {
    /**
     * Create lead
     * @returns SuccessResponse Lead created
     * @throws ApiError
     */
    public static createLead({
        requestBody,
    }: {
        requestBody: {
            name: string;
            phone: string;
            scoreId?: string;
            slot?: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
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
     * @returns PaginatedResponse Paginated leads
     * @throws ApiError
     */
    public static listLeads({
        status,
        page = 1,
        limit = 10,
        cursor,
        cursorId,
    }: {
        status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED',
        page?: number,
        limit?: number,
        cursor?: string,
        cursorId?: string,
    }): CancelablePromise<PaginatedResponse> {
        return __request(OpenAPI, {
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
    public static getMyBookings(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
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
    public static getAvailability(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leads/availability',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Book advisory session (authenticated)
     * @returns any Session booked
     * @throws ApiError
     */
    public static bookSession({
        requestBody,
    }: {
        requestBody: {
            slot1: string;
            slot2: string;
            slot3: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns any Session booked
     * @throws ApiError
     */
    public static bookSessionPublic({
        requestBody,
    }: {
        requestBody: {
            name: string;
            phone: string;
            email: string;
            slot1: string;
            slot2: string;
            slot3: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
    public static getMySessions(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leads/my-sessions',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Update lead status (admin)
     * @returns any Lead updated
     * @throws ApiError
     */
    public static updateLeadStatus({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';
            notes?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
