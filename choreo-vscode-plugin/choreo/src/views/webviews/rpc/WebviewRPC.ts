import { WebviewPanel } from "vscode";
import { Messenger } from "vscode-messenger";
import { getUserInfo } from "../../../api/user";
import { ext } from "../../../extensionVariables";

// request types 
const getLoginStatus = { method: 'getLoginStatus' };
const getCurrentOrg = { method: 'getCurrentOrg' };
const getAllOrgs = { method: 'getAllOrgs' };

export class WebViewRpc {

    private _messenger = new Messenger();

    constructor(view: WebviewPanel) {
        this._messenger.registerWebviewPanel(view);

        this._messenger.onRequest(getLoginStatus, () => {
            return ext.api.status;
        });
        this._messenger.onRequest(getCurrentOrg, () => {
            return ext.api.selectedOrg;
        });
        this._messenger.onRequest(getAllOrgs, async () => {
            const loginSuccess = await ext.api.waitForLogin();
            if (loginSuccess) {
                 const userInfo = await getUserInfo();
                 return userInfo.organizations;
            } 
        });
    }
}