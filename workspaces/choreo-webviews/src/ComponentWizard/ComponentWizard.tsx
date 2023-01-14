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

import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProjectSelector } from "../ProjectSelector/ProjectSelector";
import { ComponentTypeSelector } from "./ComponetTypeSelector/ComponentTypeSelector";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoServiceComponentType, ComponentAccessibility } from "@wso2-enterprise/choreo-core";

const WizardContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

export function ComponentWizard() {
    const { loginStatus, loginStatusPending } = useContext(ChoreoWebViewContext);

    const [name, setName] = useState<string | undefined>('');
    const [inProgress, setProgressStatus] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>('');
    const [accessibility, setAccessibility] = useState<ComponentAccessibility>('External');
    const [selectedType, setSelectedType] = useState<ChoreoServiceComponentType>(ChoreoServiceComponentType.REST_API);

    const handleComponentCreation = async () => {
        if (name && projectId && description && selectedType) {
            setProgressStatus(true);
            await ChoreoWebViewAPI.getInstance().createComponent({
                name: name,
                projectId: projectId,
                type: selectedType,
                accessibility: accessibility,
                description: description
            }).then(() => {
                setProgressStatus(false);
                closeWebView();
            }).catch((err: Error) => {
                ChoreoWebViewAPI.getInstance().showErrorMsg(err.message);
            })
        }
    }

    const canCreateComponent = (): boolean => {
        if (name && projectId && accessibility && selectedType) {
            return true;
        }
        return false;
    }

    const closeWebView = () => {
        ChoreoWebViewAPI.getInstance().closeWebView();
    }

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Component</h2>
                    <ProjectSelector currentProject={projectId} setProject={setProjectId} />
                    <ComponentTypeSelector selectedType={selectedType} onChange={setSelectedType} />
                    <VSCodeTextField
                        autofocus
                        placeholder="Name"
                        onInput={(e: any) => setName(e.target.value)}
                        value={name}
                    >
                        Component Name
                    </VSCodeTextField>
                    <VSCodeTextArea
                        autofocus
                        placeholder="Description"
                        onInput={(e: any) => setDescription(e.target.value)}
                        value={description}
                    >
                        Description
                    </VSCodeTextArea>

                    <label htmlFor="access-mode">Access Mode</label>
                    <VSCodeDropdown id="access-mode" onChange={(e: any) => setAccessibility(e.target.value)}>
                        <VSCodeOption value={'External'}><b>External:</b> API is publicly accessible</VSCodeOption>
                        <VSCodeOption value={'Internal'}><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                    </VSCodeDropdown>

                    <ActionContainer>
                        <VSCodeButton
                            appearance="secondary"
                            onClick={closeWebView}
                        >
                            Cancel
                        </VSCodeButton>
                        {inProgress && <VSCodeProgressRing />}
                        <VSCodeButton
                            appearance="primary"
                            disabled={!canCreateComponent()}
                            onClick={handleComponentCreation}
                        >
                            Create
                        </VSCodeButton>
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
