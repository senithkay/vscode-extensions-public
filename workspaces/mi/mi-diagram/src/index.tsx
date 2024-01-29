/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { MIDiagram } from "./MIDiagram";
import { ActivityPanel } from "./activity-panel";
import { APIWizard } from "./APIform";
import { EndpointWizard } from "./EndpointForm";
import { SequenceWizard } from "./SequenceForm";
import { ProjectWizard } from "./ProjectForm";

export function renderMIDiagram(documentUri: string, resource: string) {
    ReactDOM.render(
        <MIDiagram documentUri={documentUri} resource={resource}></MIDiagram>,
        document.getElementById("mi-diagram-container")
    );
}

export function renderActivityPanel() {
    ReactDOM.render(
        <ActivityPanel />,
        document.getElementById("activity-panel-container")
    );
}

export function renderAPIWizard() {
    ReactDOM.render(
        <APIWizard />,
        document.getElementById("mi-api-wizard-container")
    );
}

export function renderEndpointWizard() {
    ReactDOM.render(
        <EndpointWizard />,
        document.getElementById("mi-endpoint-wizard-container")
    );
}

export function renderSequenceWizard() {
    ReactDOM.render(
        <SequenceWizard />,
        document.getElementById("mi-sequence-wizard-container")
    );
}

export function renderProjectWizard() {
    ReactDOM.render(
        <ProjectWizard />,
        document.getElementById("mi-project-wizard-container")
    );
}
