/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


export enum SchemaType {
  XML,
  JSON,
  CSV,
  XSD,
  JSONSCHEMA,
  CONNECTOR,
}

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
  attributes: STNodeAttributes[]|any;
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

export interface TExtensibleDocumented extends TDocumented, STNode {
  any: any[];
}

export interface Iterate extends STNode {
  target: Target[];
  sequential: boolean;
  continueParent: boolean;
  expression: string;
  preservePayload: boolean;
  attachPath: string;
  id: string;
  description: string;
}

export interface CalloutSource extends STNode {
  xpath: string;
  key: string;
  type: string;
}

export interface PublishEventAttributesArbitraryAttribute extends STNode {
  name: string;
  dataType: string;
  value: string;
}

export interface Feature extends STNode {
  name: string;
  value: boolean;
}

export interface MediatorProperty extends STNode {
  otherAttributes: any;
  content: any[];
  name: string;
  value: string;
  expression: string;
}

export interface TBindingOperationFault extends TExtensibleDocumented, STNode {
  name: string;
}

export interface EndpointSession extends STNode {
  sessionTimeout: number;
  type: string;
}

export interface Log extends STNode {
  property: MediatorProperty[];
  level: LogLevel;
  separator: string;
  category: LogCategory;
  description: string;
}

export interface XsltFeature extends STNode {
  name: string;
  value: boolean;
}

export interface EndpointRecipientlist extends STNode {
  endpoint: EndpointRecipientlistEndpoint[];
}

export interface Header extends STNode {
  any: any;
  name: string;
  action: string;
  scope: string;
  description: string;
  value: string;
  expression: string;
}

export interface ImportType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  namespace: string;
  location: string;
}

export interface EntitlementServiceOnAccept extends STNode {
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

export interface TPart extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  element: string;
  type: string;
}

export interface DbMediatorStatementResult extends STNode {
  name: string;
  column: string;
}

export interface TargetEnrich extends STNode {
  action: string;
  type: string;
  xpath: string;
  property: string;
}

export interface Smooks extends STNode {
  input: SmooksInput;
  output: SmooksOutput;
  configKey: string;
  description: string;
}

export interface BindingOperationFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface WSDLEndpointEnableAddressing extends STNode {
  version: string;
  separateListener: boolean;
}

export interface Spring extends STNode {
  bean: string;
  key: string;
  description: string;
}

export interface RuleRulesetCreationProperty extends STNode {
  name: string;
  value: string;
}

export interface Datamapper extends STNode {
  config: string;
  inputSchema: string;
  outputSchema: string;
  inputType: string;
  outputType: string;
  xsltStyleSheet: string;
  description: string;
}

export interface RuleSession extends STNode {
  type: string;
}

export interface Enrich extends STNode {
  source: SourceEnrich;
  target: TargetEnrich;
  description: string;
}

export interface MessageRefFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
  messageLabel: string;
}

export interface ConditionalRouterRoute extends STNode {
  condition: any;
  target: Target;
  breakRoute: boolean;
}

export interface EndpointParameter extends STNode {
  name: string;
  value: string;
}

export interface TOperation extends TExtensibleDocumented, STNode {
  name: string;
  parameterOrder: {
  };
}

export interface Not extends STNode {
  and: And;
  or: Or;
  equal: Equal;
  not: Not;
}

export interface EntitlementServiceOnReject extends STNode {
}

export interface DataServiceCallOperations extends STNode {
  operation: DataServiceCallOperationsOperation[];
  type: string;
}

export interface DbMediatorConnectionPoolProperty extends STNode {
  name: string;
  value: string;
}

export interface CallTarget extends STNode {
  type: string;
}

export interface OauthService extends STNode {
  remoteServiceUrl: string;
  username: string;
  password: string;
  description: string;
}

export interface Xquery extends STNode {
  variable: XqueryVariable[];
  key: string;
  target: string;
  description: string;
}

export interface BamServerProfile extends STNode {
  streamConfig: BamServerProfileStreamConfig;
  name: string;
}

export interface WSDLEndpointEnableSec extends STNode {
  policy: string;
}

export interface PayloadFactoryArgs extends STNode {
  arg: PayloadFactoryArgsArg[];
}

export interface DataServiceCallOperationsOperation extends STNode {
  param: DataServiceCallOperationsOperationParam[];
  name: string;
}

export interface PublishEventAttributesMeta extends STNode {
  attribute: Attribute;
}

export interface ValidateOnFail extends STNode {
}

export interface FilterElse extends STNode {
  sequence: string;
}

export interface ValidateProperty extends STNode {
  name: string;
  value: boolean;
}

export interface Drop extends STNode {
  description: string;
}

export interface EndpointHttp extends STNode {
  uriTemplate: string;
  method: string;
  statistics: string;
  trace: string;
}

export interface FastXSLT extends STNode {
  key: string;
  description: string;
}

export interface Foreach extends STNode {
  sequence: ForeachSequence;
  expression: string;
  sequenceAttribute: string;
  id: string;
  description: string;
}

export interface Rule extends STNode {
  ruleset: RuleRuleset;
  session: RuleSession[];
  facts: RuleFacts;
  results: RuleResults;
  childMediators: RuleChildMediators;
  description: string;
}

export interface ValidateSchema extends STNode {
  key: string;
}

export interface WSDLEndpoint extends STNode {
  definitions: TDefinitions;
  description: DescriptionType;
  enableSec: WSDLEndpointEnableSec;
  enableRM: WSDLEndpointEnableRM;
  enableAddressing: WSDLEndpointEnableAddressing;
  timeout: WSDLEndpointTimeout;
  suspendOnFailure: WSDLEndpointSuspendOnFailure;
  markForSuspension: WSDLEndpointMarkForSuspension;
  uri: string;
  service: string;
  port: string;
  format: string;
  optimize: string;
  encoding: string;
  statistics: string;
  trace: string;
}

export interface ThrottleOnReject extends STNode {
}

export interface SmooksInput extends STNode {
  type: string;
  expression: string;
}

export interface DbMediatorStatementParameter extends STNode {
  type: string;
  value: string;
  expression: string;
}

export interface AggregateCompleteConditionMessageCount extends STNode {
  min: string;
  max: string;
}

export interface EndpointHttpAuthentication extends STNode {
  oauth: EndpointHttpAuthenticationOauth;
  basicAuth: EndpointHttpAuthenticationBasicAuth;
}

export interface Transaction extends STNode {
  action: string;
  description: string;
}

export interface DataServiceCallOperationsOperationParam extends STNode {
  name: string;
  value: string;
  expression: string;
  evaluator: string;
}

export interface Endpoint extends STNode {
  http: EndpointHttp;
  address: EndpointAddress;
  wsdl: WSDLEndpoint;
  loadbalance: EndpointLoadbalance;
  session: EndpointSession;
  failover: EndpointFailover;
  recipientlist: EndpointRecipientlist;
  property: EndpointProperty[];
  parameter: EndpointParameter[];
  key: string;
  template: string;
  uri: string;
}

export interface ThrottleOnAccept extends STNode {
}

export interface Target extends STNode {
  sequence: TargetSequence;
  endpoint: NamedEndpoint;
  sequenceAttribute: string;
  endpointAttribute: string;
  to: string;
  soapAction: string;
}

export interface EndpointLoadbalance extends STNode {
  algorithm: string;
  failover: boolean;
  policy: string;
  buildMessage: boolean;
}

export interface Aggregate extends STNode {
  description: string;
  id: string;
}

export interface RuleRulesetCreation extends STNode {
  property: RuleRulesetCreationProperty[];
}

export interface Callout extends STNode {
  serviceURL: string;
  action: string;
  initAxis2ClientOptions: boolean;
  endpointKey: string;
  description: string;
}

export interface DescriptionType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  targetNamespace: string;
}

export interface ExtensibleDocumentedType extends DocumentedType, STNode {
  otherAttributes: any;
}

export interface Respond extends STNode {
  description: string;
}

export interface InterfaceOperationType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  pattern: string;
  safe: boolean;
  style: string;
}

export interface Store extends STNode {
  messageStore: string;
  sequence: string;
  description: string;
}

export interface CloneTarget extends STNode {
  sequence: CloneTargetSequence;
  endpoint: NamedEndpoint;
  to: string;
  soapAction: string;
  sequenceAttribute: string;
  endpointAttribute: string;
}

export interface EndpointHttpAuthenticationBasicAuth extends STNode {
}

export interface RuleResults extends STNode {
  result: RuleResultsResult[];
}

export interface TExtensibleAttributesDocumented extends TDocumented, STNode {
  otherAttributes: any;
}

export interface CallTemplate extends STNode {
  withParam: WithParam[];
  target: string;
  onError: string;
  description: string;
}

export interface WSDLEndpointEnableRM extends STNode {
  policy: string;
}

export interface Property extends STNode {
  any: any[];
  scope: string;
  type: string;
  pattern: string;
  group: number;
  description: string;
  name: string;
  action: string;
  value: string;
  expression: string;
}

export interface RewriteRewriteruleAction extends STNode {
  value: string;
  xpath: string;
  regex: string;
  type: string;
  fragment: string;
}

export interface RuleResultsResult extends STNode {
  type: string;
  name: string;
  action: string;
  value: string;
  expression: string;
}

export interface RuleChildMediators extends STNode {
}

export interface TDefinitions extends TExtensibleDocumented, STNode {
  targetNamespace: string;
  name: string;
}

export interface EndpointFailoverEndpoint extends STNode {
  http: EndpointHttp;
  address: EndpointAddress;
  wsdl: WSDLEndpoint;
  loadbalance: EndpointLoadbalance;
  session: EndpointSession;
  name: string;
  key: string;
}

export interface EndpointType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  name: string;
  binding: string;
  address: string;
}

export interface Clone extends STNode {
  target: CloneTarget[];
  id: string;
  continueParent: boolean;
  sequential: boolean;
  description: string;
}

export interface FilterThen extends STNode {
  sequence: string;
}

export interface ProxyTargetFaultSequence extends STNode {
}

export interface CalloutEnableSec extends STNode {
  policy: string;
  outboundPolicy: string;
  inboundPolicy: string;
}

export interface ProxyTargetOutSequence extends STNode {
}

export interface ConditionalRouter extends STNode {
  route: ConditionalRouterRoute[];
  continueAfter: boolean;
  description: string;
}

export interface EndpointAddress extends DefaultEndpoint, STNode {
  uri: string;
}

export interface SourceEnrich extends STNode {
  content: any[];
  clone: boolean;
  xpath: string;
  key: string;
  type: string;
  property: string;
}

export interface PublishEventAttributesPayload extends STNode {
  attribute: Attribute;
}

export interface WSDLEndpointSuspendOnFailure extends STNode {
}

export interface Loopback extends STNode {
  description: string;
}

export interface TMessage extends TExtensibleDocumented, STNode {
  part: TPart[];
  name: string;
}

export interface TImport extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  namespace: string;
  location: string;
}

export interface EntitlementService extends STNode {
  onReject: EntitlementServiceOnReject;
  onAccept: EntitlementServiceOnAccept;
  advice: EntitlementServiceAdvice;
  obligations: EntitlementServiceObligations;
  remoteServiceUrl: string;
  remoteServiceUserName: string;
  remoteServicePassword: string;
  callbackClass: string;
  client: string;
  thriftHost: string;
  thriftPort: string;
  onRejectAttribute: string;
  onAcceptAttribute: string;
  adviceAttribute: string;
  obligationsAttribute: string;
  description: string;
}

export interface XqueryVariable extends STNode {
  name: string;
  type: string;
  expression: string;
  value: string;
  key: string;
}

export interface TBindingOperationMessage extends TExtensibleDocumented, STNode {
  name: string;
}

export interface CacheProtocol extends STNode {
  enableCacheControl: boolean;
  includeAgeHeader: boolean;
  type: string;
}

export interface AggregateCorrelateOn extends STNode {
  expression: string;
}

export interface DbMediator extends STNode {
  connection: DbMediatorConnection;
  statement: DbMediatorStatement[];
  useTransaction: boolean;
  description: string;
}

export interface WSDLEndpointMarkForSuspension extends STNode {
}

export interface Builder extends STNode {
  messageBuilder: BuilderMessageBuilder;
  description: string;
}

export interface TargetSequence extends STNode {
}

export interface CalloutConfiguration extends STNode {
  axis2Xml: string;
  repository: string;
}

export interface BuilderMessageBuilder extends STNode {
  contentType: string;
  clazz: string;
  formatterClass: string;
}

export interface ProxyTargetInSequence extends STNode {
}

export interface ThrottlePolicy extends STNode {
  any: any;
  key: string;
}

export interface EndpointFailover extends STNode {
  endpoint: EndpointFailoverEndpoint[];
  dynamic: boolean;
  buildMessage: boolean;
}

export interface PojoCommand extends STNode {
  property: PojoCommandProperty[];
  name: string;
  description: string;
}

export interface Send extends STNode {
  endpoint: NamedEndpoint[];
  receive: string;
  buildmessage: boolean;
  description: string;
}

export interface PublishEvent extends STNode {
  eventSink: any;
  streamName: any;
  streamVersion: any;
  attributes: PublishEventAttributes;
  description: string;
}

export interface CloneTargetSequence extends STNode {
}

export interface RewriteRewriterule extends STNode {
  condition: RewriteRewriteruleCondition;
  action: RewriteRewriteruleAction[];
}

export interface PublishEventAttributes extends STNode {
  meta: PublishEventAttributesMeta;
  correlation: PublishEventAttributesCorrelation;
  payload: PublishEventAttributesPayload;
  arbitrary: PublishEventAttributesArbitrary;
}

export interface MakefaultReason extends STNode {
  value: string;
  expression: string;
}

export interface KeyAttribute extends STNode {
  key: string;
}

export interface EjbArgsArg extends STNode {
  value: string;
}

export interface EndpointHttpAuthenticationOauthClientCredentials extends STNode {
}

export interface ExtensionElement extends STNode {
  required: boolean;
}

export interface IncludeType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  location: string;
}

export interface EndpointHttpAuthenticationOauthAuthorizationCode extends STNode {
}

export interface EndpointLoadbalanceEndpoint extends STNode {
  http: EndpointHttp;
  address: EndpointAddress;
  wsdl: WSDLEndpoint;
  loadbalance: EndpointLoadbalance;
  session: EndpointSession;
  failover: EndpointFailover;
  name: string;
  key: string;
}

export interface Resource extends STNode {
  location: string;
  key: string;
}

export interface DbMediatorStatement extends STNode {
  parameter: DbMediatorStatementParameter[];
  result: DbMediatorStatementResult[];
}

export interface Jsontransform extends STNode {
  property: MediatorProperty[];
  schema: string;
}

export interface BindingOperationType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  ref: string;
}

export interface EjbArgs extends STNode {
  arg: EjbArgsArg[];
}

export interface MakefaultDetail extends STNode {
  expression: string;
}

export interface PublishEventAttributesCorrelation extends STNode {
  attribute: Attribute;
}

export interface EntitlementServiceAdvice extends STNode {
  any: any;
}

export interface PayloadFactory extends STNode {
  format: PayloadFactoryFormat;
  args: PayloadFactoryArgs;
  mediaType: string;
  templateType: string;
  description: string;
}

export interface Makefault extends STNode {
  code: MakefaultCode;
  reason: MakefaultReason;
  node: any;
  role: any;
  detail: MakefaultDetail;
  version: string;
  response: boolean;
  description: string;
}

export interface SmooksOutput extends STNode {
  type: string;
  property: string;
  action: string;
  expression: string;
}

export interface DataServiceCall extends STNode {
  source: DataServiceCallSource;
  operations: DataServiceCallOperations;
  target: DataServiceCallTarget;
  serviceName: string;
  description: string;
}

export interface Or extends STNode {
}

export interface Parameter extends STNode {
  otherAttributes: any;
  content: any[];
  name: string;
  key: string;
  locked: boolean;
}

export interface XsltResource extends STNode {
  location: string;
  key: string;
}

export interface And extends STNode {
  and: And;
  or: Or;
  equal: Equal;
  not: Not;
}

export interface Script extends STNode {
  content: any[];
  language: string;
  key: string;
  function: string;
  description: string;
}

export interface ValidateResource extends STNode {
  key: string;
  location: string;
}

export interface PojoCommandProperty extends STNode {
  any: any[];
  name: string;
  contextName: string;
  action: string;
  value: string;
  expression: string;
}

export interface PropertyGroup extends STNode {
  property: Property[];
  description: string;
}

export interface AggregateOnComplete extends STNode {
  call: Call;
  callTemplate: CallTemplate;
  drop: Drop;
  log: Log;
  loopback: Loopback;
  property: Property;
  propertyGroup: PropertyGroup;
  respond: Respond;
  send: Send;
  sequence: FilterSequence;
  store: Store;
  conditionalRouter: ConditionalRouter;
  filter: Filter;
  validate: Validate;
  bean: Bean;
  clazz: Class;
  pojoCommand: PojoCommand;
  ejb: Ejb;
  script: Script;
  spring: Spring;
  enrich: Enrich;
  makefault: Makefault;
  header: Header;
  payloadFactory: PayloadFactory;
  smooks: Smooks;
  rewrite: Rewrite;
  xquery: Xquery;
  xslt: Xslt;
  datamapper: Datamapper;
  fastXSLT: FastXSLT;
  jsontransform: Jsontransform;
  cache: Cache;
  dblookup: DbMediator;
  dbreport: DbMediator;
  enqueue: Enqueue;
  event: Event;
  dataServiceCall: DataServiceCall;
  throttle: Throttle;
  transaction: Transaction;
  aggregate: Aggregate;
  callout: Callout;
  clone: Clone;
  iterate: Iterate;
  foreach: Foreach;
  entitlementService: EntitlementService;
  oauthService: OauthService;
  builder: Builder;
  rule: Rule;
  bam: Bam;
  publishEvent: PublishEvent;
  expression: string;
  sequenceAttribute: string;
  enclosingElementProperty: string;
  aggregateElementType: string;
}

export interface Throttle extends STNode {
  policy: ThrottlePolicy;
  onAccept: ThrottleOnAccept;
  onReject: ThrottleOnReject;
  id: string;
  onAcceptAttribute: string;
  onRejectAttribute: string;
  description: string;
}

export interface Ejb extends STNode {
  args: EjbArgs;
  beanstalk: string;
  clazz: string;
  sessionId: string;
  remove: boolean;
  method: string;
  target: string;
  jndiName: string;
  id: string;
  stateful: boolean;
  description: string;
}

export interface WithParam extends STNode {
  name: string;
  value: string;
  description: string;
}

export interface DbMediatorConnectionPool extends STNode {
  dsName: KeyAttribute;
  icClass: KeyAttribute;
  driver: KeyAttribute;
  url: KeyAttribute;
  user: KeyAttribute;
  password: KeyAttribute;
  property: DbMediatorConnectionPoolProperty[];
}

export interface TParam extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  message: string;
}

export interface ProxyTarget extends STNode {
  inSequence: ProxyTargetInSequence;
  outSequence: ProxyTargetOutSequence;
  faultSequence: ProxyTargetFaultSequence;
  endpoint: NamedEndpoint;
  inSequenceAttribute: string;
  outSequenceAttribute: string;
  faultSequenceAttribute: string;
  endpointAttribute: string;
}

export interface InterfaceType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  styleDefault: {
  };
}

export interface RewriteRewriteruleCondition extends STNode {
  and: And;
  or: Or;
  equal: Equal;
  not: Not;
}

export interface RuleFactsFact extends STNode {
  type: string;
  name: string;
  action: string;
  value: string;
  expression: string;
}

export interface CallSource extends STNode {
  content: any[];
  contentType: string;
  type: string;
}

export interface Validate extends STNode {
  property: ValidateProperty[];
  schema: ValidateSchema[];
  onFail: ValidateOnFail;
  feature: Feature[];
  resource: ValidateResource[];
  cacheSchema: boolean;
  source: string;
  description: string;
}

export interface TDocumentation extends STNode {
  content: any[];
}

export interface MakefaultCode extends STNode {
  value: string;
  expression: string;
}

export interface DefaultEndpoint extends STNode {
  enableSec: WSDLEndpointEnableSec;
  enableRM: WSDLEndpointEnableRM;
  enableAddressing: WSDLEndpointEnableAddressing;
  timeout: WSDLEndpointTimeout;
  suspendOnFailure: WSDLEndpointSuspendOnFailure;
  markForSuspension: WSDLEndpointMarkForSuspension;
  format: string;
  optimize: string;
  encoding: string;
  statistics: string;
  trace: string;
}

export interface PayloadFactoryArgsArg extends STNode {
  value: string;
  evaluator: string;
  expression: string;
  literal: boolean;
}

export interface TFault extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  name: string;
  message: string;
}

export interface Filter extends STNode {
  then: FilterThen;
  source: string;
  regex: string;
  xpath: string;
  description: string;
}

export interface CacheImplementation extends STNode {
  maxSize: number;
}

export interface FilterSequence extends STNode {
  key: string;
  name: string;
  description: string;
}

export interface DataServiceCallSource extends STNode {
  type: string;
}

export interface PayloadFactoryFormat extends STNode {
  content: any[];
  key: string;
}

export interface SwitchDefault extends STNode {
}

export interface DocumentationType extends STNode {
  otherAttributes: any;
  content: any[];
}

export interface Bean extends STNode {
  action: string;
  var: string;
  clazz: string;
  property: string;
  value: string;
  description: string;
}

export interface TPort extends TExtensibleDocumented, STNode {
  name: string;
  binding: string;
}

export interface Rewrite extends STNode {
  rewriterule: RewriteRewriterule[];
  inProperty: string;
  outProperty: string;
  description: string;
}

export interface PublishEventAttributesArbitrary extends STNode {
  attribute: PublishEventAttributesArbitraryAttribute;
}

export interface WSDLEndpointTimeout extends STNode {
}

export interface Attribute extends STNode {
  name: string;
  dataType: string;
  value: string;
  expression: string;
}

export interface TTypes extends TExtensibleDocumented, STNode {
}

export interface Xslt extends STNode {
  property: MediatorProperty[];
  feature: XsltFeature[];
  resource: XsltResource[];
  key: string;
  source: string;
  description: string;
}

export interface TDocumented extends STNode {
  documentation: TDocumentation;
}

export interface EndpointProperty extends MediatorProperty, STNode {
  otherAttributes: any;
  scope: string;
}

export interface AggregateCompleteCondition extends STNode {
  messageCount: AggregateCompleteConditionMessageCount;
  timeout: number;
}

export interface EntitlementServiceObligations extends STNode {
  any: any;
}

export interface ServiceType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  endpointOrAny: EndpointType[];
  name: string;
}

export interface TService extends TExtensibleDocumented, STNode {
  port: TPort[];
  name: string;
}

export interface Equal extends STNode {
  type: string;
  source: string;
  value: string;
}

export interface TExtensibilityElement extends STNode {
  required: boolean;
}

export interface DataServiceCallTarget extends STNode {
  type: string;
  name: string;
}

export interface ForeachSequence extends STNode {
}

export interface EndpointHttpAuthenticationOauth extends STNode {
  authorizationCode: EndpointHttpAuthenticationOauthAuthorizationCode;
  clientCredentials: EndpointHttpAuthenticationOauthClientCredentials;
}

export interface BamServerProfileStreamConfig extends STNode {
  name: string;
  version: string;
}

export interface Bam extends STNode {
  serverProfile: BamServerProfile;
  description: string;
}

export interface NamedEndpoint extends Endpoint, STNode {
  name: string;
}

export interface RuleFacts extends STNode {
  fact: RuleFactsFact[];
}

export interface Enqueue extends STNode {
  priority: number;
  sequence: string;
  executor: string;
  description: string;
}

export interface InterfaceFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  name: string;
  element: string;
}

export interface Event extends STNode {
  topic: string;
  expression: string;
  description: string;
}

export interface TPortType extends TExtensibleAttributesDocumented, STNode {
  otherAttributes: any;
  operation: TOperation[];
  name: string;
}

export interface RuleRulesetSource extends STNode {
  any: any[];
  key: string;
}

export interface Switch extends STNode {
  source: string;
  description: string;
}

export interface DbMediatorConnection extends STNode {
  pool: DbMediatorConnectionPool;
}

export interface SwitchCase extends STNode {
  regex: string;
}

export interface EndpointRecipientlistEndpoint extends STNode {
  http: EndpointHttp;
  address: EndpointAddress;
  wsdl: WSDLEndpoint;
  loadbalance: EndpointLoadbalance;
  session: EndpointSession;
  failover: EndpointFailover;
  name: string;
  key: string;
}

export interface RuleRuleset extends STNode {
  source: RuleRulesetSource;
  creation: RuleRulesetCreation;
}

export interface Class extends STNode {
  property: MediatorProperty[];
  name: string;
  description: string;
}

export interface CacheOnCacheHit extends STNode {
  sequence: string;
}

export interface BindingType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  name: string;
  type: string;
}

export interface TypesType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
}

export interface EndpointLoadbalanceMember extends STNode {
  hostName: string;
  httpPort: string;
  httpsPort: string;
}

export interface BindingFaultType extends ExtensibleDocumentedType, STNode {
  otherAttributes: any;
  any: any[];
  ref: string;
}

export interface TBinding extends TExtensibleDocumented, STNode {
  operation: TBindingOperation[];
  name: string;
  type: string;
}

export interface Call extends STNode {
  source: CallSource;
  target: CallTarget;
  endpoint: NamedEndpoint;
  blocking: boolean;
  description: string;
}

export interface Cache extends STNode {
  onCacheHit: CacheOnCacheHit;
  protocol: CacheProtocol;
  implementation: CacheImplementation;
  timeout: number;
  collector: boolean;
  maxMessageSize: number;
  scope: string;
  description: string;
}

export interface TBindingOperation extends TExtensibleDocumented, STNode {
  input: TBindingOperationMessage;
  output: TBindingOperationMessage;
  fault: TBindingOperationFault[];
  name: string;
}

export interface DocumentedType extends STNode {
  documentation: DocumentationType[];
}

export interface CalloutTarget extends STNode {
  xpath: string;
  key: string;
}
