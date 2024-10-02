/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Cache, Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist } from "../../../commons";

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
        {{#isAnonymousSequence}}<onCacheHit></onCacheHit>{{/isAnonymousSequence}} 
        {{^isAnonymousSequence}}<onCacheHit sequence="{{sequenceKey}}" />{{/isAnonymousSequence}}
        {{^isCollector}}
        {{^is611Compatible}}
        <protocol type="{{cacheProtocolType}}">
            <methods>{{cacheProtocolMethods}}</methods>
            {{#hasHeadersToExcludeInHash}}<headersToExcludeInHash>{{headersToExcludeInHash}}</headersToExcludeInHash>{{/hasHeadersToExcludeInHash}}
            {{^hasHeadersToExcludeInHash}}<headersToExcludeInHash/>{{/hasHeadersToExcludeInHash}}
            {{#hasHeadersToIncludeInHash}}<headersToIncludeInHash>{{headersToIncludeInHash}}</headersToIncludeInHash>{{/hasHeadersToIncludeInHash}}
            {{^hasHeadersToIncludeInHash}}<headersToIncludeInHash/>{{/hasHeadersToIncludeInHash}}
            <responseCodes>{{responseCodes}}</responseCodes>
            <enableCacheControl>{{enableCacheControl}}</enableCacheControl>
            <includeAgeHeader>{{includeAgeHeader}}</includeAgeHeader>
            <hashGenerator>{{hashGenerator}}</hashGenerator>
        </protocol>
        {{/is611Compatible}}
        {{/isCollector}}
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
    {{#hasHeadersToExcludeInHash}}<headersToExcludeInHash>{{headersToExcludeInHash}}</headersToExcludeInHash>{{/hasHeadersToExcludeInHash}}
    {{^hasHeadersToExcludeInHash}}<headersToExcludeInHash/>{{/hasHeadersToExcludeInHash}}
    {{#hasHeadersToIncludeInHash}}<headersToIncludeInHash>{{headersToIncludeInHash}}</headersToIncludeInHash>{{/hasHeadersToIncludeInHash}}
    {{^hasHeadersToIncludeInHash}}<headersToIncludeInHash/>{{/hasHeadersToIncludeInHash}}
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
    <implementation maxSize="{{maxEntryCount}}"{{#is611Compatible}} type="{{implementationType}}"{{/is611Compatible}}/>
    {{/isCollector}}
    {{/isEditImplementation}}
    {{#isEditOnCacheHit}}
    {{#isAnonymousSequence}}<onCacheHit></onCacheHit>{{/isAnonymousSequence}} 
    {{^isAnonymousSequence}}<onCacheHit sequence="{{sequenceKey}}" />{{/isAnonymousSequence}}
    {{/isEditOnCacheHit}}
    {{/isNewMediator}}
    `;
}

export function getCacheXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any): any {

    data.scope = data.scope?.toLowerCase();
    if (data.cacheType === "COLLECTOR") {
        data.isCollector = true;
    }

    if (data.cacheMediatorImplementation === "611 Compatible") {
        data.is611Compatible = true;
    }

    if (data.sequenceType === "ANONYMOUS") {
        data.isAnonymousSequence = true;
    }

    if (data.headersToExcludeInHash && data.headersToExcludeInHash.length > 0) {
        data.hasHeadersToExcludeInHash = true;
    }

    if (data.headersToIncludeInHash && data.headersToIncludeInHash.length > 0) {
        data.hasHeadersToIncludeInHash = true;
    }
    // Need to replace entire mediator if cacheType changes from "COLLECTOR" to "FINDER".
    let collectorToFinder = false;
    if (defaultValues && defaultValues.cacheType == "COLLECTOR" && data.cacheType == "FINDER") {
        collectorToFinder = true;
    }
    if (defaultValues == undefined || Object.keys(defaultValues).length == 0 || collectorToFinder) {
        data.isNewMediator = true;
        const output = getXML(data);
        return output;
    } else {
        const edits = getEdits(data, dirtyFields, defaultValues);
        return edits;
    }
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

    let edits: { [key: string]: any }[] = [];

    let cacheTagAttributes = ["cacheMediatorImplementation", "cacheType", "cacheTimeout", "maxMessageSize", "scope", "hashGeneratorAttribute", "description"];
    let protocolTagAttributes = ["cacheMediatorImplementation", "cacheProtocolType", "cacheProtocolMethods", "headersToIncludeInHash", "headersToExcludeInHash", "responseCodes", "enableCacheControl", "includeAgeHeader", "hashGenerator"];
    let onCacheHitTagAttributes = ["sequenceType", "sequenceKey"];
    let implementationTagAttributes = ["maxEntryCount", "implementationType", "cacheType"];

    let dirtyKeys = Object.keys(dirtyFields);

    if (checkAttributesExist(dirtyKeys, cacheTagAttributes)) {
        let cacheData = { ...data };
        cacheData.isEditCache = true;
        const output = getXML(cacheData);
        let range = defaultValues.ranges.cache;
        let editRange;
        if (cacheData.isCollector) {
            editRange = {
                start: range.startTagRange.start,
                end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end
            }
        } else {
            editRange = {
                start: range.startTagRange.start,
                end: range.startTagRange.end
            }
        }

        let edit = {
            text: output,
            range: editRange
        }
        edits.push(edit);
        if (cacheData.isCollector) {
            return edits;
        }
    }

    if (checkAttributesExist(dirtyKeys, protocolTagAttributes) && !data.isCollector) {
        let protocolData = { ...data };
        protocolData.isEditProtocol = true;
        const output = getXML(protocolData);
        let range = defaultValues.ranges.protocol;
        let editRange;
        if (range) {
            editRange = {
                start: range.startTagRange.start,
                end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end
            }
        } else {
            editRange = {
                start: defaultValues.ranges.cache.endTagRange.start,
                end: defaultValues.ranges.cache.endTagRange.start
            }
        }
        let edit = {
            text: output,
            range: editRange
        }
        edits.push(edit);
    }

    if (checkAttributesExist(dirtyKeys, onCacheHitTagAttributes) && data.isCollector) {
        let onCacheHitData = { ...data };
        onCacheHitData.isEditOnCacheHit = true;
        const output = getXML(onCacheHitData);
        let range = defaultValues.ranges.onCacheHit;
        let editRange;
        if (range) {
            editRange = { start: range.startTagRange.start, end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end };
        } else {
            let cacheRange = defaultValues.ranges.cache;
            editRange = {
                start: cacheRange.endTagRange.start,
                end: cacheRange.endTagRange.start
            };
        }
        let edit = {
            text: output,
            range: editRange
        }
        edits.push(edit);
    }

    if (checkAttributesExist(dirtyKeys, implementationTagAttributes) && !data.isCollector) {
        let implementationData = { ...data };
        implementationData.isEditImplementation = true;
        const output = getXML(implementationData);
        let range = defaultValues.ranges.implementation;
        let editRange: Range = {
            start: range.startTagRange.start,
            end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end
        }
        let edit = {
            text: output,
            range: editRange
        }
        edits.push(edit);
    }
    edits.sort((a, b) => b.range.start.line - a.range.start.line);
    return edits;
}

function getXML(data: { [key: string]: any }) {
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
    data.sequenceKey = node.onCacheHit?.sequence;
    data.cacheProtocolType = node.protocol?.type;
    data.cacheProtocolMethods = node.protocol?.methods?.textNode;
    data.headersToIncludeInHash = node.protocol?.headersToIncludeInHash?.textNode
    data.headersToExcludeInHash = node.protocol?.headersToExcludeInHash?.textNode;
    data.responseCodes = node.protocol?.responseCodes?.textNode;
    data.enableCacheControl = node.protocol?.enableCacheControl?.textNode == "true";
    data.includeAgeHeader = node.protocol?.includeAgeHeader?.textNode == "true";
    data.maxEntryCount = node.implementation?.maxSize;
    data.cacheType = node.collector ? "COLLECTOR" : "FINDER";
    data.cacheMediatorImplementation = node.collector ?
        (node.scope ? "611 Compatible" : "Default") : (node.protocol ? "Default" : "611 Compatible");
    data.sequenceType = node.onCacheHit?.sequence ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.ranges = {
        cache: node.range,
        onCacheHit: node.onCacheHit?.range,
        implementation: node.implementation?.range,
        protocol: node.protocol?.range
    }
    data.isAnonymousSequence = node.onCacheHit?.mediatorList?.length > 0 ? true : false;
    data.implementationType = node.implementation?.type;
    return data;
}
