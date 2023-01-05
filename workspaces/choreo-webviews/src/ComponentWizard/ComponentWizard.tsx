import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProjectSelector } from "../ProjectSelector/ProjectSelector";

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
