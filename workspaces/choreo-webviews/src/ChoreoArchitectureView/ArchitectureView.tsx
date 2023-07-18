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
import styled from "@emotion/styled";
import { GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { DesignDiagram } from "@wso2-enterprise/project-design-diagrams";
import { useOrgOfCurrentProject } from "../hooks/use-org-of-current-project";

const WizardContainer = styled.div`
    width: 100vw;
    height: 100vh;
`;

export interface ArchitectureViewProps {
    projectId?: string;
    orgName?: string;
}

export function ChoreoArchitectureView(props: ArchitectureViewProps) {
    const { orgName, projectId } = props;
    const { currentProjectOrg } = useOrgOfCurrentProject();

    const getComponentModel = async (): Promise<GetComponentModelResponse> => {
        if (projectId && orgName) {
            const response: GetComponentModelResponse = await 
                ChoreoWebViewAPI.getInstance().getDiagramComponentModel(projectId, currentProjectOrg?.id);
            return response;
        }
        throw new Error("Error while loading project resources.");
    }

    return (
        <WizardContainer>
            <DesignDiagram
                isEditable={false}
                isChoreoProject={true}
                getComponentModel={getComponentModel}
            />
        </WizardContainer>
    );
}
