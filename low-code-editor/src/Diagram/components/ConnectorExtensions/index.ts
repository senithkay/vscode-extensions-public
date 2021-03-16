/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { GithubWizard } from "./GithubWizard";
import { GmailWizard } from "./GmailWizard";
import { GoogleCalender } from "./GoogleCalenderWizard";
import { GoogleSheet } from "./GoogleSheetWizard";
import { HTTPWizard } from "./HTTPWizard";
import { BulkJob } from "./SFDCWizard/BulkJob";
import { QueryClient } from "./SFDCWizard/QueryClient";
import { SObjectClient } from "./SFDCWizard/SObjectClient";
import { SMTPWizard } from "./SMTPWizard";

export { HTTPWizard as httpHttpClient };
export { SMTPWizard as emailSmtpClient };
export { BulkJob as sfdcBulkJob };
export { QueryClient as sfdcQueryClient };
export { SObjectClient as sfdcSObjectClient };
export { GmailWizard as googleapis_gmailClient };
export { GithubWizard as githubClient };
export { GoogleCalender as googleapis_calendarClient };
export { GoogleSheet as googleapis_sheetsClient };
