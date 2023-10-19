/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as Synapse from "./syntax-tree-interfaces";

export interface Visitor {
    beginVisitSTNode?(node: Synapse.STNode): void;
    endVisitSTNode?(node: Synapse.STNode): void;

    beginVisitTMessage?(node: Synapse.TMessage): void;
    endVisitTMessage?(node: Synapse.TMessage): void;

    beginVisitTDocumentation?(node: Synapse.TDocumentation): void;
    endVisitTDocumentation?(node: Synapse.TDocumentation): void;

    beginVisitLog?(node: Synapse.Log): void;
    endVisitLog?(node: Synapse.Log): void;

    beginVisitInterfaceType?(node: Synapse.InterfaceType): void;
    endVisitInterfaceType?(node: Synapse.InterfaceType): void;

    beginVisitBindingOperationType?(node: Synapse.BindingOperationType): void;
    endVisitBindingOperationType?(node: Synapse.BindingOperationType): void;

    beginVisitExtensibleDocumentedType?(node: Synapse.ExtensibleDocumentedType): void;
    endVisitExtensibleDocumentedType?(node: Synapse.ExtensibleDocumentedType): void;

    beginVisitDocumentedType?(node: Synapse.DocumentedType): void;
    endVisitDocumentedType?(node: Synapse.DocumentedType): void;

    beginVisitTExtensibleAttributesDocumented?(node: Synapse.TExtensibleAttributesDocumented): void;
    endVisitTExtensibleAttributesDocumented?(node: Synapse.TExtensibleAttributesDocumented): void;

    beginVisitTExtensibleDocumented?(node: Synapse.TExtensibleDocumented): void;
    endVisitTExtensibleDocumented?(node: Synapse.TExtensibleDocumented): void;

    beginVisitTFault?(node: Synapse.TFault): void;
    endVisitTFault?(node: Synapse.TFault): void;

    beginVisitBindingType?(node: Synapse.BindingType): void;
    endVisitBindingType?(node: Synapse.BindingType): void;

    beginVisitTPortType?(node: Synapse.TPortType): void;
    endVisitTPortType?(node: Synapse.TPortType): void;

    beginVisitDescriptionType?(node: Synapse.DescriptionType): void;
    endVisitDescriptionType?(node: Synapse.DescriptionType): void;

    beginVisitTParam?(node: Synapse.TParam): void;
    endVisitTParam?(node: Synapse.TParam): void;

    beginVisitIncludeType?(node: Synapse.IncludeType): void;
    endVisitIncludeType?(node: Synapse.IncludeType): void;

    beginVisitTPart?(node: Synapse.TPart): void;
    endVisitTPart?(node: Synapse.TPart): void;

    beginVisitTExtensibilityElement?(node: Synapse.TExtensibilityElement): void;
    endVisitTExtensibilityElement?(node: Synapse.TExtensibilityElement): void;

    beginVisitInterfaceOperationType?(node: Synapse.InterfaceOperationType): void;
    endVisitInterfaceOperationType?(node: Synapse.InterfaceOperationType): void;

    beginVisitDocumentationType?(node: Synapse.DocumentationType): void;
    endVisitDocumentationType?(node: Synapse.DocumentationType): void;

    beginVisitEndpointType?(node: Synapse.EndpointType): void;
    endVisitEndpointType?(node: Synapse.EndpointType): void;

    beginVisitServiceType?(node: Synapse.ServiceType): void;
    endVisitServiceType?(node: Synapse.ServiceType): void;

    beginVisitTmediatorProperty?(node: Synapse.TmediatorProperty): void;
    endVisitTmediatorProperty?(node: Synapse.TmediatorProperty): void;

    beginVisitTTypes?(node: Synapse.TTypes): void;
    endVisitTTypes?(node: Synapse.TTypes): void;

    beginVisitBindingOperationFaultType?(node: Synapse.BindingOperationFaultType): void;
    endVisitBindingOperationFaultType?(node: Synapse.BindingOperationFaultType): void;

    beginVisitTImport?(node: Synapse.TImport): void;
    endVisitTImport?(node: Synapse.TImport): void;

    beginVisitResource?(node: Synapse.Resource): void;
    endVisitResource?(node: Synapse.Resource): void;

    beginVisitTBindingOperationMessage?(node: Synapse.TBindingOperationMessage): void;
    endVisitTBindingOperationMessage?(node: Synapse.TBindingOperationMessage): void;

    beginVisitParameter?(node: Synapse.Parameter): void;
    endVisitParameter?(node: Synapse.Parameter): void;

    beginVisitTOperation?(node: Synapse.TOperation): void;
    endVisitTOperation?(node: Synapse.TOperation): void;

    beginVisitMessageRefFaultType?(node: Synapse.MessageRefFaultType): void;
    endVisitMessageRefFaultType?(node: Synapse.MessageRefFaultType): void;

    beginVisitTDefinitions?(node: Synapse.TDefinitions): void;
    endVisitTDefinitions?(node: Synapse.TDefinitions): void;

    beginVisitExtensionElement?(node: Synapse.ExtensionElement): void;
    endVisitExtensionElement?(node: Synapse.ExtensionElement): void;

    beginVisitMediatorProperty?(node: Synapse.MediatorProperty): void;
    endVisitMediatorProperty?(node: Synapse.MediatorProperty): void;

    beginVisitBindingFaultType?(node: Synapse.BindingFaultType): void;
    endVisitBindingFaultType?(node: Synapse.BindingFaultType): void;

    beginVisitImportType?(node: Synapse.ImportType): void;
    endVisitImportType?(node: Synapse.ImportType): void;

    beginVisitTBindingOperation?(node: Synapse.TBindingOperation): void;
    endVisitTBindingOperation?(node: Synapse.TBindingOperation): void;

    beginVisitTPort?(node: Synapse.TPort): void;
    endVisitTPort?(node: Synapse.TPort): void;

    beginVisitFeature?(node: Synapse.Feature): void;
    endVisitFeature?(node: Synapse.Feature): void;

    beginVisitTDocumented?(node: Synapse.TDocumented): void;
    endVisitTDocumented?(node: Synapse.TDocumented): void;

    beginVisitMessageRefType?(node: Synapse.MessageRefType): void;
    endVisitMessageRefType?(node: Synapse.MessageRefType): void;

    beginVisitBindingOperationMessageType?(node: Synapse.BindingOperationMessageType): void;
    endVisitBindingOperationMessageType?(node: Synapse.BindingOperationMessageType): void;

    beginVisitTypesType?(node: Synapse.TypesType): void;
    endVisitTypesType?(node: Synapse.TypesType): void;

    beginVisitTBinding?(node: Synapse.TBinding): void;
    endVisitTBinding?(node: Synapse.TBinding): void;

    beginVisitInterfaceFaultType?(node: Synapse.InterfaceFaultType): void;
    endVisitInterfaceFaultType?(node: Synapse.InterfaceFaultType): void;

    beginVisitTBindingOperationFault?(node: Synapse.TBindingOperationFault): void;
    endVisitTBindingOperationFault?(node: Synapse.TBindingOperationFault): void;

    beginVisitTService?(node: Synapse.TService): void;
    endVisitTService?(node: Synapse.TService): void;

    // Manually added methods.
    beginVisitInSequence?(node: Synapse.Sequence): void;
    endVisitInSequence?(node: Synapse.Sequence): void;

    beginVisitOutSequence?(node: Synapse.Sequence): void;
    endVisitOutSequence?(node: Synapse.Sequence): void;
}
