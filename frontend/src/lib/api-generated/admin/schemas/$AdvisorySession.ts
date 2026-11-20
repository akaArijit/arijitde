/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export const $AdvisorySession = {
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
        },
        userId: {
            type: 'string',
            format: 'uuid',
        },
        preferredSlot1: {
            type: 'string',
            format: 'date-time',
        },
        preferredSlot2: {
            type: 'string',
            format: 'date-time',
        },
        preferredSlot3: {
            type: 'string',
            format: 'date-time',
        },
        confirmedSlot: {
            type: 'string',
            isNullable: true,
            format: 'date-time',
        },
        googleMeetLink: {
            type: 'string',
            isNullable: true,
            format: 'uri',
        },
        status: {
            type: 'Enum',
        },
        notes: {
            type: 'string',
            isNullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
        },
        user: {
            type: 'User',
        },
    },
} as const;
