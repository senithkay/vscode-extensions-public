import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { Project } from "../utilities/types";
import { WebViewRpc } from "../utilities/WebViewRpc";

export function ProjectSelector() {
    const [projects, setProjects] = useState<Project[] | undefined>(undefined);

    useEffect(() => {
        const rpcInstance = WebViewRpc.getInstance();
        rpcInstance.getProjectsByOrg().then((fetchedProjects) => {
            setProjects(fetchedProjects);
        })
    }, [])

    return (
        <>
            <label htmlFor="project-dropdown">Select Project</label>
            {!projects && <VSCodeProgressRing />}
            {projects && (
                <VSCodeDropdown id="project-dropdown">
                    {projects?.map((project) => (<VSCodeOption>{project.name}</VSCodeOption>))}
                </VSCodeDropdown>
            )}
        </>
    )
}
