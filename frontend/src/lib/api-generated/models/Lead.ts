/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type Lead = {
    id?: string;
    userId?: string;
    name?: string;
    phone?: string;
    scoreId?: string | null;
    slot?: string | null;
    status?: Lead.status;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
};
export namespace Lead {
    export enum status {
        NEW = 'NEW',
        CONTACTED = 'CONTACTED',
        QUALIFIED = 'QUALIFIED',
        CLOSED = 'CLOSED',
    }
}

