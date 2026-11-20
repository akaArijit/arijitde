/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register new user
     * @returns SuccessResponse User registered
     * @throws ApiError
     */
    public static registerUser({
        requestBody,
    }: {
        requestBody: {
            email: string;
            password: string;
            name: string;
            phone?: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                409: `Resource conflict`,
            },
        });
    }
    /**
     * Login with email/password
     * @returns SuccessResponse Login successful
     * @throws ApiError
     */
    public static loginUser({
        requestBody,
    }: {
        requestBody: {
            email: string;
            password: string;
        },
    }): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Google OAuth login
     * @returns any Google login successful
     * @throws ApiError
     */
    public static googleLogin({
        requestBody,
    }: {
        requestBody: {
            credential: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/google',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Refresh access token
     * @returns any Token refreshed
     * @throws ApiError
     */
    public static refreshToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Logout user
     * @returns any Logged out
     * @throws ApiError
     */
    public static logoutUser(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Get current user profile
     * @returns SuccessResponse User profile
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Request password reset OTP
     * @returns any OTP sent
     * @throws ApiError
     */
    public static forgotPassword({
        requestBody,
    }: {
        requestBody: {
            email: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Reset password with OTP
     * @returns any Password reset
     * @throws ApiError
     */
    public static resetPassword({
        requestBody,
    }: {
        requestBody: {
            email: string;
            otp: string;
            newPassword: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Verify OTP
     * @returns any OTP verified
     * @throws ApiError
     */
    public static verifyOtp({
        requestBody,
    }: {
        requestBody: {
            email: string;
            otp: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-otp',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
}
