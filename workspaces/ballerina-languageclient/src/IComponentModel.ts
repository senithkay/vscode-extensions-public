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

export interface CMNodeAttributes {
    elementLocation: CMLocation;
    diagnostics?: CMDiagnostics[];
}

export interface CMEntryPoint extends CMNodeAttributes {
    annotation: CMAnnotation;
    parameters: CMParameter[];
    returns: string[];
    type: 'scheduledTask' | 'manualTrigger';
    interactions: CMInteraction[];
}

export interface CMService extends CMNodeAttributes {
    annotation: CMAnnotation;
    path: string;
    serviceId: string;
    resources: CMResourceFunction[];
    remoteFunctions: CMRemoteFunction[];
    serviceType: string;
    dependencies: CMDependency[];
    deploymentMetadata: CMDeploymentMetadata;
}

export interface CMAnnotation extends CMNodeAttributes {
    id: string;
    label: string;
}

export interface CMDependency extends CMNodeAttributes {
    serviceId: string;
    connectorType: string;
}

export interface CMResourceFunction extends CMNodeAttributes {
    identifier: string;
    resourceId: CMResourceId;
    parameters: CMParameter[];
    returns: string[];
    interactions: CMInteraction[];
}

export interface CMRemoteFunction extends CMNodeAttributes {
    name: string;
    parameters: CMParameter[];
    returns: string[];
    interactions: CMInteraction[];
}

export interface CMInteraction extends CMNodeAttributes {
    resourceId: CMResourceId;
    connectorType: string;
}

export interface CMParameter extends CMNodeAttributes {
    name: string;
    type: string[];
    in?: string;
    isRequired: boolean;
}

export interface CMResourceId {
    serviceId: string;
    path: string;
    action: string;
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
    self: string;
    associate: string;
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
