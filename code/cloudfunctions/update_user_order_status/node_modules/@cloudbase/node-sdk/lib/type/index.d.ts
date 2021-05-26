/// <reference types="node" />
export interface IKeyValue {
    [key: string]: any;
}
export interface ICredentialsInfo {
    private_key_id: string;
    private_key: string;
    env_id?: string;
}
export interface ICloudBaseConfig extends IKeyValue {
    debug?: boolean;
    timeout?: number;
    isHttp?: boolean;
    secretId?: string;
    secretKey?: string;
    envName?: string | Symbol;
    env?: string;
    sessionToken?: string;
    serviceUrl?: string;
    headers?: any;
    proxy?: string;
    version?: string;
    credentials?: ICredentialsInfo;
    throwOnCode?: boolean;
    forever?: boolean;
    /**
     * 获取跨帐号调用信息
     */
    getCrossAccountInfo?: () => Promise<ICrossAccountInfo>;
}
export interface IRequestInfo {
    config: ICloudBaseConfig;
    method: string;
    headers: any;
    params: ICustomParam;
    customApiUrl?: string;
    unSignedParams?: any;
    isFormData?: boolean;
    opts?: any;
}
export interface ICommonParam {
    action: string;
    envName?: string | Symbol;
    timestamp?: number;
    eventId?: string;
    wxCloudApiToken?: string;
    tcb_sessionToken?: string;
    authorization?: string;
    sessionToken?: string;
    sdk_version?: string;
}
export interface ICustomParam extends ICommonParam {
    [propName: string]: any;
}
export interface IRetryOptions {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    randomize?: boolean;
    timeouts?: number[];
    timeoutOps?: {
        timeout: number;
        cb: Function;
    };
}
interface ICrossAccountInfo {
    /**
     * 帐号凭证
     */
    credential: {
        secretId: string;
        secretKey: string;
        token: string;
    };
    /**
     * 认证信息加密
     */
    authorization: {
        mpToken?: string;
    };
}
export interface ICustomReqOpts {
    timeout?: number;
    retryOptions?: IRetryOptions;
    /**
     * 获取跨帐号调用信息
     */
    getCrossAccountInfo?: () => Promise<ICrossAccountInfo>;
}
export interface IErrorInfo {
    code?: string;
    message?: string;
    requestId?: string;
}
export interface ICustomErrRes {
    [propName: string]: any;
}
export interface IUploadFileRes {
    fileID: string;
}
export interface IDeleteFileRes {
    fileList: Array<any>;
    requestId: string;
}
export interface IGetFileUrlRes {
    fileList: Array<any>;
    requestId: string;
}
export interface IDownloadFileRes {
    fileContent: Buffer;
    message: string;
}
export interface IReqOpts {
    proxy?: string;
    qs?: any;
    json?: boolean;
    body?: any;
    formData?: any;
    encoding?: any;
    forever?: boolean;
    url: string;
    method?: string;
    timeout?: number;
    headers?: any;
}
export interface IReqHooks {
    handleData?: (res: any, err: any, response: any, body: any) => any;
}
export interface IContext {
    memory_limit_in_mb: number;
    time_limit_in_ms: number;
    request_id: string;
    environ: any;
    environment?: any;
    function_version: string;
    function_name: string;
    namespace: string;
}
export {};
