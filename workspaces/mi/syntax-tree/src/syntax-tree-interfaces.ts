/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum LogCategory {
  INFO,
  FATAL,
  ERROR,
  WARN,
  DEBUG,
  TRACE,
}

export enum LogLevel {
  simple,
  headers,
  full,
  custom,
}

export enum EnableDisable {
  enable,
  disable,
}

export enum SetRemove {
  set,
  remove,
}

export interface STNode {
  attributes: STNodeAttributes[];
  children: STNode[];
  end: number;
  endTagOffOffset: number;
  endTagOpenOffset: number;
  hasTextNode: boolean;
  selfClosed: boolean;
  start: number;
  startTagOffOffset: number;
  startTagOpenOffset: number;
  tag: string;
}

export interface STNodeAttributes {
  closed: boolean;
  hasDelimiter: boolean;
  name: string;
  nameTagOffOffset: number;
  nameTagOpenOffset: number;
  originalValue: string
  quotelessValue: string
  valueTagOffOffset: number
  valueTagOpenOffset: number
}

export interface TMessage extends TExtensibleDocumented, STNode {
  part: TPart[];
  name: string;
}

export interface TDocumentation extends STNode {
  content: any[];
}

export interface Log extends STNode {
  property: MediatorProperty[];
  level: string;
  separator: string;
  category: string;
  description: string;
}

export interface InterfaceType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  styleDefault: {
  };
}

export interface BindingOperationType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  ref: string;
}

export interface ExtensibleDocumentedType extends DocumentedType, STNode {
  otherAttributes: any;
}

export interface DocumentedType extends STNode {
  documentation: DocumentationType[];
}

export interface TExtensibleAttributesDocumented extends TDocumented, STNode {
  otherAttributes: any;
}

export interface TExtensibleDocumented extends TDocumented, STNode {
  any: any[];
}

export interface TFault extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  message: string;
}

export interface BindingType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  type: string;
}

export interface TPortType extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  operation: TOperation[];
  name: string;
}

export interface DescriptionType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  targetNamespace: string;
}

export interface TParam extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  message: string;
}

export interface IncludeType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  location: string;
}

export interface TPart extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  element: string;
  type: string;
}

export interface TExtensibilityElement extends STNode {
  required: Boolean;
}

export interface InterfaceOperationType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  pattern: string;
  safe: Boolean;
  style: string;
}

export interface DocumentationType extends STNode {
  otherAttributes: any;
  content: any[];
}

export interface EndpointType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  name: string;
  binding: string;
  address: string;
}

export interface ServiceType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  endpointOrAny: EndpointType[];
  name: string;
}

export interface TmediatorProperty extends STNode {
  otherAttributes: any;
  content: any[];
  name: string;
  value: string;
  expression: string;
}

export interface TTypes extends TExtensibleDocumented, STNode {
}

export interface BindingOperationFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface TImport extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  namespace: string;
  location: string;
}

export interface Resource extends STNode {
  location: string;
  key: string;
}

export interface TBindingOperationMessage extends TExtensibleDocumented, STNode {
  name: string;
}

export interface Parameter extends STNode {
  otherAttributes: any;
  content: any[];
  name: string;
  key: string;
  locked: Boolean;
}

export interface TOperation extends TExtensibleDocumented, STNode {
  name: string;
  parameterOrder: {
  };
}

export interface MessageRefFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface TDefinitions extends TExtensibleDocumented, STNode {
  targetNamespace: string;
  name: string;
}

export interface ExtensionElement extends STNode {
  required: Boolean;
}

export interface MediatorProperty extends STNode {
  tmediatorProperty: TmediatorProperty;
}

export interface BindingFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
}

export interface ImportType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  namespace: string;
  location: string;
}

export interface TBindingOperation extends TExtensibleDocumented, STNode {
  input: TBindingOperationMessage;
  output: TBindingOperationMessage;
  fault: TBindingOperationFault[];
  name: string;
}

export interface TPort extends TExtensibleDocumented, STNode {
  name: string;
  binding: string;
}

export interface Feature extends STNode {
  name: string;
  value: Boolean;
}

export interface TDocumented extends STNode {
  documentation: TDocumentation;
}

export interface MessageRefType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  messageLabel: string;
  element: string;
}

export interface BindingOperationMessageType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  messageLabel: string;
}

export interface TypesType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
}

export interface TBinding extends TExtensibleDocumented, STNode {
  operation: TBindingOperation[];
  name: string;
  type: string;
}

export interface InterfaceFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  name: string;
  element: string;
}

export interface TBindingOperationFault extends TExtensibleDocumented, STNode {
  name: string;
}

export interface TService extends TExtensibleDocumented, STNode {
  port: TPort[];
  name: string;
}

export interface Sequence extends STNode {
  name: string;
  onError: string;
  description: string;
  statistics: string;
  trace: string;
}
