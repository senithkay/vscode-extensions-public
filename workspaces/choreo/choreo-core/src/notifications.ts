import { NotificationType } from "vscode-messenger-common";
import { AuthState, LinkedDirectoryState } from "./types";


const NotificationMethods = {
    onAuthStateChanged: 'onAuthStateChanged',
    onLinkedDirChanged: 'onLinkedDirChanged'
}

export const NotificationsMethodList = Object.values(NotificationMethods)

export const AuthStoreChangedNotification: NotificationType<AuthState> = { method: NotificationMethods.onAuthStateChanged };
export const LinkedDirStoreChangedNotification: NotificationType<LinkedDirectoryState> = { method: NotificationMethods.onLinkedDirChanged };
