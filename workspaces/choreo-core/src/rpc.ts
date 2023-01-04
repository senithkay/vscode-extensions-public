import { RequestType, NotificationType } from 'vscode-messenger-common';
import { Organization, ChoreoLoginStatus } from './types';

// request types 
export const GetLoginStatusRequest: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
export const GetCurrentOrgRequest: RequestType<string, Organization> = { method: 'getCurrentOrg' };
export const GetAllOrgsRequest: RequestType<string, Organization[]> = { method: 'getAllOrgs' };

// notification types
export const LoginStatusChangedNotification: NotificationType<string> = { method: 'loginStatusChanged' };
export const SelectedOrgChangedNotification: NotificationType<Organization> = { method: 'selectedOrgChanged' };
export const ExecuteCommandNotification: NotificationType<string[]> = { method: 'executeCommand' };
