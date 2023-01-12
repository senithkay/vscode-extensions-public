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

import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProjectSelector } from "../ProjectSelector/ProjectSelector";
import { ComponentTypeSelector } from "./ComponetTypeSelector/ComponentTypeSelector";

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

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Component</h2>
                    <ProjectSelector />
                    <ComponentTypeSelector onChange={(e) => console.log(e)} />
                    <VSCodeTextField autofocus placeholder="Name">Component Name</VSCodeTextField>
                    <VSCodeTextArea autofocus placeholder="Description">Description</VSCodeTextArea>

                    <label htmlFor="access-mode">Access Mode</label>
                    <VSCodeDropdown id="access-mode">
                        <VSCodeOption><b>External:</b> API is publicly accessible</VSCodeOption>
                        <VSCodeOption><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                    </VSCodeDropdown>


                    <ActionContainer>
                        <VSCodeButton appearance="secondary">Cancel</VSCodeButton>
                        <VSCodeButton appearance="primary">Create</VSCodeButton>
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
