/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type AdvisorySession = {
    id?: string;
    userId?: string;
    preferredSlot1?: string;
    preferredSlot2?: string;
    preferredSlot3?: string;
    confirmedSlot?: string | null;
    googleMeetLink?: string | null;
    status?: AdvisorySession.status;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
};
export namespace AdvisorySession {
    export enum status {
        PENDING = 'PENDING',
        CONFIRMED = 'CONFIRMED',
        COMPLETED = 'COMPLETED',
        CANCELLED = 'CANCELLED',
        REFUNDED = 'REFUNDED',
    }
}

