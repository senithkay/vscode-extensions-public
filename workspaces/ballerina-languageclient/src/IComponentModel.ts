import { LinePosition } from "./IBallerinaLanguageClient";

export interface ComponentModel {
    packageId: CMPackageID;
    version?: string;
    services: Map<string, CMService>;
    entities: Map<string, CMEntity>;
    diagnostics?: CMDiagnostics[];
    functionEntryPoint?: CMEntryPoint;
    hasCompilationErrors: boolean;
}

export interface CMDiagnostics {
    name: string;
    message?: string;
    severity?: string;
}

export interface CMPackageID {
    name: string,
    org: string,
    version: string
}

export interface CMLocation {
    filePath: string;
    startPosition: LinePosition;
    endPosition: LinePosition;
}

interface CMNode {
    elementLocation?: CMLocation;
    diagnostics?: CMDiagnostics[];
}

interface CMFunctionNode extends CMNode {
    interactions: CMInteraction[];
    parameters: CMParameter[];
    returns: string[];
}

export interface CMEntryPoint extends CMFunctionNode {
    annotation: CMAnnotation;
    dependencies: CMDependency[];
    type?: 'scheduledTask' | 'manualTrigger';
}

export interface CMService extends CMNode {
    annotation: CMAnnotation;
    path: string;
    serviceId: string;
    dependencies: CMDependency[];
    deploymentMetadata: CMDeploymentMetadata;
    remoteFunctions: CMRemoteFunction[];
    resources: CMResourceFunction[];
    serviceType: string;
    isNoData?: boolean;
}

export interface CMAnnotation extends CMNode {
    id: string;
    label: string;
}

export interface CMDependency extends CMNode {
    connectorType: string;
    serviceId: string;
}

export interface CMResourceFunction extends CMFunctionNode {
    identifier: string;
    resourceId: CMResourceId;
}

export interface CMRemoteFunction extends CMFunctionNode {
    name: string;
}

export interface CMInteraction extends CMNode {
    resourceId: CMResourceId;
    connectorType: string;
}

export interface CMParameter extends CMNode {
    in?: string;
    isRequired: boolean;
    name: string;
    type: string[];
}

export interface CMResourceId {
    action: string;
    path: string;
    serviceId: string;
}

export interface CMEntity extends CMNode {
    attributes: CMAttribute[];
    inclusions: string[];
    isAnonymous: boolean;
}

export interface CMAttribute extends CMNode {
    name: string;
    type: string;
    defaultValue: string;
    required: boolean;
    nillable: boolean;
    associations: CMAssociation[];
}

export interface CMAssociation {
    associate: string;
    cardinality: CMCardinality;
}

export interface CMCardinality {
    associate: string;
    self: string;
}

export interface CMDeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
        },
        intranet: {
            isExposed: boolean;
        }
    }
}
