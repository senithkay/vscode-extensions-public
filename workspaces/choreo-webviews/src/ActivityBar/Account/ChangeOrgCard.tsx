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
import React from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { AlertBox } from "../Components/AlertBox";

export const ChangeOrgCard = () => {
    const { userInfo, workspaceMetaData } = useChoreoWebViewContext();

    const org = userInfo?.organizations?.find((item) => item.id === workspaceMetaData?.orgId);

    const changeOrg = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.org.change", workspaceMetaData?.orgId);
    };

    return (
        <div>
            <AlertBox
                subTitle={`The currently opened project is associated with ${org?.name} organization. Kindly switch to it in order to access this project.`}
                buttonTitle={`Switch to ${org?.name} organization`}
                variant="secondary"
                onClick={changeOrg}
            />
        </div>
    );
};
