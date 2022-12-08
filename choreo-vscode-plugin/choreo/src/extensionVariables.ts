import { debug } from "console";
import { commands, ExtensionContext, TreeItem, TreeView } from "vscode";
import { OAuthTokenHandler } from "./auth/inbuilt-impl";
import { ChoreoSession } from "./auth/session";
import { choreoSignedInCtxKey } from "./constants";

export namespace ext {
    export let context: ExtensionContext;
    export let isPluginStartup = true;

    export namespace auth {
        // auth releated
        let choreoSession: ChoreoSession = { loginStatus: false };

        export function setChoreoSession(choreoSession: ChoreoSession) {
            choreoSession = choreoSession;
            commands.executeCommand('setContext', choreoSignedInCtxKey, choreoSession.loginStatus);
        }

        export function getChoreoSession(): ChoreoSession {
            if (choreoSession.loginStatus && choreoSession.choreoLoginTime
                && choreoSession.tokenExpirationTime) {
                let tokenDuration = (new Date().getTime() - new Date(choreoSession.choreoLoginTime).getTime()) / 1000;
                if (tokenDuration > choreoSession.tokenExpirationTime) {
                    debug(`Exchanging refresh token. ${new Date()}`);
                    new OAuthTokenHandler().exchangeRefreshToken(choreoSession.choreoRefreshToken!);
                }
            }
            return choreoSession;
        }
        // end auth related
    }

    // views
    export let projectsTreeView: TreeView<TreeItem>;

}
