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

    return (
        <ChoreoWebviewQueryClientProvider>
            <Main>
                {(() => {
                    switch (type) {
                        case "ChoreoArchitectureView":
                            return <ChoreoArchitectureView projectId={projectId} orgName={orgName} />;
                        case "ProjectCreateForm":
                            return (
                                <ChoreoWebViewContext.Provider value={usePopulateContext({ choreoUrl })}>
                                    <ProjectWizard />
                                </ChoreoWebViewContext.Provider>
                            );
                        case "ComponentCreateForm":
                            return (
                                <ChoreoWebViewContext.Provider value={usePopulateContext({ choreoUrl })}>
                                    <ComponentWizard componentCreateMode={componentCreateMode} />
                                </ChoreoWebViewContext.Provider>
                            );
                        case "ActivityBarAccountView":
                            return (
                                <ChoreoWebViewContext.Provider value={usePopulateContext({ choreoUrl })}>
                                    <AccountView />
                                </ChoreoWebViewContext.Provider>
                            );
                        case "ActivityBarProjectView":
                            return (
                                <ChoreoWebViewContext.Provider value={usePopulateContext({ choreoUrl })}>
                                    <ChoreoComponentsContextProvider>
                                        <ProjectView />
                                    </ChoreoComponentsContextProvider>
                                </ChoreoWebViewContext.Provider>
                            );
                        default:
                            return null;
                    }
                })()}
            </Main>
        </ChoreoWebviewQueryClientProvider>
    );
}

export default ChoreoWebview;
