/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List all advisory sessions (admin)
     * @returns SuccessResponse All sessions
     * @throws ApiError
     */
    public adminListSessions(): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/leads/admin/sessions',
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Confirm advisory session (admin)
     * @param id
     * @param requestBody
     * @returns any Session confirmed
     * @throws ApiError
     */
    public adminConfirmSession(
        id: string,
        requestBody: {
            confirmedSlot: string;
            googleMeetLink: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads/admin/sessions/{id}/confirm',
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
     * Update session notes (admin)
     * @param id
     * @param requestBody
     * @returns any Notes updated
     * @throws ApiError
     */
    public adminUpdateSessionNotes(
        id: string,
        requestBody: {
            notes?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads/admin/sessions/{id}/notes',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Refund/cancel session (admin)
     * @param id
     * @returns any Session refunded
     * @throws ApiError
     */
    public adminRefundSession(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/leads/admin/sessions/{id}/refund',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete session (admin)
     * @param id
     * @returns any Session deleted
     * @throws ApiError
     */
    public adminDeleteSession(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/leads/admin/sessions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List users with pagination
     * @param page
     * @param limit
     * @returns PaginatedResponse Paginated users
     * @throws ApiError
     */
    public adminListUsers(
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<PaginatedResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/admin/users',
            query: {
                'page': page,
                'limit': limit,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * List leads with counts (admin)
     * @param page
     * @param limit
     * @returns SuccessResponse Leads with counts
     * @throws ApiError
     */
    public adminListLeads(
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/admin/leads',
            query: {
                'page': page,
                'limit': limit,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * List existing clients (admin)
     * @param page
     * @param limit
     * @returns SuccessResponse Existing clients
     * @throws ApiError
     */
    public adminListExistingClients(
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/admin/existing-clients',
            query: {
                'page': page,
                'limit': limit,
            },
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Upload portfolio Excel file
     * @param formData
     * @returns any File uploaded
     * @throws ApiError
     */
    public adminUploadPortfolio(
        formData: {
            file: Blob;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/admin/portfolio-upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Sync folios from upload
     * @returns any Folios synced
     * @throws ApiError
     */
    public adminSyncFolios(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/admin/sync-folios',
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
}
