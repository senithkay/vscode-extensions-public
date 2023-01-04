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
import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeLink, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useState } from "react";
import { OrgSelector } from "../OrgSelector/OrgSelector";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

export function ProjectWizard() {

    const [initMonoRepo, setInitMonoRepo] = useState(false);
    const { loginStatus, loginStatusPending } = useContext(ChoreoWebViewContext);

    const handleInitiMonoRepoCheckChange = (e: any) => {
        setInitMonoRepo(e.target.checked);
    }

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Project</h2>
                    <OrgSelector />
                    <VSCodeTextField autofocus placeholder="Name">Project Name</VSCodeTextField>
                    <VSCodeTextArea autofocus placeholder="Description">Project Description</VSCodeTextArea>
                    <VSCodeCheckbox checked={initMonoRepo} onChange={handleInitiMonoRepoCheckChange}>Initialize a mono repo</VSCodeCheckbox>
                    {initMonoRepo &&
                        <>
                            <VSCodeLink>Authorize with Github</VSCodeLink>
                            <VSCodeDropdown>Select Repository</VSCodeDropdown>
                        </>
                    }
                    <ActionContainer>
                        <VSCodeButton appearance="secondary">Cancel</VSCodeButton>
                        <VSCodeButton appearance="primary">Create</VSCodeButton>
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}