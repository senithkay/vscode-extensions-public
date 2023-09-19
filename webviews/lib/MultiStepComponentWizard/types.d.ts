import { ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentAccessibility, ComponentCreateMode, ComponentNetworkVisibility, GitProvider } from "@wso2-enterprise/choreo-core";
export interface ComponentWizardState {
    mode: ComponentCreateMode;
    name: string;
    description: string;
    type: ChoreoComponentType;
    serviceType: ChoreoServiceType;
    implementationType: ChoreoImplementationType;
    accessibility: ComponentAccessibility;
    networkVisibility: ComponentNetworkVisibility;
    port?: string;
    endpointContext?: string;
    repository: {
        isCloned?: boolean;
        isBareRepo?: boolean;
        org?: string;
        repo?: string;
        branch?: string;
        subPath?: string;
        dockerContext?: string;
        dockerFile?: string;
        openApiFilePath?: string;
        gitProvider?: GitProvider;
        credentialID?: string;
        isMonoRepo?: boolean;
    };
    webAppConfig?: {
        dockerContext?: string;
        webAppType?: string;
        webAppBuildCommand?: string;
        webAppPackageManagerVersion?: string;
        webAppOutputDirectory?: string;
    };
    trigger?: {
        id: string;
        services?: string[];
    };
    version: string;
}
