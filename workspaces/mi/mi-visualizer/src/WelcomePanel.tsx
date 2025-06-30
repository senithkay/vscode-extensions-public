/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
