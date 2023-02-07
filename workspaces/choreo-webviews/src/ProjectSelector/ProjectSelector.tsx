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

import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { Project } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ErrorBanner } from "../Commons/ErrorBanner";

interface SelectorProps {
    currentProject: string | undefined;
    setProject: (project: string) => void;
}

export function ProjectSelector(props: SelectorProps) {
    const { currentProject, setProject } = props;
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [projects, setProjects] = useState<Project[] | undefined>(undefined);

    useEffect(() => {
        try {
            ChoreoWebViewAPI.getInstance().getAllProjects().then((fetchedProjects) => {
                if (fetchedProjects.length > 0) {
                    setProjects(fetchedProjects);
                    setProject(fetchedProjects[0].id);
                } else {
                    throw new Error("Error: Could not detect projects in your organization.");
                }
            })
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <label htmlFor="project-dropdown">Select Project</label>
            {!projects && !errorMsg && <VSCodeProgressRing />}
            {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
            {projects && projects.length > 0 && (
                <VSCodeDropdown id="project-dropdown" onChange={(e: any) => { setProject(e.target.value) }}>
                    {projects?.map((project: Project) => (
                        <VSCodeOption value={project.id} selected={currentProject === project.id}>{project.name}</VSCodeOption>
                    ))}
                </VSCodeDropdown>
            )}
        </>
    )
}
