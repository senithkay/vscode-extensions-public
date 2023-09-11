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
import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";

export function OrgSelector() {

    const { selectedOrg, userOrgs, fetchingOrgInfo } = useChoreoWebViewContext();

    return (
        <>
            <label htmlFor="org-dropdown" >Select Organization</label>
            {fetchingOrgInfo && <VSCodeProgressRing />}
            {!fetchingOrgInfo && (
                <VSCodeDropdown id="org-dropdown">
                    {userOrgs?.map((org) => (<VSCodeOption selected={selectedOrg?.id === org.id}>{org.name}</VSCodeOption>))}
                </VSCodeDropdown>
            )}
        </>
    )
}
