/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Folio } from './Folio';
export type ExistingClient = {
    id?: string;
    name?: string;
    pan?: string;
    email?: string | null;
    mobile?: string | null;
    city?: string | null;
    aum?: number | null;
    purchaseValue?: number | null;
    createdAt?: string;
    updatedAt?: string;
    folios?: Array<Folio>;
};

