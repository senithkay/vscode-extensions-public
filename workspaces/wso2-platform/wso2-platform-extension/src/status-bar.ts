import {window, StatusBarAlignment, ExtensionContext, StatusBarItem} from "vscode";
import { webviewStateStore } from "./stores/webview-state-store";
import { WebviewState, AuthState } from "@wso2-enterprise/wso2-platform-core";
import { authStore } from "./stores/auth-store";

let statusBarItem: StatusBarItem;

export function activateStatusbar({ subscriptions }: ExtensionContext) {
	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 120);
	// myStatusBarItem.command = myCommandId;
	subscriptions.push(statusBarItem);


   let webviewState: WebviewState = webviewStateStore.getState()?.state
   let authState: AuthState| null = authStore.getState()?.state
    webviewStateStore.subscribe((state)=>{
        webviewState = state.state
        updateStatusBarItem(webviewState, authState);
    })

    authStore.subscribe((state)=>{
        authState = state.state
        updateStatusBarItem(webviewState, authState);
    })

	// update status bar item once at start
	updateStatusBarItem(webviewState, authState);
}

function updateStatusBarItem(webviewState: WebviewState | null, authState?: AuthState | null): void {
	if (!!authState?.userInfo && webviewState?.extensionName) {
		statusBarItem.text = webviewState?.extensionName;
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}

