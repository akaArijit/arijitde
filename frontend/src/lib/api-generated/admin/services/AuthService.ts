/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuccessResponse } from '../models/SuccessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Register new user
     * @param requestBody
     * @returns SuccessResponse User registered
     * @throws ApiError
     */
    public registerUser(
        requestBody: {
            email: string;
            password: string;
            name: string;
            phone?: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
     * @param requestBody
     * @returns SuccessResponse Login successful
     * @throws ApiError
     */
    public loginUser(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
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
     * @param requestBody
     * @returns any Google login successful
     * @throws ApiError
     */
    public googleLogin(
        requestBody: {
            credential: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
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
    public refreshToken(): CancelablePromise<any> {
        return this.httpRequest.request({
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
    public logoutUser(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Get current user profile
     * @returns SuccessResponse User profile
     * @throws ApiError
     */
    public getCurrentUser(): CancelablePromise<SuccessResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/me',
            errors: {
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Request password reset OTP
     * @param requestBody
     * @returns any OTP sent
     * @throws ApiError
     */
    public forgotPassword(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
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
     * @param requestBody
     * @returns any Password reset
     * @throws ApiError
     */
    public resetPassword(
        requestBody: {
            email: string;
            otp: string;
            newPassword: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
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
     * @param requestBody
     * @returns any OTP verified
     * @throws ApiError
     */
    public verifyOtp(
        requestBody: {
            email: string;
            otp: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
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
