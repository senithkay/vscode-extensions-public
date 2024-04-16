import React, { FC } from "react";
import { ComponentKind, Organization, Project } from "@wso2-enterprise/choreo-core";
import { getTypeForDisplayType } from "../utils";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface Props {
    component: ComponentKind;
    project: Project;
    organization: Organization;
}

export const HeaderSection: FC<Props> = ({ component, organization, project }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">{component.metadata.name}</h1>
                <h2 className="text-lg md:text-xl font-extralight opacity-60 md:mt-0.5">
                    {getTypeForDisplayType(component?.spec?.type)}
                </h2>
            </div>

            <div className="flex flex-wrap gap-2">
                <div>
                    <span className="font-extralight">Project:</span> {project.name}
                </div>
                <div>
                    <span className="opacity-70">Organization:</span> {organization.name}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <VSCodeButton appearance="secondary">Open in Console</VSCodeButton>
                <VSCodeButton appearance="secondary">Open Git Repository</VSCodeButton>
                <VSCodeButton appearance="secondary">Delete Component</VSCodeButton>
            </div>
        </div>
    );
};
