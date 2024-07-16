import { ComponentEP, ComponentKind, DeploymentTrack, Environment, Organization, Project } from "./types";

export type WebviewTypes = "NewComponentForm" | "ComponentsListActivityView" | "ComponentDetailsView" | "TestView" | "ChoreoCellView"

export interface TestWebviewProps {
    type: "TestView";
    component: ComponentKind;
    project: Project;
    org: Organization;
    env: Environment;
    deploymentTrack: DeploymentTrack;
    endpoints: ComponentEP[];
}

export interface NewComponentWebviewProps {
    type: "NewComponentForm";
    directoryPath: string;
    directoryFsPath: string;
    directoryName: string;
    organization: Organization;
    project: Project;
    existingComponents: ComponentKind[];
    initialValues?: { type?: string; buildPackLang?: string; subPath?: string; };
}

export interface ComponentsDetailsWebviewProps {
    type: "ComponentDetailsView";
    organization: Organization;
    project: Project;
    component: ComponentKind;
    directoryPath?: string;
}

export interface ComponentsListActivityViewProps {
    type: "ComponentsListActivityView";
    directoryPath?: string;
}

export type WebviewProps = ComponentsDetailsWebviewProps | NewComponentWebviewProps | ComponentsListActivityViewProps | TestWebviewProps
