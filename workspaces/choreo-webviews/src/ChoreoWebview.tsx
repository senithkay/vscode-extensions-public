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
import { ComponentWizard } from "./MultiStepComponentWizard/ComponentWizard";
import { ChoreoWebViewContext } from "./context/choreo-web-view-ctx";
import { usePopulateContext } from "./hooks/context-populate";
import { ProjectWizard } from "./ProjectWizard/ProjectWizard";
import { ChoreoArchitectureView } from "./ChoreoArchitectureView/ArchitectureView";
import { ChoreoWebviewQueryClientProvider } from "./utilities/query/query";
import { ComponentCreateMode } from "@wso2-enterprise/choreo-core";
import { ProjectView } from "./ActivityBar/ProjectView";
import { AccountView } from "./ActivityBar/AccountView";
import { ChoreoComponentsContextProvider } from "./context/choreo-components-ctx";

export const Main: React.FC<any> = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 100vh;
`;

interface ChoreoWebviewProps {
    type: string;
    projectId?: string;
    orgName?: string;
    choreoUrl?: string;
    componentCreateMode?: ComponentCreateMode;
}

function ChoreoWebview(props: ChoreoWebviewProps) {
    const { type, orgName, projectId, choreoUrl, componentCreateMode } = props;

    const switchViews = () => {
        switch (type) {
            case "ProjectCreateForm":
                return <ProjectWizard />;
            case "ComponentCreateForm":
                return <ComponentWizard componentCreateMode={componentCreateMode} />;
            case "ActivityBarProjectView":
                return <ProjectView />;
            case "ActivityBarAccountView":
                return <AccountView />;
        }
    };

    return (
        <ChoreoWebviewQueryClientProvider>
            <Main>
                {type === "ChoreoArchitectureView" ? (
                    <ChoreoArchitectureView projectId={projectId} orgName={orgName} />
                ) : (
                    <ChoreoWebViewContext.Provider value={usePopulateContext({ choreoUrl })}>
                        <ChoreoComponentsContextProvider>
                            {switchViews()}
                        </ChoreoComponentsContextProvider>
                    </ChoreoWebViewContext.Provider>
                )}
            </Main>
        </ChoreoWebviewQueryClientProvider>
    );
}

export default ChoreoWebview;
