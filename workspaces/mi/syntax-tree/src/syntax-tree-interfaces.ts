/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

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
  originalValue: string;
  quotelessValue: string;
  valueTagOffOffset: number;
  valueTagOpenOffset: number;
}

export interface Fault extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  name: string;
  element: string;
}

export interface Documentation extends STNode {
  otherAttributes: any;
  content: any[];
}

export interface Interface extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  name: string;
  styleDefault: {
  };
}

export interface Endpoint extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  name: string;
  binding: string;
  address: string;
}

export interface Definitions extends STNode {
  documentation: {
    content: any[];
  };
  any: any[];
  targetNamespace: string;
  name: string;
}

export interface Input extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  messageLabel: string;
}

export interface Service extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  endpointOrAny: Endpoint[];
  name: string;
}

export interface Infault extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface Log extends STNode {
  property: {
    otherAttributes: any;
    content: any[];
    name: string;
    value: string;
    expression: string;
  }[];
  level: string;
  separator: string;
  category: string;
  description: string;
}

export interface Output extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  messageLabel: string;
  element: string;
}

export interface Binding extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  name: string;
  type: string;
}

export interface Outfault extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface Description extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  targetNamespace: string;
}

export interface Resource extends STNode {
  location: string;
  key: string;
}

export interface Parameter extends STNode {
  otherAttributes: any;
  content: any[];
  name: string;
  key: string;
  locked: Boolean;
}

export interface Operation extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  ref: string;
}

export interface Include extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  location: string;
}

export interface Import extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
  namespace: string;
  location: string;
}

export interface Feature extends STNode {
  name: string;
  value: Boolean;
}

export interface Types extends STNode {
  documentation: Documentation[];
  otherAttributes: any;
  any: any[];
}

export interface Sequence extends STNode {
  name: string;
  onError: string;
  description: string;
  statistics: string;
  trace: string;
}
