import { debug } from "console";
import { commands, EventEmitter, ExtensionContext, TreeItem, TreeView } from "vscode";
import { ChoreoLoginStatus } from "./auth/events";
import { ChoreoAccessToken } from "./auth/types";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
import { choreoSignedInCtxKey } from "./constants";

export namespace ext {
    export let context: ExtensionContext;
    export let isPluginStartup: boolean;
    export let api: ChoreoExtensionApi;

    // export namespace auth {
    //     // auth releated
    //     export let onStatusChanged: EventEmitter<ChoreoLoginStatus>;

    //     export let loginStatus: ChoreoLoginStatus = "LoggedOut";

    //     export function setChoreoSession(choreoSession: ChoreoAccessToken) {
    //         ext.auth.choreoSession = choreoSession;
    //         commands.executeCommand('setContext', choreoSignedInCtxKey, choreoSession.loginStatus);
    //     }

    //     export function getChoreoSession(): ChoreoAccessToken {
    //         if (choreoSession.loginStatus && choreoSession.loginTime
    //             && choreoSession.expirationTime) {
    //             let tokenDuration = (new Date().getTime() - new Date(choreoSession.loginTime).getTime()) / 1000;
    //             if (tokenDuration > choreoSession.expirationTime) {
    //                 debug(`Exchanging refresh token. ${new Date()}`);
    //                 new OAuthTokenHandler().exchangeRefreshToken(choreoSession.refreshToken!);
    //             }
    //         }
    //         return ext.auth.choreoSession;
    //     }
    //     // end auth related
    // }

    // views
    export let projectsTreeView: TreeView<TreeItem>;

}
