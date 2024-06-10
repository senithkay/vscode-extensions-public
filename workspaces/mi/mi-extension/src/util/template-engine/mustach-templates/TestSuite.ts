/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";
import { getProjectRoot } from "../../../test-explorer/helper";
import { Uri } from "vscode";

export function getTestSuiteXML(data: any) {
    data.testCases = data.testCases.map((testCase: any) => {
        return modityTestCaseData(testCase);
    });
    data.mockServices = data.mockServices.map((mockService: any) => {
        const projectRoot = getProjectRoot(Uri.parse(mockService));
        const relativePath = mockService.replace(projectRoot, '');
        return relativePath;
    });
    return render(getTestSuiteMustacheTemplate(), data);
}

function modityTestCaseData(data: any) {
    const assertions = data.assertions.map((assertion: string) => {
        // replace spaces and join camel case
        const type = assertion[0].replace(/\s/g, '').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        const expression = assertion[1];

        let expectedValue;
        let errorMessage;
        if (Object.keys(assertion).length > 3) {
            expectedValue = assertion[2];
            errorMessage = assertion[3];
        } else {
            errorMessage = assertion[2];
        }

        return {
            type,
            expression,
            ...(expectedValue) && { expectedValue },
            errorMessage
        }
    });

    return {
        ...data,
        assertions
    }
}
export function getTestCaseXML(data: any) {
    const modifiedData = modityTestCaseData(data);
    return render(getTestCaseMustacheTemplate(), modifiedData);
}

export function getMockServiceXML(data: any) {
    return render(getMockServiceMustacheTemplate(), data);
}

export function getTestSuiteMustacheTemplate() {
    return `<unit-test>
    <artifacts>
    </artifacts>
    <test-cases>
        {{#testCases}}
        ${getTestCaseMustacheTemplate()}
        {{/testCases}}
    </test-cases>
    <mock-services>
        {{#mockServices}}
            <mock-service>{{{.}}}</mock-service>
        {{/mockServices}}
    </mock-services>
</unit-test>`;
}

export function getTestCaseMustacheTemplate() {
    return `<test-case name="{{name}}">
            <input>
                <request-path>{{{resourcePath}}}</request-path>
                <request-method>{{resourceMethod}}</request-method>
                <request-protocol>{{resourceProtocol}}</request-protocol>{{#inputPayload}}
                <payload><![CDATA[{{inputPayload}}]]></payload>{{/inputPayload}}
            </input>
            <assertions>
                {{#assertions}}
                    <{{type}}>
                        <actual>{{expression}}</actual>{{#expectedValue}}
                        <expected>{{expectedValue}}</expected>{{/expectedValue}}
                        <message>{{errorMessage}}</message>
                    </{{type}}>
                {{/assertions}}    
            </assertions>
        </test-case>`;
}

export function getMockServiceMustacheTemplate() {
    return `<mock-service>
    <service-name>{{endpointName}}</service-name>
    <port>{{servicePort}}</port>
    <context>{{serviceContext}}</context>
    <resources>
        {{#resources}}
        <resource>
            <sub-context>{{subContext}}</sub-context>
            <method>{{method}}</method>
            <request>
                <headers>
                    {{#headers}}
                    <header name="{{name}}" value="{{value}}"/>
                    {{/headers}}
                </headers>
            </request>
            <response>
                <status-code>{{statusCode}}</status-code>
                <payload>
                    <![CDATA[{{payload}}]]>
                </payload>
            </response>
        </resource>
        {{/resources}}
    </resources>
</mock-service>`;
}
