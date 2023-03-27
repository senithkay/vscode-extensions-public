import { decimal } from "vscode-languageclient";

export interface ComponentModel {
    packageId: {
        name: string,
        org: string,
        version: string
    };
    services: Map<string, Service>;
    entities: Map<string, Entity>;
    hasCompilationErrors: boolean;
}

export interface Service {
    annotation: any;
    path: string;
    serviceId: string;
    resources: any[];
    remoteFunctions: any[];
    serviceType: string;
    dependencies: any[];
    deploymentMetadata: DeploymentMetadata;
    elementLocation: Location;
}

export interface Entity {
    attributes: any[];
    inclusions: string[];
    elementLocation: Location;
    isAnonymous: boolean;
}

export interface BallerinaVersion {
    majorVersion: decimal;
    patchVersion: number;
}

export interface Location {
    filePath: string;
    startPosition: LinePosition;
    endPosition: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

export interface DeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
        },
        intranet: {
            isExposed: boolean;
        }
    };
}

export enum ServiceTypes {
    HTTP = "http",
    GRPC = "grpc",
    GRAPHQL = "graphql",
    WEBSOCKET = "websocket",
    OTHER = "other"
}

export interface CommandResponse {
    error: boolean;
    message: string;
}

export const ERROR_MESSAGE = "Project Design Diagrams: Failed to generate view.";
export const USER_TIP = "Project Design Diagrams: If you want to generate the diagrams for multiple packages, add them to your workspace.";
export const INCOMPATIBLE_VERSIONS_MESSAGE = "Project Design Diagrams: Incompatible Ballerina version. Update to Ballerina version 2201.2.2 or above to activate the feature.";
export const DIAGNOSTICS_WARNING = "Project Design Diagrams: Please resolve the diagnostics in your workspace for a better representation of your project.";

export const DEFAULT_SERVICE_TEMPLATE_SUFFIX = "-t service";
export const GRAPHQL_SERVICE_TEMPLATE_SUFFIX = "-t choreo/graphql_service";

export const triggerSource =
    "import ballerinax/{{moduleName}};\n\n" +
    "configurable {{triggerType}}:ListenerConfig config = ?;\n\n" +
    "listener {{triggerType}}:Listener webhookListener =  new(config);\n\n" +

    "{{#each serviceTypes}}" +
    "@display {\n" +
        "label: \"{{ this.name }}\",\n" +
        "id: \"{{ this.name }}\"\n" +
    "}\n" +
    "service {{../triggerType}}:{{ this.name }} on webhookListener {\n" +
        "{{#each this.functions}}" +
        "remote function {{ this.name }}({{#each this.parameters}}{{#if @index}}, {{/if}}{{../../../triggerType}}:{{this.typeInfo.name}} {{this.name}}{{/each}}) returns error? {\n" +
            "// Not Implemented\n" +
        "}\n" +
        "{{/each}}\n" +
    "}\n\n" +
    "{{/each}}\n";
