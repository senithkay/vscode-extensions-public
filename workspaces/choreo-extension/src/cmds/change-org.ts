/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { ExtensionContext, commands, window } from "vscode";
import { setSelectedOrgCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { getLogger } from "../logger/logger";
import { CHOREO_AUTH_ERROR_PREFIX, exchangeOrgAccessTokens } from "../auth/auth";
import { Organization, SWITCH_ORGANIZATION_EVENT } from "@wso2-enterprise/choreo-core";
import { sendTelemetryEvent } from "../telemetry/utils";


export function activateChangeOrgCmd(context: ExtensionContext) {
    const subscription = commands.registerCommand(setSelectedOrgCmdId, async (organization: Organization) => {
        if (!organization) {
            getLogger().error("Invalid arguments to switch organization.");
            window.showErrorMessage("Invalid arguments to switch organization.");
            return;
        }

        sendTelemetryEvent(SWITCH_ORGANIZATION_EVENT, { org: organization.name });
        getLogger().debug("Setting selected organization to " + organization.name);

        try {
            getLogger().debug("Exchanging access tokens for the organization " + organization.name);
            await exchangeOrgAccessTokens(organization.handle, organization.id);
        } catch (error: any) {
            getLogger().error("Error while exchanging access tokens for the organization "
                + organization.name + ". "
                + error.message
                + (error?.cause ? "\nCause: " + error.cause.message : ""));
            window.showErrorMessage(CHOREO_AUTH_ERROR_PREFIX
                + " Error while exchanging access tokens for the organization "
                + organization.name + ". " + error.message);
        }
        ext.api.selectedOrg = organization;
    });
    context.subscriptions.push(subscription);
}
