import { type AuthState, CommandIds, type ContextStoreState, type WebviewState } from "@wso2-enterprise/wso2-platform-core";
import { type ExtensionContext, StatusBarAlignment, type StatusBarItem, window } from "vscode";
import { authStore } from "./stores/auth-store";
import { contextStore } from "./stores/context-store";
import { webviewStateStore } from "./stores/webview-state-store";

let statusBarItem: StatusBarItem;

export function activateStatusbar({ subscriptions }: ExtensionContext) {
	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 120);
	// myStatusBarItem.command = myCommandId;
	subscriptions.push(statusBarItem);

	let webviewState: WebviewState = webviewStateStore.getState()?.state;
	let authState: AuthState | null = authStore.getState()?.state;
	let contextStoreState: ContextStoreState | null = contextStore.getState()?.state;
	webviewStateStore.subscribe((state) => {
		webviewState = state.state;
		updateStatusBarItem(webviewState, authState, contextStoreState);
	});

	authStore.subscribe((state) => {
		authState = state.state;
		updateStatusBarItem(webviewState, authState, contextStoreState);
	});
	contextStore.subscribe((state) => {
		contextStoreState = state.state;
		updateStatusBarItem(webviewState, authState, contextStoreState);
	});

	// update status bar item once at start
	updateStatusBarItem(webviewState, authState, contextStoreState);
}

function updateStatusBarItem(webviewState: WebviewState | null, authState?: AuthState | null, contextStoreState?: ContextStoreState | null): void {
	statusBarItem.command = CommandIds.ManageDirectoryContext;
	if (authState?.userInfo) {
		if (contextStoreState?.selected?.project?.name) {
			statusBarItem.text = `WSO2: ${contextStoreState?.selected?.project?.name}`;
		} else {
			statusBarItem.text = `WSO2: ${authState?.userInfo?.displayName}`;
		}
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}
