import { debug } from "console";
import { ExtensionContext } from "vscode";
import { OAuthTokenHandler } from "../auth/inbuilt-impl";
import { ChoreoSession } from "../auth/session";

export class ChoreoExtension {

    private choreoSession: ChoreoSession = { loginStatus: false };
    public context?: ExtensionContext;

    setContext(context: ExtensionContext) {
        this.context = context;
    }
    
    public setChoreoSession(choreoSession: ChoreoSession) {
        this.choreoSession = choreoSession;
    }

    public getChoreoSession(): ChoreoSession {
        if (this.choreoSession.loginStatus && this.choreoSession.choreoLoginTime
            && this.choreoSession.tokenExpirationTime) {
            let tokenDuration = (new Date().getTime() - new Date(this.choreoSession.choreoLoginTime).getTime()) / 1000;
            if (tokenDuration > this.choreoSession.tokenExpirationTime) {
                debug(`Exchanging refresh token. ${new Date()}`);
                new OAuthTokenHandler(this).exchangeRefreshToken(this.choreoSession.choreoRefreshToken!);
            }
        }
        return this.choreoSession;
    }
}

export const choreoExtInstance = new ChoreoExtension();