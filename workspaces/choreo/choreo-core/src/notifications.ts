import { NotificationType } from "vscode-messenger-common";
import { AuthState, ContextStoreState, WebviewState } from "./types";


const NotificationMethods = {
    onAuthStateChanged: 'onAuthStateChanged',
    onWebviewStateChanged: 'onWebviewStateChanged',
    onContextStateChanged: 'onContextStateChanged',
}

export const NotificationsMethodList = Object.values(NotificationMethods)

export const AuthStoreChangedNotification: NotificationType<AuthState> = { method: NotificationMethods.onAuthStateChanged };
export const WebviewStateChangedNotification: NotificationType<WebviewState> = { method: NotificationMethods.onWebviewStateChanged };
export const ContextStoreChangedNotification: NotificationType<ContextStoreState> = { method: NotificationMethods.onContextStateChanged };
