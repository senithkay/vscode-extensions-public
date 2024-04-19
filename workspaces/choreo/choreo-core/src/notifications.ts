import { NotificationType } from "vscode-messenger-common";
import { AuthState, LinkedDirectoryState, WebviewState } from "./types";


const NotificationMethods = {
    onAuthStateChanged: 'onAuthStateChanged',
    onLinkedDirChanged: 'onLinkedDirChanged',
    onWebviewStateChanged: 'onWebviewStateChanged'
}

export const NotificationsMethodList = Object.values(NotificationMethods)

export const AuthStoreChangedNotification: NotificationType<AuthState> = { method: NotificationMethods.onAuthStateChanged };
export const LinkedDirStoreChangedNotification: NotificationType<LinkedDirectoryState> = { method: NotificationMethods.onLinkedDirChanged };
export const WebviewStateChangedNotification: NotificationType<WebviewState> = { method: NotificationMethods.onWebviewStateChanged };
