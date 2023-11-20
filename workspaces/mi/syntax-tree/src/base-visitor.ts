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

    beginVisitMediatorProperty?(node: Synapse.MediatorProperty): void;
    endVisitMediatorProperty?(node: Synapse.MediatorProperty): void;

    beginVisitProperty?(node: Synapse.Property): void;
    endVisitProperty?(node: Synapse.Property): void;

    beginVisitTDefinitions?(node: Synapse.TDefinitions): void;
    endVisitTDefinitions?(node: Synapse.TDefinitions): void;

    beginVisitDrop?(node: Synapse.Drop): void;
    endVisitDrop?(node: Synapse.Drop): void;

    beginVisitRuleRulesetCreationProperty?(node: Synapse.RuleRulesetCreationProperty): void;
    endVisitRuleRulesetCreationProperty?(node: Synapse.RuleRulesetCreationProperty): void;

    beginVisitEntitlementServiceOnAccept?(node: Synapse.EntitlementServiceOnAccept): void;
    endVisitEntitlementServiceOnAccept?(node: Synapse.EntitlementServiceOnAccept): void;

    beginVisitEndpointLoadbalance?(node: Synapse.EndpointLoadbalance): void;
    endVisitEndpointLoadbalance?(node: Synapse.EndpointLoadbalance): void;

    beginVisitTDocumentation?(node: Synapse.TDocumentation): void;
    endVisitTDocumentation?(node: Synapse.TDocumentation): void;

    beginVisitValidateProperty?(node: Synapse.ValidateProperty): void;
    endVisitValidateProperty?(node: Synapse.ValidateProperty): void;

    beginVisitRule?(node: Synapse.Rule): void;
    endVisitRule?(node: Synapse.Rule): void;

    beginVisitDocumentationType?(node: Synapse.DocumentationType): void;
    endVisitDocumentationType?(node: Synapse.DocumentationType): void;

    beginVisitBean?(node: Synapse.Bean): void;
    endVisitBean?(node: Synapse.Bean): void;

    beginVisitEndpointHttpAuthentication?(node: Synapse.EndpointHttpAuthentication): void;
    endVisitEndpointHttpAuthentication?(node: Synapse.EndpointHttpAuthentication): void;

    beginVisitMakefaultReason?(node: Synapse.MakefaultReason): void;
    endVisitMakefaultReason?(node: Synapse.MakefaultReason): void;

    beginVisitDataServiceCallTarget?(node: Synapse.DataServiceCallTarget): void;
    endVisitDataServiceCallTarget?(node: Synapse.DataServiceCallTarget): void;

    beginVisitBamServerProfileStreamConfig?(node: Synapse.BamServerProfileStreamConfig): void;
    endVisitBamServerProfileStreamConfig?(node: Synapse.BamServerProfileStreamConfig): void;

    beginVisitEndpoint?(node: Synapse.Endpoint): void;
    endVisitEndpoint?(node: Synapse.Endpoint): void;

    beginVisitRewrite?(node: Synapse.Rewrite): void;
    endVisitRewrite?(node: Synapse.Rewrite): void;

    beginVisitInterfaceFaultType?(node: Synapse.InterfaceFaultType): void;
    endVisitInterfaceFaultType?(node: Synapse.InterfaceFaultType): void;

    beginVisitJsontransform?(node: Synapse.Jsontransform): void;
    endVisitJsontransform?(node: Synapse.Jsontransform): void;

    beginVisitThrottleOnAccept?(node: Synapse.ThrottleOnAccept): void;
    endVisitThrottleOnAccept?(node: Synapse.ThrottleOnAccept): void;

    beginVisitHeader?(node: Synapse.Header): void;
    endVisitHeader?(node: Synapse.Header): void;

    beginVisitFilterSequence?(node: Synapse.FilterSequence): void;
    endVisitFilterSequence?(node: Synapse.FilterSequence): void;

    beginVisitBuilder?(node: Synapse.Builder): void;
    endVisitBuilder?(node: Synapse.Builder): void;

    beginVisitWSDLEndpointEnableSec?(node: Synapse.WSDLEndpointEnableSec): void;
    endVisitWSDLEndpointEnableSec?(node: Synapse.WSDLEndpointEnableSec): void;

    beginVisitResource?(node: Synapse.Resource): void;
    endVisitResource?(node: Synapse.Resource): void;

    beginVisitAggregateCompleteCondition?(node: Synapse.AggregateCompleteCondition): void;
    endVisitAggregateCompleteCondition?(node: Synapse.AggregateCompleteCondition): void;

    beginVisitImportType?(node: Synapse.ImportType): void;
    endVisitImportType?(node: Synapse.ImportType): void;

    beginVisitEndpointSession?(node: Synapse.EndpointSession): void;
    endVisitEndpointSession?(node: Synapse.EndpointSession): void;

    beginVisitInterfaceType?(node: Synapse.InterfaceType): void;
    endVisitInterfaceType?(node: Synapse.InterfaceType): void;

    beginVisitDbMediatorConnection?(node: Synapse.DbMediatorConnection): void;
    endVisitDbMediatorConnection?(node: Synapse.DbMediatorConnection): void;

    beginVisitSpring?(node: Synapse.Spring): void;
    endVisitSpring?(node: Synapse.Spring): void;

    beginVisitOauthService?(node: Synapse.OauthService): void;
    endVisitOauthService?(node: Synapse.OauthService): void;

    beginVisitTFault?(node: Synapse.TFault): void;
    endVisitTFault?(node: Synapse.TFault): void;

    beginVisitClass?(node: Synapse.Class): void;
    endVisitClass?(node: Synapse.Class): void;

    beginVisitForeachSequence?(node: Synapse.ForeachSequence): void;
    endVisitForeachSequence?(node: Synapse.ForeachSequence): void;

    beginVisitServiceType?(node: Synapse.ServiceType): void;
    endVisitServiceType?(node: Synapse.ServiceType): void;

    beginVisitAggregateOnComplete?(node: Synapse.AggregateOnComplete): void;
    endVisitAggregateOnComplete?(node: Synapse.AggregateOnComplete): void;

    beginVisitRuleChildMediators?(node: Synapse.RuleChildMediators): void;
    endVisitRuleChildMediators?(node: Synapse.RuleChildMediators): void;

    beginVisitPublishEventAttributesPayload?(node: Synapse.PublishEventAttributesPayload): void;
    endVisitPublishEventAttributesPayload?(node: Synapse.PublishEventAttributesPayload): void;

    beginVisitDatamapper?(node: Synapse.Datamapper): void;
    endVisitDatamapper?(node: Synapse.Datamapper): void;

    beginVisitEndpointHttpAuthenticationOauth?(node: Synapse.EndpointHttpAuthenticationOauth): void;
    endVisitEndpointHttpAuthenticationOauth?(node: Synapse.EndpointHttpAuthenticationOauth): void;

    beginVisitBindingOperationMessageType?(node: Synapse.BindingOperationMessageType): void;
    endVisitBindingOperationMessageType?(node: Synapse.BindingOperationMessageType): void;

    beginVisitDbMediatorStatement?(node: Synapse.DbMediatorStatement): void;
    endVisitDbMediatorStatement?(node: Synapse.DbMediatorStatement): void;

    beginVisitTransaction?(node: Synapse.Transaction): void;
    endVisitTransaction?(node: Synapse.Transaction): void;

    beginVisitDocumentedType?(node: Synapse.DocumentedType): void;
    endVisitDocumentedType?(node: Synapse.DocumentedType): void;

    beginVisitTypesType?(node: Synapse.TypesType): void;
    endVisitTypesType?(node: Synapse.TypesType): void;

    beginVisitTargetEnrich?(node: Synapse.TargetEnrich): void;
    endVisitTargetEnrich?(node: Synapse.TargetEnrich): void;

    beginVisitMakefaultDetail?(node: Synapse.MakefaultDetail): void;
    endVisitMakefaultDetail?(node: Synapse.MakefaultDetail): void;

    beginVisitAggregateCorrelateOn?(node: Synapse.AggregateCorrelateOn): void;
    endVisitAggregateCorrelateOn?(node: Synapse.AggregateCorrelateOn): void;

    beginVisitPojoCommandProperty?(node: Synapse.PojoCommandProperty): void;
    endVisitPojoCommandProperty?(node: Synapse.PojoCommandProperty): void;

    beginVisitDbMediator?(node: Synapse.DbMediator): void;
    endVisitDbMediator?(node: Synapse.DbMediator): void;

    beginVisitRuleFactsFact?(node: Synapse.RuleFactsFact): void;
    endVisitRuleFactsFact?(node: Synapse.RuleFactsFact): void;

    beginVisitClone?(node: Synapse.Clone): void;
    endVisitClone?(node: Synapse.Clone): void;

    beginVisitProxyTargetFaultSequence?(node: Synapse.ProxyTargetFaultSequence): void;
    endVisitProxyTargetFaultSequence?(node: Synapse.ProxyTargetFaultSequence): void;

    beginVisitWSDLEndpointEnableRM?(node: Synapse.WSDLEndpointEnableRM): void;
    endVisitWSDLEndpointEnableRM?(node: Synapse.WSDLEndpointEnableRM): void;

    beginVisitCalloutSource?(node: Synapse.CalloutSource): void;
    endVisitCalloutSource?(node: Synapse.CalloutSource): void;

    beginVisitDataServiceCallOperationsOperationParam?(node: Synapse.DataServiceCallOperationsOperationParam): void;
    endVisitDataServiceCallOperationsOperationParam?(node: Synapse.DataServiceCallOperationsOperationParam): void;

    beginVisitXsltResource?(node: Synapse.XsltResource): void;
    endVisitXsltResource?(node: Synapse.XsltResource): void;

    beginVisitEndpointLoadbalanceMember?(node: Synapse.EndpointLoadbalanceMember): void;
    endVisitEndpointLoadbalanceMember?(node: Synapse.EndpointLoadbalanceMember): void;

    beginVisitEnrich?(node: Synapse.Enrich): void;
    endVisitEnrich?(node: Synapse.Enrich): void;

    beginVisitBamServerProfile?(node: Synapse.BamServerProfile): void;
    endVisitBamServerProfile?(node: Synapse.BamServerProfile): void;

    beginVisitCloneTarget?(node: Synapse.CloneTarget): void;
    endVisitCloneTarget?(node: Synapse.CloneTarget): void;

    beginVisitEntitlementService?(node: Synapse.EntitlementService): void;
    endVisitEntitlementService?(node: Synapse.EntitlementService): void;

    beginVisitRewriteRewriteruleAction?(node: Synapse.RewriteRewriteruleAction): void;
    endVisitRewriteRewriteruleAction?(node: Synapse.RewriteRewriteruleAction): void;

    beginVisitXslt?(node: Synapse.Xslt): void;
    endVisitXslt?(node: Synapse.Xslt): void;

    beginVisitWithParam?(node: Synapse.WithParam): void;
    endVisitWithParam?(node: Synapse.WithParam): void;

    beginVisitThrottle?(node: Synapse.Throttle): void;
    endVisitThrottle?(node: Synapse.Throttle): void;

    beginVisitTParam?(node: Synapse.TParam): void;
    endVisitTParam?(node: Synapse.TParam): void;

    beginVisitXqueryVariable?(node: Synapse.XqueryVariable): void;
    endVisitXqueryVariable?(node: Synapse.XqueryVariable): void;

    beginVisitPublishEventAttributesArbitrary?(node: Synapse.PublishEventAttributesArbitrary): void;
    endVisitPublishEventAttributesArbitrary?(node: Synapse.PublishEventAttributesArbitrary): void;

    beginVisitEntitlementServiceOnReject?(node: Synapse.EntitlementServiceOnReject): void;
    endVisitEntitlementServiceOnReject?(node: Synapse.EntitlementServiceOnReject): void;

    beginVisitPayloadFactoryArgsArg?(node: Synapse.PayloadFactoryArgsArg): void;
    endVisitPayloadFactoryArgsArg?(node: Synapse.PayloadFactoryArgsArg): void;

    beginVisitCallTemplate?(node: Synapse.CallTemplate): void;
    endVisitCallTemplate?(node: Synapse.CallTemplate): void;

    beginVisitDbMediatorConnectionPoolProperty?(node: Synapse.DbMediatorConnectionPoolProperty): void;
    endVisitDbMediatorConnectionPoolProperty?(node: Synapse.DbMediatorConnectionPoolProperty): void;

    beginVisitSwitchCase?(node: Synapse.SwitchCase): void;
    endVisitSwitchCase?(node: Synapse.SwitchCase): void;

    beginVisitScript?(node: Synapse.Script): void;
    endVisitScript?(node: Synapse.Script): void;

    beginVisitNamedSequence?(node: Synapse.NamedSequence): void;
    endVisitNamedSequence?(node: Synapse.NamedSequence): void;

    beginVisitTService?(node: Synapse.TService): void;
    endVisitTService?(node: Synapse.TService): void;

    beginVisitBindingOperationType?(node: Synapse.BindingOperationType): void;
    endVisitBindingOperationType?(node: Synapse.BindingOperationType): void;

    beginVisitStore?(node: Synapse.Store): void;
    endVisitStore?(node: Synapse.Store): void;

    beginVisitPayloadFactoryArgs?(node: Synapse.PayloadFactoryArgs): void;
    endVisitPayloadFactoryArgs?(node: Synapse.PayloadFactoryArgs): void;

    beginVisitFilterThen?(node: Synapse.FilterThen): void;
    endVisitFilterThen?(node: Synapse.FilterThen): void;

    beginVisitCacheImplementation?(node: Synapse.CacheImplementation): void;
    endVisitCacheImplementation?(node: Synapse.CacheImplementation): void;

    beginVisitEntitlementServiceObligations?(node: Synapse.EntitlementServiceObligations): void;
    endVisitEntitlementServiceObligations?(node: Synapse.EntitlementServiceObligations): void;

    beginVisitDefaultEndpoint?(node: Synapse.DefaultEndpoint): void;
    endVisitDefaultEndpoint?(node: Synapse.DefaultEndpoint): void;

    beginVisitAnd?(node: Synapse.And): void;
    endVisitAnd?(node: Synapse.And): void;

    beginVisitTMessage?(node: Synapse.TMessage): void;
    endVisitTMessage?(node: Synapse.TMessage): void;

    beginVisitTPort?(node: Synapse.TPort): void;
    endVisitTPort?(node: Synapse.TPort): void;

    beginVisitRuleFacts?(node: Synapse.RuleFacts): void;
    endVisitRuleFacts?(node: Synapse.RuleFacts): void;

    beginVisitEndpointFailover?(node: Synapse.EndpointFailover): void;
    endVisitEndpointFailover?(node: Synapse.EndpointFailover): void;

    beginVisitEndpointRecipientlistEndpoint?(node: Synapse.EndpointRecipientlistEndpoint): void;
    endVisitEndpointRecipientlistEndpoint?(node: Synapse.EndpointRecipientlistEndpoint): void;

    beginVisitEndpointLoadbalanceEndpoint?(node: Synapse.EndpointLoadbalanceEndpoint): void;
    endVisitEndpointLoadbalanceEndpoint?(node: Synapse.EndpointLoadbalanceEndpoint): void;

    beginVisitEndpointHttpAuthenticationOauthAuthorizationCode?(node: Synapse.EndpointHttpAuthenticationOauthAuthorizationCode): void;
    endVisitEndpointHttpAuthenticationOauthAuthorizationCode?(node: Synapse.EndpointHttpAuthenticationOauthAuthorizationCode): void;

    beginVisitTBindingOperation?(node: Synapse.TBindingOperation): void;
    endVisitTBindingOperation?(node: Synapse.TBindingOperation): void;

    beginVisitRewriteRewriterule?(node: Synapse.RewriteRewriterule): void;
    endVisitRewriteRewriterule?(node: Synapse.RewriteRewriterule): void;

    beginVisitMessageRefFaultType?(node: Synapse.MessageRefFaultType): void;
    endVisitMessageRefFaultType?(node: Synapse.MessageRefFaultType): void;

    beginVisitPojoCommand?(node: Synapse.PojoCommand): void;
    endVisitPojoCommand?(node: Synapse.PojoCommand): void;

    beginVisitTOperation?(node: Synapse.TOperation): void;
    endVisitTOperation?(node: Synapse.TOperation): void;

    beginVisitValidateSchema?(node: Synapse.ValidateSchema): void;
    endVisitValidateSchema?(node: Synapse.ValidateSchema): void;

    beginVisitDbMediatorStatementParameter?(node: Synapse.DbMediatorStatementParameter): void;
    endVisitDbMediatorStatementParameter?(node: Synapse.DbMediatorStatementParameter): void;

    beginVisitParameter?(node: Synapse.Parameter): void;
    endVisitParameter?(node: Synapse.Parameter): void;

    beginVisitRewriteRewriteruleCondition?(node: Synapse.RewriteRewriteruleCondition): void;
    endVisitRewriteRewriteruleCondition?(node: Synapse.RewriteRewriteruleCondition): void;

    beginVisitIterate?(node: Synapse.Iterate): void;
    endVisitIterate?(node: Synapse.Iterate): void;

    beginVisitTBinding?(node: Synapse.TBinding): void;
    endVisitTBinding?(node: Synapse.TBinding): void;

    beginVisitEndpointHttp?(node: Synapse.EndpointHttp): void;
    endVisitEndpointHttp?(node: Synapse.EndpointHttp): void;

    beginVisitCacheProtocol?(node: Synapse.CacheProtocol): void;
    endVisitCacheProtocol?(node: Synapse.CacheProtocol): void;

    beginVisitIncludeType?(node: Synapse.IncludeType): void;
    endVisitIncludeType?(node: Synapse.IncludeType): void;

    beginVisitSmooks?(node: Synapse.Smooks): void;
    endVisitSmooks?(node: Synapse.Smooks): void;

    beginVisitCall?(node: Synapse.Call): void;
    endVisitCall?(node: Synapse.Call): void;

    beginVisitWSDLEndpoint?(node: Synapse.WSDLEndpoint): void;
    endVisitWSDLEndpoint?(node: Synapse.WSDLEndpoint): void;

    beginVisitProxyTargetInSequence?(node: Synapse.ProxyTargetInSequence): void;
    endVisitProxyTargetInSequence?(node: Synapse.ProxyTargetInSequence): void;

    beginVisitRespond?(node: Synapse.Respond): void;
    endVisitRespond?(node: Synapse.Respond): void;

    beginVisitTExtensibilityElement?(node: Synapse.TExtensibilityElement): void;
    endVisitTExtensibilityElement?(node: Synapse.TExtensibilityElement): void;

    beginVisitValidate?(node: Synapse.Validate): void;
    endVisitValidate?(node: Synapse.Validate): void;

    beginVisitEndpointFailoverEndpoint?(node: Synapse.EndpointFailoverEndpoint): void;
    endVisitEndpointFailoverEndpoint?(node: Synapse.EndpointFailoverEndpoint): void;

    beginVisitWSDLEndpointSuspendOnFailure?(node: Synapse.WSDLEndpointSuspendOnFailure): void;
    endVisitWSDLEndpointSuspendOnFailure?(node: Synapse.WSDLEndpointSuspendOnFailure): void;

    beginVisitProxyTargetOutSequence?(node: Synapse.ProxyTargetOutSequence): void;
    endVisitProxyTargetOutSequence?(node: Synapse.ProxyTargetOutSequence): void;

    beginVisitNot?(node: Synapse.Not): void;
    endVisitNot?(node: Synapse.Not): void;

    beginVisitEqual?(node: Synapse.Equal): void;
    endVisitEqual?(node: Synapse.Equal): void;

    beginVisitRuleResults?(node: Synapse.RuleResults): void;
    endVisitRuleResults?(node: Synapse.RuleResults): void;

    beginVisitExtensionElement?(node: Synapse.ExtensionElement): void;
    endVisitExtensionElement?(node: Synapse.ExtensionElement): void;

    beginVisitEjbArgs?(node: Synapse.EjbArgs): void;
    endVisitEjbArgs?(node: Synapse.EjbArgs): void;

    beginVisitTPart?(node: Synapse.TPart): void;
    endVisitTPart?(node: Synapse.TPart): void;

    beginVisitCacheOnCacheHit?(node: Synapse.CacheOnCacheHit): void;
    endVisitCacheOnCacheHit?(node: Synapse.CacheOnCacheHit): void;

    beginVisitEndpointParameter?(node: Synapse.EndpointParameter): void;
    endVisitEndpointParameter?(node: Synapse.EndpointParameter): void;

    beginVisitPayloadFactory?(node: Synapse.PayloadFactory): void;
    endVisitPayloadFactory?(node: Synapse.PayloadFactory): void;

    beginVisitExtensibleDocumentedType?(node: Synapse.ExtensibleDocumentedType): void;
    endVisitExtensibleDocumentedType?(node: Synapse.ExtensibleDocumentedType): void;

    beginVisitBam?(node: Synapse.Bam): void;
    endVisitBam?(node: Synapse.Bam): void;

    beginVisitEndpointHttpAuthenticationBasicAuth?(node: Synapse.EndpointHttpAuthenticationBasicAuth): void;
    endVisitEndpointHttpAuthenticationBasicAuth?(node: Synapse.EndpointHttpAuthenticationBasicAuth): void;

    beginVisitEndpointAddress?(node: Synapse.EndpointAddress): void;
    endVisitEndpointAddress?(node: Synapse.EndpointAddress): void;

    beginVisitInterfaceOperationType?(node: Synapse.InterfaceOperationType): void;
    endVisitInterfaceOperationType?(node: Synapse.InterfaceOperationType): void;

    beginVisitAggregateCompleteConditionMessageCount?(node: Synapse.AggregateCompleteConditionMessageCount): void;
    endVisitAggregateCompleteConditionMessageCount?(node: Synapse.AggregateCompleteConditionMessageCount): void;

    beginVisitValidateResource?(node: Synapse.ValidateResource): void;
    endVisitValidateResource?(node: Synapse.ValidateResource): void;

    beginVisitSmooksOutput?(node: Synapse.SmooksOutput): void;
    endVisitSmooksOutput?(node: Synapse.SmooksOutput): void;

    beginVisitPublishEventAttributes?(node: Synapse.PublishEventAttributes): void;
    endVisitPublishEventAttributes?(node: Synapse.PublishEventAttributes): void;

    beginVisitSwitch?(node: Synapse.Switch): void;
    endVisitSwitch?(node: Synapse.Switch): void;

    beginVisitRuleSession?(node: Synapse.RuleSession): void;
    endVisitRuleSession?(node: Synapse.RuleSession): void;

    beginVisitSmooksInput?(node: Synapse.SmooksInput): void;
    endVisitSmooksInput?(node: Synapse.SmooksInput): void;

    beginVisitTExtensibleAttributesDocumented?(node: Synapse.TExtensibleAttributesDocumented): void;
    endVisitTExtensibleAttributesDocumented?(node: Synapse.TExtensibleAttributesDocumented): void;

    beginVisitMessageRefType?(node: Synapse.MessageRefType): void;
    endVisitMessageRefType?(node: Synapse.MessageRefType): void;

    beginVisitCalloutConfiguration?(node: Synapse.CalloutConfiguration): void;
    endVisitCalloutConfiguration?(node: Synapse.CalloutConfiguration): void;

    beginVisitFastXSLT?(node: Synapse.FastXSLT): void;
    endVisitFastXSLT?(node: Synapse.FastXSLT): void;

    beginVisitTarget?(node: Synapse.Target): void;
    endVisitTarget?(node: Synapse.Target): void;

    beginVisitRuleRulesetCreation?(node: Synapse.RuleRulesetCreation): void;
    endVisitRuleRulesetCreation?(node: Synapse.RuleRulesetCreation): void;

    beginVisitLog?(node: Synapse.Log): void;
    endVisitLog?(node: Synapse.Log): void;

    beginVisitEnqueue?(node: Synapse.Enqueue): void;
    endVisitEnqueue?(node: Synapse.Enqueue): void;

    beginVisitCalloutTarget?(node: Synapse.CalloutTarget): void;
    endVisitCalloutTarget?(node: Synapse.CalloutTarget): void;

    beginVisitSend?(node: Synapse.Send): void;
    endVisitSend?(node: Synapse.Send): void;

    beginVisitEndpointType?(node: Synapse.EndpointType): void;
    endVisitEndpointType?(node: Synapse.EndpointType): void;

    beginVisitRuleRulesetSource?(node: Synapse.RuleRulesetSource): void;
    endVisitRuleRulesetSource?(node: Synapse.RuleRulesetSource): void;

    beginVisitDataServiceCallOperationsOperation?(node: Synapse.DataServiceCallOperationsOperation): void;
    endVisitDataServiceCallOperationsOperation?(node: Synapse.DataServiceCallOperationsOperation): void;

    beginVisitFeature?(node: Synapse.Feature): void;
    endVisitFeature?(node: Synapse.Feature): void;

    beginVisitEvent?(node: Synapse.Event): void;
    endVisitEvent?(node: Synapse.Event): void;

    beginVisitAttribute?(node: Synapse.Attribute): void;
    endVisitAttribute?(node: Synapse.Attribute): void;

    beginVisitProxyTarget?(node: Synapse.ProxyTarget): void;
    endVisitProxyTarget?(node: Synapse.ProxyTarget): void;

    beginVisitAggregate?(node: Synapse.Aggregate): void;
    endVisitAggregate?(node: Synapse.Aggregate): void;

    beginVisitBindingOperationFaultType?(node: Synapse.BindingOperationFaultType): void;
    endVisitBindingOperationFaultType?(node: Synapse.BindingOperationFaultType): void;

    beginVisitDbMediatorStatementResult?(node: Synapse.DbMediatorStatementResult): void;
    endVisitDbMediatorStatementResult?(node: Synapse.DbMediatorStatementResult): void;

    beginVisitXquery?(node: Synapse.Xquery): void;
    endVisitXquery?(node: Synapse.Xquery): void;

    beginVisitTTypes?(node: Synapse.TTypes): void;
    endVisitTTypes?(node: Synapse.TTypes): void;

    beginVisitConditionalRouterRoute?(node: Synapse.ConditionalRouterRoute): void;
    endVisitConditionalRouterRoute?(node: Synapse.ConditionalRouterRoute): void;

    beginVisitValidateOnFail?(node: Synapse.ValidateOnFail): void;
    endVisitValidateOnFail?(node: Synapse.ValidateOnFail): void;

    beginVisitTBindingOperationMessage?(node: Synapse.TBindingOperationMessage): void;
    endVisitTBindingOperationMessage?(node: Synapse.TBindingOperationMessage): void;

    beginVisitSourceEnrich?(node: Synapse.SourceEnrich): void;
    endVisitSourceEnrich?(node: Synapse.SourceEnrich): void;

    beginVisitBindingType?(node: Synapse.BindingType): void;
    endVisitBindingType?(node: Synapse.BindingType): void;

    beginVisitKeyAttribute?(node: Synapse.KeyAttribute): void;
    endVisitKeyAttribute?(node: Synapse.KeyAttribute): void;

    beginVisitCloneTargetSequence?(node: Synapse.CloneTargetSequence): void;
    endVisitCloneTargetSequence?(node: Synapse.CloneTargetSequence): void;

    beginVisitTPortType?(node: Synapse.TPortType): void;
    endVisitTPortType?(node: Synapse.TPortType): void;

    beginVisitRuleRuleset?(node: Synapse.RuleRuleset): void;
    endVisitRuleRuleset?(node: Synapse.RuleRuleset): void;

    beginVisitEndpointHttpAuthenticationOauthClientCredentials?(node: Synapse.EndpointHttpAuthenticationOauthClientCredentials): void;
    endVisitEndpointHttpAuthenticationOauthClientCredentials?(node: Synapse.EndpointHttpAuthenticationOauthClientCredentials): void;

    beginVisitEjb?(node: Synapse.Ejb): void;
    endVisitEjb?(node: Synapse.Ejb): void;

    beginVisitXsltFeature?(node: Synapse.XsltFeature): void;
    endVisitXsltFeature?(node: Synapse.XsltFeature): void;

    beginVisitCallout?(node: Synapse.Callout): void;
    endVisitCallout?(node: Synapse.Callout): void;

    beginVisitTargetSequence?(node: Synapse.TargetSequence): void;
    endVisitTargetSequence?(node: Synapse.TargetSequence): void;

    beginVisitPublishEventAttributesMeta?(node: Synapse.PublishEventAttributesMeta): void;
    endVisitPublishEventAttributesMeta?(node: Synapse.PublishEventAttributesMeta): void;

    beginVisitTDocumented?(node: Synapse.TDocumented): void;
    endVisitTDocumented?(node: Synapse.TDocumented): void;

    beginVisitEjbArgsArg?(node: Synapse.EjbArgsArg): void;
    endVisitEjbArgsArg?(node: Synapse.EjbArgsArg): void;

    beginVisitNamedEndpoint?(node: Synapse.NamedEndpoint): void;
    endVisitNamedEndpoint?(node: Synapse.NamedEndpoint): void;

    beginVisitFilterElse?(node: Synapse.FilterElse): void;
    endVisitFilterElse?(node: Synapse.FilterElse): void;

    beginVisitDbMediatorConnectionPool?(node: Synapse.DbMediatorConnectionPool): void;
    endVisitDbMediatorConnectionPool?(node: Synapse.DbMediatorConnectionPool): void;

    beginVisitPublishEventAttributesArbitraryAttribute?(node: Synapse.PublishEventAttributesArbitraryAttribute): void;
    endVisitPublishEventAttributesArbitraryAttribute?(node: Synapse.PublishEventAttributesArbitraryAttribute): void;

    beginVisitDataServiceCallSource?(node: Synapse.DataServiceCallSource): void;
    endVisitDataServiceCallSource?(node: Synapse.DataServiceCallSource): void;

    beginVisitPublishEvent?(node: Synapse.PublishEvent): void;
    endVisitPublishEvent?(node: Synapse.PublishEvent): void;

    beginVisitBuilderMessageBuilder?(node: Synapse.BuilderMessageBuilder): void;
    endVisitBuilderMessageBuilder?(node: Synapse.BuilderMessageBuilder): void;

    beginVisitCallTarget?(node: Synapse.CallTarget): void;
    endVisitCallTarget?(node: Synapse.CallTarget): void;

    beginVisitEntitlementServiceAdvice?(node: Synapse.EntitlementServiceAdvice): void;
    endVisitEntitlementServiceAdvice?(node: Synapse.EntitlementServiceAdvice): void;

    beginVisitPayloadFactoryFormat?(node: Synapse.PayloadFactoryFormat): void;
    endVisitPayloadFactoryFormat?(node: Synapse.PayloadFactoryFormat): void;

    beginVisitPropertyGroup?(node: Synapse.PropertyGroup): void;
    endVisitPropertyGroup?(node: Synapse.PropertyGroup): void;

    beginVisitSwitchDefault?(node: Synapse.SwitchDefault): void;
    endVisitSwitchDefault?(node: Synapse.SwitchDefault): void;

    beginVisitForeach?(node: Synapse.Foreach): void;
    endVisitForeach?(node: Synapse.Foreach): void;

    beginVisitConditionalRouter?(node: Synapse.ConditionalRouter): void;
    endVisitConditionalRouter?(node: Synapse.ConditionalRouter): void;

    beginVisitCallSource?(node: Synapse.CallSource): void;
    endVisitCallSource?(node: Synapse.CallSource): void;

    beginVisitEndpointRecipientlist?(node: Synapse.EndpointRecipientlist): void;
    endVisitEndpointRecipientlist?(node: Synapse.EndpointRecipientlist): void;

    beginVisitCalloutEnableSec?(node: Synapse.CalloutEnableSec): void;
    endVisitCalloutEnableSec?(node: Synapse.CalloutEnableSec): void;

    beginVisitMakefaultCode?(node: Synapse.MakefaultCode): void;
    endVisitMakefaultCode?(node: Synapse.MakefaultCode): void;

    beginVisitWSDLEndpointTimeout?(node: Synapse.WSDLEndpointTimeout): void;
    endVisitWSDLEndpointTimeout?(node: Synapse.WSDLEndpointTimeout): void;

    beginVisitDataServiceCallOperations?(node: Synapse.DataServiceCallOperations): void;
    endVisitDataServiceCallOperations?(node: Synapse.DataServiceCallOperations): void;

    beginVisitWSDLEndpointEnableAddressing?(node: Synapse.WSDLEndpointEnableAddressing): void;
    endVisitWSDLEndpointEnableAddressing?(node: Synapse.WSDLEndpointEnableAddressing): void;

    beginVisitTBindingOperationFault?(node: Synapse.TBindingOperationFault): void;
    endVisitTBindingOperationFault?(node: Synapse.TBindingOperationFault): void;

    beginVisitPublishEventAttributesCorrelation?(node: Synapse.PublishEventAttributesCorrelation): void;
    endVisitPublishEventAttributesCorrelation?(node: Synapse.PublishEventAttributesCorrelation): void;

    beginVisitCache?(node: Synapse.Cache): void;
    endVisitCache?(node: Synapse.Cache): void;

    beginVisitWSDLEndpointMarkForSuspension?(node: Synapse.WSDLEndpointMarkForSuspension): void;
    endVisitWSDLEndpointMarkForSuspension?(node: Synapse.WSDLEndpointMarkForSuspension): void;

    beginVisitRuleResultsResult?(node: Synapse.RuleResultsResult): void;
    endVisitRuleResultsResult?(node: Synapse.RuleResultsResult): void;

    beginVisitLoopback?(node: Synapse.Loopback): void;
    endVisitLoopback?(node: Synapse.Loopback): void;

    beginVisitBindingFaultType?(node: Synapse.BindingFaultType): void;
    endVisitBindingFaultType?(node: Synapse.BindingFaultType): void;

    beginVisitMakefault?(node: Synapse.Makefault): void;
    endVisitMakefault?(node: Synapse.Makefault): void;

    beginVisitThrottlePolicy?(node: Synapse.ThrottlePolicy): void;
    endVisitThrottlePolicy?(node: Synapse.ThrottlePolicy): void;

    beginVisitFilter?(node: Synapse.Filter): void;
    endVisitFilter?(node: Synapse.Filter): void;

    beginVisitEndpointProperty?(node: Synapse.EndpointProperty): void;
    endVisitEndpointProperty?(node: Synapse.EndpointProperty): void;

    beginVisitThrottleOnReject?(node: Synapse.ThrottleOnReject): void;
    endVisitThrottleOnReject?(node: Synapse.ThrottleOnReject): void;

    beginVisitTImport?(node: Synapse.TImport): void;
    endVisitTImport?(node: Synapse.TImport): void;

    beginVisitTExtensibleDocumented?(node: Synapse.TExtensibleDocumented): void;
    endVisitTExtensibleDocumented?(node: Synapse.TExtensibleDocumented): void;

    beginVisitOr?(node: Synapse.Or): void;
    endVisitOr?(node: Synapse.Or): void;

    beginVisitDescriptionType?(node: Synapse.DescriptionType): void;
    endVisitDescriptionType?(node: Synapse.DescriptionType): void;

    beginVisitDataServiceCall?(node: Synapse.DataServiceCall): void;
    endVisitDataServiceCall?(node: Synapse.DataServiceCall): void;
}
