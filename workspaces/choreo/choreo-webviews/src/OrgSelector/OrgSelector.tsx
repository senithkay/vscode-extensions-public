/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
