import { AccessToken } from "@wso2-enterprise/choreo-client";
// todo: delete if not needed
export class TokenManager {
    private static instance: TokenManager;
    private apimTokenResponse?: AccessToken;
    private vscodeTokenResponse?: AccessToken;

    private constructor() {
    }

    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    public setAsgardioTokenResponse(value: AccessToken): void {
        this.apimTokenResponse = value;
    }

    public getApimTokenResponse(): AccessToken | undefined {
        return this.apimTokenResponse;
    }

    public setVscodeTokenResponse(value: AccessToken): void {
        this.vscodeTokenResponse = value;
    }

    public getVscodeTokenResponse(): AccessToken | undefined {
        return this.vscodeTokenResponse;
    }
}
