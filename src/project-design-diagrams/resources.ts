export interface ComponentModel {
    packageId: {
        name: string,
        org: string,
        version: string
    };
    services: Map<string, Service>;
    entities: Map<string, Entity>;
}

export interface Service {
    annotation: any;
    path: string;
    serviceId: string;
    resources: any[];
    remoteFunctions: any[];
    serviceType: string;
}

export interface Entity {
    attributes: any[];
    inclusions: string[];
}

export interface AddComponentDetails {
    name: string;
    version: string;
    organization: string;
    package: string;
    directory: string;
}

export const ERROR_MESSAGE = "Project Design Diagrams: Failed to generate view.";
export const USER_TIP = "Project Design Diagrams: If you want to generate the diagrams for multiple packages, add them to your workspace.";
export const INCOMPATIBLE_VERSIONS_MESSAGE = "Project Design Diagrams: Incompatible Ballerina version. Update to Ballerina version 2201.2.2 or above to activate the feature.";
