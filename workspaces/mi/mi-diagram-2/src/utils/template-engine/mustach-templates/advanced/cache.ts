/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Cache } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getCacheMustacheTemplate() {
    return `
    {{#isNewMediator}}
    {{#isCollector}}
    <cache collector="true" {{#description}}description="{{description}}"{{/description}} {{#is611Compatible}}scope="{{scope}}"{{/is611Compatible}} />
    {{/isCollector}}
    {{^isCollector}}
    {{#is611Compatible}}
    <cache collector="false" {{#description}}description="{{description}}"{{/description}} hashGenerator="{{hashGeneratorAttribute}}" id="{{id}}" maxMessageSize="{{maxMessageSize}}" scope="{{scope}}" timeout="{{cacheTimeout}}">
        <onCacheHit {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} />
        <implementation maxSize="{{maxEntryCount}}" type="{{implementationType}}" />
    </cache>
    {{/is611Compatible}}
    {{^is611Compatible}}
    <cache collector="false" {{#description}}description="{{description}}"{{/description}} maxMessageSize="{{maxMessageSize}}" timeout="{{cacheTimeout}}">
        <onCacheHit {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} />
        <protocol type="{{cacheProtocolType}}">
            <methods>{{cacheProtocolMethods}}</methods>
            <headersToExcludeInHash>{{headersToExcludeInHash}}</headersToExcludeInHash>
            <headersToIncludeInHash>{{headersToIncludeInHash}}</headersToIncludeInHash>
            <responseCodes>{{responseCodes}}</responseCodes>
            <enableCacheControl>{{enableCacheControl}}</enableCacheControl>
            <includeAgeHeader>{{includeAgeHeader}}</includeAgeHeader>
            <hashGenerator>{{hashGenerator}}</hashGenerator>
        </protocol>
        <implementation maxSize="{{maxEntryCount}}" />
    </cache>
    {{/is611Compatible}}
    {{/isCollector}}
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#isEditCache}}
    {{#isCollector}}
    <cache collector="true" {{#description}}description="{{description}}"{{/description}} {{#is611Compatible}}scope="{{scope}}"{{/is611Compatible}} />
    {{/isCollector}}
    {{^isCollector}}
    {{#is611Compatible}}
    <cache collector="false" {{#description}}description="{{description}}"{{/description}} hashGenerator="{{hashGeneratorAttribute}}" id="{{id}}" maxMessageSize="{{maxMessageSize}}" scope="{{scope}}" timeout="{{cacheTimeout}}">
    {{/is611Compatible}}
    {{^is611Compatible}}
    <cache collector="false" {{#description}}description="{{description}}"{{/description}} maxMessageSize="{{maxMessageSize}}" timeout="{{cacheTimeout}}">
    {{/is611Compatible}}
    {{/isCollector}}
    {{/isEditCache}}
    {{#isEditProtocol}}
    {{^isCollector}}
    {{^is611Compatible}}
    <protocol type="{{cacheProtocolType}}">
    <methods>{{cacheProtocolMethods}}</methods>
    <headersToExcludeInHash>{{headersToExcludeInHash}}</headersToExcludeInHash>
    <headersToIncludeInHash>{{headersToIncludeInHash}}</headersToIncludeInHash>
    <responseCodes>{{responseCodes}}</responseCodes>
    <enableCacheControl>{{enableCacheControl}}</enableCacheControl>
    <includeAgeHeader>{{includeAgeHeader}}</includeAgeHeader>
    <hashGenerator>{{hashGenerator}}</hashGenerator>
</protocol>
    {{/is611Compatible}}
    {{/isCollector}}
    {{/isEditProtocol}}
    {{#isEditImplementation}}
    {{^isCollector}}
    <implementation maxSize="{{maxEntryCount}}" type="{{implementationType}}" />
    {{/isCollector}}
    {{/isEditImplementation}}
    {{#isEditOnCacheHit}}
    <onCacheHit {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} />
    {{/isEditOnCacheHit}}
    {{/isNewMediator}}
    `;
}

export function getCacheXml(data: { [key: string]: any }) {

    data.scope = data.scope?.toLowerCase();
    if (data.cacheType === "COLLECTOR") {
        data.isCollector = true;
    }

    if (data.cacheMediatorImplementation === "611 Compatible") {
        data.is611Compatible = true;
    }

    const output = Mustache.render(getCacheMustacheTemplate(), data)?.trim();
    return output;
}

export function getCacheFormDataFromSTNode(data: { [key: string]: any }, node: Cache) {
    data.description = node.description;
    data.scope = node.scope ? (node.scope == "per-mediator" ? "Per-Mediator" : "Per-Host") : undefined;
    data.id = node.id;
    data.hashGeneratorAttribute = node.hashGenerator;
    data.hashGenerator = node.protocol?.hashGenerator?.textNode;
    data.maxMessageSize = node.maxMessageSize;
    data.maxSize = node.implementation?.maxSize
    data.cacheTimeout = node.timeout;
    data.sequenceKey = node.onCacheHit.sequence;
    data.cacheProtocolType = node.protocol?.type;
    data.cacheProtocolMethods = node.protocol?.methods?.textNode;
    data.headersToIncludeInHash = node.protocol?.headersToIncludeInHash?.textNode
    data.headersToExcludeInHash = node.protocol?.headersToExcludeInHash?.textNode;
    data.responseCodes = node.protocol?.responseCodes?.textNode;
    data.enableCacheControl = Boolean(node.protocol?.enableCacheControl?.textNode);
    data.includeAgeHeader = Boolean(node.protocol?.includeAgeHeader?.textNode);
    data.maxEntryCount = node.implementation?.maxSize;
    data.cacheMediatorImplementation = node.protocol ? "Default" : "611 Compatible";
    data.cacheType = node.collector ? "COLLECTOR" : "FINDER";
    data.sequenceType = node.onCacheHit.sequence ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.ranges = {
        cache: node.range,
        onCacheHit: node.onCacheHit?.range,
        implementation: node.implementation?.range,
        protocol: node.protocol?.range
    }
    data.isAnonymousSequence = node.onCacheHit.mediatorList.length > 0 ? true : false;
    data.implementationType = node.implementation.type;
    return data;
}
