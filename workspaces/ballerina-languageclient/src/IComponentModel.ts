import { LinePosition } from "./IBallerinaLanguageClient";

export interface ComponentModel {
    packageId: CMPackageID;
    services: Map<string, CMService>;
    entities: Map<string, CMEntity>;
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

interface CMNodeAttributes {
    elementLocation: CMLocation;
    diagnostics?: CMDiagnostics[];
}

interface CMFunctionAttributes extends CMNodeAttributes {
    interactions: CMInteraction[];
    parameters: CMParameter[];
    returns: string[];
}

export interface CMEntryPoint extends CMFunctionAttributes {
    annotation: CMAnnotation;
    type?: 'scheduledTask' | 'manualTrigger';
}

export interface CMService extends CMNodeAttributes {
    annotation: CMAnnotation;
    path: string;
    serviceId: string;
    dependencies: CMDependency[];
    deploymentMetadata: CMDeploymentMetadata;
    remoteFunctions: CMRemoteFunction[];
    resources: CMResourceFunction[];
    serviceType: string;
}

export interface CMAnnotation extends CMNodeAttributes {
    id: string;
    label: string;
}

export interface CMDependency extends CMNodeAttributes {
    connectorType: string;
    serviceId: string;
}

export interface CMResourceFunction extends CMFunctionAttributes {
    identifier: string;
    resourceId: CMResourceId;
}

export interface CMRemoteFunction extends CMFunctionAttributes {
    name: string;
}

export interface CMInteraction extends CMNodeAttributes {
    resourceId: CMResourceId;
    connectorType: string;
}

export interface CMParameter extends CMNodeAttributes {
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

export interface CMEntity extends CMNodeAttributes {
    attributes: CMAttribute[];
    inclusions: string[];
    isAnonymous: boolean;
}

export interface CMAttribute extends CMNodeAttributes {
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
