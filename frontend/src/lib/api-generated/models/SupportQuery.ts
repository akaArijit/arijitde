/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SupportQuery = {
    id?: string;
    userId?: string;
    subject?: string;
    message?: string;
    priority?: SupportQuery.priority;
    status?: string | null;
    createdAt?: string;
    updatedAt?: string;
};
export namespace SupportQuery {
    export enum priority {
        LOW = 'LOW',
        MEDIUM = 'MEDIUM',
        HIGH = 'HIGH',
        URGENT = 'URGENT',
    }
}

