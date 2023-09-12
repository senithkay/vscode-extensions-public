/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface STNode {
  tag: string;
  value?: any;
  parent?: STNode;
  viewState?: any;
  position?: NodePosition;
}

export interface Mediator extends STNode {
  children: Mediator[];
}

export interface Connector extends STNode {}

export interface Api extends STNode {
  children: Resource[];
}

export interface Proxy extends STNode {
  children: STNode[];
}

export interface InSequence extends STNode {
  children: STNode[];
}

export interface OutSequence extends STNode {
  children: STNode[];
}

export interface Resource extends STNode {
  children: STNode[];
}

export interface Log extends STNode {
  children: STNode[];
}

export interface CallTemplate extends STNode {
  children: STNode[];
}

export interface Drop extends STNode {
  children: STNode[];
}

export interface LoopBack extends STNode {
  children: STNode[];
}

export interface Property extends STNode {
  children: STNode[];
}

export interface PropertyGroup extends STNode {
  children: STNode[];
}

export interface Respond extends STNode {
  children: STNode[];
}

export interface Sequence extends STNode {
  children: STNode[];
}

export interface Store extends STNode {
  children: STNode[];
}

export interface ConditionalRouter extends STNode {
  children: STNode[];
}

export interface Bean extends STNode {
  children: STNode[];
}

export interface Class extends STNode {
  children: STNode[];
}

export interface Command extends STNode {
  children: STNode[];
}

export interface Ejb extends STNode {
  children: STNode[];
}

export interface Script extends STNode {
  children: STNode[];
}

export interface Spring extends STNode {
  children: STNode[];
}

export interface Enrich extends STNode {
  children: STNode[];
}

export interface Fault extends STNode {
  children: STNode[];
}

export interface Header extends STNode {
  children: STNode[];
}

export interface PayloadFactory extends STNode {
  children: STNode[];
}

export interface Smooks extends STNode {
  children: STNode[];
}

export interface URLrewrite extends STNode {
  children: STNode[];
}

export interface XQuery extends STNode {
  children: STNode[];
}

export interface XSLT extends STNode {
  children: STNode[];
}

export interface DataMapper extends STNode {
  children: STNode[];
}

export interface FastXSLT extends STNode {
  children: STNode[];
}

export interface JsonTransform extends STNode {
  children: STNode[];
}

export interface DataServiceCall extends STNode {
  children: STNode[];
}

export interface DBLookup extends STNode {
  children: STNode[];
}

export interface DBReport extends STNode {
  children: STNode[];
}

export interface Enqueue extends STNode {
  children: STNode[];
}

export interface Event extends STNode {
  children: STNode[];
}

export interface Transaction extends STNode {
  children: STNode[];
}

export interface Callout extends STNode {
  children: STNode[];
}

export interface Oauth extends STNode {
  children: STNode[];
}

export interface Ntlm extends STNode {
  children: STNode[];
}

export interface Builder extends STNode {
  children: STNode[];
}

export interface Bam extends STNode {
  children: STNode[];
}

export interface Publish extends STNode {
  children: STNode[];
}

export interface Call extends STNode {
  children: STNode[];
}

export interface Send extends STNode {
  children: STNode[];
}

export interface Filter extends STNode {
  children: STNode[];
}

export interface Switch extends STNode {
  children: STNode[];
}

export interface Validate extends STNode {
  children: STNode[];
}

export interface Cache extends STNode {
  children: STNode[];
}

export interface Throttle extends STNode {
  children: STNode[];
}

export interface Aggregate extends STNode {
  children: STNode[];
}

export interface Clone extends STNode {
  children: STNode[];
}

export interface Iterate extends STNode {
  children: STNode[];
}

export interface ForEach extends STNode {
  children: STNode[];
}

export interface Entitlement extends STNode {
  children: STNode[];
}

export interface Rule extends STNode {
  children: STNode[];
}

export interface NodePosition {
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
}
