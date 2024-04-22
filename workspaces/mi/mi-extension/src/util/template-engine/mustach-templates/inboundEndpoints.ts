/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

interface Parameter {
    [key: string]: string | number | boolean;
}

export interface GetInboundTemplatesArgs {
    name: string;
    type: string;
    sequence: string;
    errorSequence: string;
    suspend?: boolean;
    trace?: boolean;
    statistics?: boolean;
    description?: string;
    parameters?: Parameter;
}

export function getInboundEndpointMustacheTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<inboundEndpoint name="{{name}}" {{#class}}class="{{class}}" {{/class}}{{#showSequence}}onError="{{errorSequence}}" sequence="{{sequence}}" {{/showSequence}}{{#protocol}}protocol="{{protocol}}" {{/protocol}}{{#statistics}}statistics="enable" {{/statistics}}{{#suspend}}suspend="{{suspend}}" {{/suspend}}{{#trace}}trace="enable" {{/trace}}xmlns="http://ws.apache.org/ns/synapse">
    <parameters>
    {{#params}}
        {{^custom}}<parameter name="{{key}}">{{{value}}}</parameter>{{/custom}}{{#custom}}{{{custom}}}{{/custom}}
    {{/params}}
    </parameters>
</inboundEndpoint>`;
}

export function getInboundEndpointdXml(data: GetInboundTemplatesArgs) {
    const { parameters, ...mainData } = data;
    const protocol =
        data.type === 'custom' ? false : data.type === 'wso2_mb' ? 'jms' : data.type;

    const showSequence = !['cxf_ws_rm', 'feed', 'http', 'https'].includes(data.type);

    let params: Parameter[] = [];
    Object.entries(parameters ?? {}).map(([key, value]) => {
        params.push({ key, value });
    });

    if (data.type === 'rabbitmq') {
        const qosType = params.find((param) => param.key === 'rabbitmq.channel.consumer.qos.type');
        const qos = params.find((param) => param.key === 'rabbitmq.channel.consumer.qos');
        if (qosType?.value === 'registry') {
            params.map((param) => {
                if (param.key === 'rabbitmq.channel.consumer.qos') {
                    param.custom = `<parameter key="${qos?.value}" name="rabbitmq.channel.consumer.qos"/>`;
                }
            });
        }
        params = params.filter((param) => param.key !== 'rabbitmq.channel.consumer.qos.type');

        ['rabbitmq.queue.autodeclare', 'rabbitmq.exchange.autodeclare'].map((key) => {
            const parameter = params.find((param) => param.key === key);
            if (parameter?.value === true) {
                params = params.filter((param) => param.key !== key);
            }
            else {
                params.push({ key, value: 'false' });
            }
        });
    } else if (data.type === 'wso2_mb') {
        const factoryType = params.find((param) => param.key === 'transport.jms.ConnectionFactoryType');
        const url = params.find((param) => param.key === 'mb.connection.url')?.value ?? '';
        if (factoryType?.value) {
            const type = factoryType.value === 'queue' ? 'Queue' : 'Topic';
            params.push({ key: `connectionfactory.${type}ConnectionFactory`, value: url });
            params = params.filter((param) => param.key !== `connectionfactory.${type === 'Topic' ? 'Queue' : 'Topic'}ConnectionFactory`);
        }
        params = params.filter((param) => param.key !== 'mb.connection.url');
    } else if (data.type === 'kafka') {
        const topics = params.find((param) => param.key === 'topics');
        const topicName = params.find((param) => param.key === 'topic.name');
        if (topics?.value && topics?.value !== 'topics') {
            params = params.filter((param) => param.key !== 'topic.name');
            params = params.filter((param) => param.key !== 'topics');
            params.push({ key: 'topics', value: topicName?.value ?? 'sampleTopic' });
        } else if (topics?.value && topics?.value !== 'topic.filter') {
            params = params.filter((param) => param.key !== 'topic.name');
            params = params.filter((param) => param.key !== 'topics');
            params.push({ key: 'topic.filter', value: topicName?.value ?? 'sample-topic-filter' });
            params.push({ key: 'filter.from.whitelist', value: 'true' });
        }
    }

    const modifiedData = {
        ...mainData,
        isCustomType: data.type === 'custom',
        showSequence,
        protocol,
        statistics: mainData?.statistics ? 'enable' : undefined,
        trace: mainData?.trace ? 'enable' : undefined,
        suspend: mainData?.suspend ? 'true' : 'false',
        params
    };

    return render(getInboundEndpointMustacheTemplate(), modifiedData);
}
