/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { APIResource, Range, NamedSequence , Proxy } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { RpcClient } from "@wso2-enterprise/mi-rpc-client";
import { EditAPIForm, Method } from "../views/Forms/EditForms/EditResourceForm";
import { EditSequenceFields } from "../views/Forms/EditForms/EditSequenceForm";
import { SERVICE } from "../constants";
import { getXML } from "./template-engine/mustache-templates/templateUtils";
import { EditProxyForm } from "../views/Forms/EditForms/EditProxyForm";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

/**
 * Functions to generate data for forms
 */

export const generateResourceData = (model: APIResource): EditAPIForm => {
    const resourceData: EditAPIForm = {
        urlStyle: model.uriTemplate ? "uri-template" : model.urlMapping ? "url-mapping" : "none",
        uriTemplate: model.uriTemplate,
        urlMapping: model.urlMapping,
        methods: model.methods
            .map(method => method.toLowerCase())
            .reduce<{ [K in Method]: boolean }>((acc, method) => ({ ...acc, [method]: true }), {
                get: false,
                post: false,
                put: false,
                delete: false,
                patch: false,
                head: false,
                options: false,
            }), // Extract boolean values for each method
        protocol: {
            http: true,
            https: true,
        }, // Extract boolean values for each protocol
    }

    return resourceData;
}

export const generateSequenceData = (model: NamedSequence): any => {
    const sequenceData: EditSequenceFields = {
        name: model.name,
        trace: model.trace !== "enable" ? false : true,
        statistics: model.statistics !== "enable" ? false : true,
        onError: model.onError || "",
    };

    return sequenceData;
}

export const generateProxyData = (model: Proxy): EditProxyForm => {
    const proxyData: EditProxyForm = {
        enableSec: model.enableSec,
        enableAddressing: model.enableAddressing,
        target: model.target,
        parameters: model.parameters,
        policies: model.policies,
        publishWSDL: {
            ...model.publishWSDL,
            inlineWsdl: model.publishWSDL?.inlineWsdl ? inlineFormatter(model.publishWSDL.inlineWsdl) : "</definition>",
        },
        wsdlType: model.publishWSDL ? (model.publishWSDL.endpoint ? "ENDPOINT" : (model.publishWSDL.uri ? "SOURCE_URL" : (model.publishWSDL.key ? "REGISTRY_KEY" : "INLINE"))):"NONE",
        name: model.name,
        transports: model.transports,
        pinnedServers: model.pinnedServers,
        serviceGroup: model.serviceGroup,
        startOnLoad: model.startOnLoad,
        inSequenceEdited: false,
        outSequenceEdited: false,
        statistics: model.statistics === "enable" ? true : false,
        trace: model.trace === "enable" ? true : false,
    }

    return proxyData;

}

const inlineFormatter = (inlineWsdl: string) => {
    const options = {
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        attributeNamePrefix: "",
        attributesGroupName: "@_",
        indentBy: '    ',
        format: true,
    };
    const parser = new XMLParser(options);
    const builder = new XMLBuilder(options);
    return builder.build(parser.parse(inlineWsdl)) as string;
}

/**
 * Function to handle resource editing
 */

export const onResourceEdit = (
    data: EditAPIForm,
    range: Range,
    deleteRanges: Range[],
    documentUri: string,
    rpcClient: RpcClient,
) => {
    const { uriTemplate, urlMapping, methods, inSequence, outSequence, faultSequence } = data;
    const formValues = {
        methods: Object
            .keys(methods)
            .filter((method) => methods[method as keyof typeof methods])
            .map(method => method.toUpperCase())
            .join(" "), // Extract selected methods and create string containing the methods for the XML
        uri_template: uriTemplate,
        url_mapping: urlMapping,
        in_sequence: inSequence,
        out_sequence: outSequence,
        fault_sequence: faultSequence,
    };

    const xml = getXML(SERVICE.EDIT_RESOURCE, formValues);
    const sortedRanges = deleteRanges.sort((a, b) => b.start.line - a.start.line || b.start.character - a.start.character);
    rpcClient.getMiDiagramRpcClient().applyEdit({
        text: xml,
        documentUri: documentUri,
        range: range
    }).then(async () => {
        for (const range of sortedRanges) {
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text: "",
                documentUri: documentUri,
                range: range
            });
        }
    });
}

export const onSequenceEdit = (
    data: EditSequenceFields,
    range: Range,
    documentUri: string,
    rpcClient: RpcClient,
) => {
    const formValues = {
        name: data.name,
        ...(data.trace && { trace: "enable" }),
        ...(data.statistics && { statistics: "enable" }),
        onError: data.onError,
    }
    const xml = getXML(SERVICE.EDIT_SEQUENCE, formValues);
    rpcClient.getMiDiagramRpcClient().applyEdit({
        text: xml,
        documentUri: documentUri,
        range: range
    });
}

export const onProxyEdit = async (
    data: EditProxyForm,
    model: Proxy,
    documentUri: string,
    rpcClient: RpcClient,
) => {
    const formValues = {
        tag : "proxy",
        name: data.name,
        enableSec: data.enableSec,
        enableAddressing: data.enableAddressing,
        target: data.target,
        parameters: data.parameters,
        policies: data.policies,
        publishWsdl: data.publishWSDL,
        wsdlEnabled: data.wsdlType !== "NONE" ? true : false,
        inSequence: data.target.inSequenceAttribute,
        outSequence: data.target.outSequenceAttribute,
        faultSequence: data.target.faultSequenceAttribute,
        endpoint: data.target.endpointAttribute,
        transports: data.transports,
        pinnedServers: data.pinnedServers,
        serviceGroup: data.serviceGroup,
        startOnLoad: data.startOnLoad,
        ...(data.trace && { trace: "enable" }),
        ...(data.statistics && { statistics: "enable" }),
    }
    console.log(data);
    const tags = [ "other" , "target" , "proxy"];
    for (const tag of tags) {
        formValues.tag = tag;
        const xml = getXML(SERVICE.EDIT_PROXY, formValues);
        console.log(formValues);
        const ranges:Range = proxyRange(model,tag);
        await rpcClient.getMiDiagramRpcClient().applyEdit({
            text: xml,
            documentUri: documentUri,
            range: ranges
        });
    }
    const sequences = ["out" , "in"]
    for(const sequence of sequences){
        if(data[`${sequence}SequenceEdited` as keyof typeof data]) { 
            if(formValues[`${sequence}Sequence` as keyof typeof formValues] !== ""){
            const range:Range = {
                start:sequence === "in"?model.target.inSequence.range.startTagRange.start:model.target.outSequence.range.startTagRange.start,
                end:sequence === "in"?model.target.inSequence.range.endTagRange.end:model.target.outSequence.range.endTagRange.end
            }
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text:` `,
                documentUri:documentUri,
                range:range
            })
            } else {
                const range:Range = {
                    start:model.target.range.startTagRange.end,
                    end:model.target.range.startTagRange.end
                }
                await rpcClient.getMiDiagramRpcClient().applyEdit({
                    text:`<${sequence}Sequence>
                    </${sequence}Sequence>`,
                    documentUri:documentUri,
                    range:range
                })
            } 
        }
    }
    
}

const proxyRange = (model:Proxy,tag:string):Range => {
    switch (tag) {
        case "proxy":
            return {
                start: model.range.startTagRange.start,
                end: model.range.startTagRange.end,
            }
        case "target":
            return {
                start: model.target?.range.startTagRange.start ?? model.range.endTagRange.start,
                end: model.target?.range.startTagRange.end ?? model.range.endTagRange.start,
            }
        case "other":
            return {
                start: model.target?.range.endTagRange.end ?? model.range.endTagRange.start,
                end: model.range.endTagRange.start ?? model.range.endTagRange.start,
            }    
        default:
            return {
                start: model.range.startTagRange.start,
                end: model.range.startTagRange.end,
            }
    }
}

export const getResourceDeleteRanges = (model: APIResource, formData: EditAPIForm): Range[] => {
    const ranges: Range[] = [];
    if (formData.inSequence) {
        ranges.push({
            start: model.inSequence.range.startTagRange.start,
            end: model.inSequence.range.endTagRange.end,
        });
    }
    if (formData.outSequence) {
        ranges.push({
            start: model.outSequence.range.startTagRange.start,
            end: model.outSequence.range.endTagRange.end,
        });
    }
    if (formData.faultSequence) {
        ranges.push({
            start: model.faultSequence.range.startTagRange.start,
            end: model.faultSequence.range.endTagRange.end,
        });
    }

    return ranges;
}

