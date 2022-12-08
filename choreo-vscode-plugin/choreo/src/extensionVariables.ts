import { debug } from "console";
import { commands, EventEmitter, ExtensionContext, TreeItem, TreeView } from "vscode";
import { ChoreoLoginStatus } from "./auth/events";
import { OAuthTokenHandler } from "./auth/inbuilt-impl";
import { ChoreoSession } from "./auth/session";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
import { choreoSignedInCtxKey } from "./constants";

export namespace ext {
    export let context: ExtensionContext;
    export let isPluginStartup: boolean;
    export let api: ChoreoExtensionApi;

    export namespace auth {
        // auth releated
        export let onStatusChanged: EventEmitter<ChoreoLoginStatus>;

        export let choreoSession: ChoreoSession = { loginStatus: false };

        export function setChoreoSession(choreoSession: ChoreoSession) {
            ext.auth.choreoSession = choreoSession;
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
            return ext.auth.choreoSession;
        }
        // end auth related
    }

    // views
    export let projectsTreeView: TreeView<TreeItem>;

}
