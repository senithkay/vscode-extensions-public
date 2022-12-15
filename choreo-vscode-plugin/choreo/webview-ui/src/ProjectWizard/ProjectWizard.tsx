import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeLink, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useState } from "react";
import { OrgSelector } from "../OrgSelector/OrgSelector";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    justify-content: space-evenly;
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

    const handleInitiMonoRepoCheckChange = (e: any) => {
        setInitMonoRepo(e.target.checked);
    }

    return (
        <WizardContainer>
            <h2>Choreo Project Wizard</h2>
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
    );
}