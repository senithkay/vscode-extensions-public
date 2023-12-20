import React from 'react';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const buttonStyle = {
    "width": "100%", 
    "maxWidth": "300px"
}

const InitProject = () => {

    const openProject = () => {
        //
    }

    const createProject = () => {
        //
    }

    return (
        <>
            <p>You have not yet opened an eggplant project.</p>
            <VSCodeButton onClick={openProject} style={buttonStyle}>Open Eggplant Project</VSCodeButton>
            <p>Or create a new Eggplant project by clicking the button below.</p>
            <VSCodeButton title="Create a new eggplant project" onClick={createProject} style={buttonStyle}>Create Eggplant Project</VSCodeButton>
        </>
    );
};

export default InitProject;

