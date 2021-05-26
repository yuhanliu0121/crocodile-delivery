interface Secret {
    id: string;
    key: string;
    token: string;
    expire: number;
}
/**
 * 容器托管内的密钥管理器
 */
export default class SecretManager {
    private tmpSecret;
    private TMP_SECRET_URL;
    constructor();
    getTmpSecret(): Promise<Secret>;
    private fetchTmpSecret;
    private get;
}
export {};
