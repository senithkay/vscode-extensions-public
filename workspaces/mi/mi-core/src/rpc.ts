/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RequestType, NotificationType } from 'vscode-messenger-common';

// request types 
export const ExecuteCommandRequest: RequestType<string[], unknown> = { method: 'executeCommand' };

// notification types
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
   return {
      message: err.message,
      cause: err.cause ? err.cause.message : ""
   };
}
