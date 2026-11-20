/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * List all advisory sessions (admin)
     * @returns SuccessResponse All sessions
     * @throws ApiError
     */
    public static adminListSessions(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leads/admin/sessions',
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Confirm advisory session (admin)
     * @returns any Session confirmed
     * @throws ApiError
     */
    public static adminConfirmSession({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            confirmedSlot: string;
            googleMeetLink: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns any Notes updated
     * @throws ApiError
     */
    public static adminUpdateSessionNotes({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            notes?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
     * @returns any Session refunded
     * @throws ApiError
     */
    public static adminRefundSession({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/admin/sessions/{id}/refund',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete session (admin)
     * @returns any Session deleted
     * @throws ApiError
     */
    public static adminDeleteSession({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/leads/admin/sessions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List users with pagination
     * @returns PaginatedResponse Paginated users
     * @throws ApiError
     */
    public static adminListUsers({
        page = 1,
        limit = 20,
    }: {
        page?: number,
        limit?: number,
    }): CancelablePromise<PaginatedResponse> {
        return __request(OpenAPI, {
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
     * @returns SuccessResponse Leads with counts
     * @throws ApiError
     */
    public static adminListLeads({
        page = 1,
        limit = 20,
    }: {
        page?: number,
        limit?: number,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
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
     * @returns SuccessResponse Existing clients
     * @throws ApiError
     */
    public static adminListExistingClients({
        page = 1,
        limit = 20,
    }: {
        page?: number,
        limit?: number,
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
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
     * @returns any File uploaded
     * @throws ApiError
     */
    public static adminUploadPortfolio({
        formData,
    }: {
        formData: {
            file: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
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
    public static adminSyncFolios(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/sync-folios',
            errors: {
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
}
