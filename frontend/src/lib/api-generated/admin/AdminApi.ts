/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { AdminService } from './services/AdminService';
import { AssessService } from './services/AssessService';
import { AuthService } from './services/AuthService';
import { ChatService } from './services/ChatService';
import { ContactService } from './services/ContactService';
import { DefaultService } from './services/DefaultService';
import { LeadsService } from './services/LeadsService';
import { PortfolioService } from './services/PortfolioService';
import { ScoreService } from './services/ScoreService';
import { SupportService } from './services/SupportService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class AdminApi {
    public readonly admin: AdminService;
    public readonly assess: AssessService;
    public readonly auth: AuthService;
    public readonly chat: ChatService;
    public readonly contact: ContactService;
    public readonly default: DefaultService;
    public readonly leads: LeadsService;
    public readonly portfolio: PortfolioService;
    public readonly score: ScoreService;
    public readonly support: SupportService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '/api/v1',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.admin = new AdminService(this.request);
        this.assess = new AssessService(this.request);
        this.auth = new AuthService(this.request);
        this.chat = new ChatService(this.request);
        this.contact = new ContactService(this.request);
        this.default = new DefaultService(this.request);
        this.leads = new LeadsService(this.request);
        this.portfolio = new PortfolioService(this.request);
        this.score = new ScoreService(this.request);
        this.support = new SupportService(this.request);
    }
}

