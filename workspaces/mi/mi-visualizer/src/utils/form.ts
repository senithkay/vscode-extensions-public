/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { APIResource, Range, NamedSequence } from "@wso2-enterprise/mi-syntax-tree/src";
import { RpcClient } from "@wso2-enterprise/mi-rpc-client";
import { EditAPIForm, Method } from "../views/Forms/EditForms/EditResourceForm";
import { EditSequenceForm } from "../views/Forms/EditForms/EditSequenceForm";
import { SERVICE } from "../constants";
import { getXML } from "./template-engine/mustache-templates/templateUtils";

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
    const sequenceData: EditSequenceForm = {
        name: model.name,
        trace: model.trace !== "enable" ? false : true,
        statistics: model.statistics !== "enable" ? false : true,
        onError: model.onError || "",
    };

    return sequenceData;
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
    data: EditSequenceForm,
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

