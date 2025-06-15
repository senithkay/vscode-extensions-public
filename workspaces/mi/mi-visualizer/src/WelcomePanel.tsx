/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { SamplesView } from "./views/SamplesView";
import { ProjectWizard } from "./views/Forms/ProjectForm";
import { ImportProjectWizard } from "./views/Forms/ImportProjectForm";
import { WelcomeView } from "./views/WelcomeView";
import { ImportCAPPWizard } from "./views/Forms/ImportCAPPForm";

interface WelcomePanelProps {
    machineView: MACHINE_VIEW;
}
export function WelcomePanel(props: WelcomePanelProps) {
    const { machineView } = props;

    return (
        <>
            {machineView === MACHINE_VIEW.Welcome && <WelcomeView />}
            {machineView === MACHINE_VIEW.ProjectCreationForm && <ProjectWizard cancelView={MACHINE_VIEW.Welcome} />}
            {machineView === MACHINE_VIEW.Samples && <SamplesView />}
            {machineView === MACHINE_VIEW.ImportProject && <ImportProjectWizard />}
            {machineView === MACHINE_VIEW.ImportProjectForm && <ImportCAPPWizard />}
        </>
    );
}
