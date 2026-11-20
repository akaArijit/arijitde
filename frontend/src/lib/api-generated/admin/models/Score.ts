/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Portfolio } from './Portfolio';
export type Score = {
    id?: string;
    portfolioId?: string;
    total?: number;
    goalAlignment?: number;
    assetAlloc?: number;
    diversification?: number;
    discipline?: number;
    efficiency?: number;
    tag?: string;
    insights?: string | null;
    createdAt?: string;
    updatedAt?: string;
    portfolio?: Portfolio;
};

