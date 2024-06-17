/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

export interface DataServiceArgs {
    dataServiceName: string;
    dataServiceNamespace: string;
    serviceGroup: string;
    selectedTransports: string;
    publishSwagger?: string;
    jndiName?: string;
    enableBoxcarring: boolean | null;
    enableBatchRequests: boolean | null;
    serviceStatus: string | null;
    disableLegacyBoxcarringMode: boolean | null;
    enableStreaming: boolean | null;
    description?: string | null;
    datasources: Datasource[];
    authProviderClass?: string;
    authProperties: Property[] | null;
    queries: any[] | undefined;
    operations: any[] | undefined;
    resources: any[] | undefined;
    writeType: string;
}

export interface Datasource {
    dataSourceName: string;
    enableOData: boolean | null;
    dynamicUserAuthClass?: string;
    datasourceProperties: Property[];
    datasourceConfigurations: Configuration[];
    dynamicUserAuthMapping?: boolean | null;
}

export interface Property {
    key: string;
    value: string;
}

export interface Configuration {
    carbonUsername: string;
    username: string;
    password: string;
}

export interface Query {
    queryName: string;
    datasource: string;
    sqlQuery?: string;
    expression?: string;
    returnGeneratedKeys: boolean | null;
    keyColumns?: string;
    returnUpdatedRowCount: boolean | null;
    queryProperties: Property[];
    hasQueryProperties: boolean | null;
    queryParams: QueryParam[];
    result?: Result;
}

export interface QueryParam {
    paramName: string;
    paramType: string;
    sqlType: string;
    defaultValue?: string;
    type: string;
    ordinal?: string;
    optional: boolean;
    validators: Validator[] | null;
}

export interface Validator {
    validationType: string;
    minimum?: string;
    maximum?: string;
    pattern?: string;
}

export interface Result {
    useColumnNumbers: boolean | null;
    escapeNonPrintableChar: boolean | null;
    defaultNamespace?: string;
    xsltPath?: string;
    rdfBaseURI?: string;
    element?: string;
    rowName?: string
    outputType?: string;
    elements: ElementResult[];
    complexElements: ComplexElementResult[];
    attributes: AttributeResult[];
    queries: QueryResult[];
}

export interface ElementResult {
    elementName: string;
    elementNamespace?: string;
    datasourceColumn?: string
    arrayName?: string;
    xsdType: string;
    optional: boolean;
    exportName?: string;
    exportType?: string;
    requiredRoles: string;
}

export interface ComplexElementResult {
    elementName: string;
    elementNamespace?: string;
    arrayName?: string;
    requiredRoles: string;
}

export interface AttributeResult {
    attributeName: string;
    datasourceColumn?: string
    xsdType: string;
    optional: boolean;
    exportName?: string;
    exportType?: string;
    requiredRoles: string;
}

export interface QueryResult {
    query: string;
    requiredRoles: string;
    queryParams: Property[];
    hasQueryParams: boolean | null;
}

export interface Operation {
    operationName: string;
    returnRequestStatus: boolean | null;
    disableStreaming: boolean | null;
    operationDescription?: string;
    query: string;
    queryParams: Property[];
    hasQueryParams: boolean | null;
}

export interface Resource {
    method: string;
    path: string;
    returnRequestStatus: boolean | null;
    disableStreaming: boolean | null;
    resourceDescription?: string;
    query: string;
    queryParams: Property[];
    hasQueryParams: boolean | null;
}

export function getDataServiceCreateMustacheTemplate() {
    return `
<data name="{{dataServiceName}}" serviceNamespace="{{dataServiceNamespace}}" serviceGroup="{{serviceGroup}}" transports="{{selectedTransports}}" {{#publishSwagger}}publishSwagger="{{publishSwagger}}"{{/publishSwagger}} {{#jndiName}}txManagerJNDIName="{{jndiName}}"{{/jndiName}} {{#enableBoxcarring}}enableBoxcarring="{{enableBoxcarring}}"{{/enableBoxcarring}} {{#enableBatchRequests}}enableBatchRequests="{{enableBatchRequests}}"{{/enableBatchRequests}} {{#serviceStatus}}serviceStatus="active"{{/serviceStatus}} {{#disableLegacyBoxcarringMode}}disableLegacyBoxcarringMode="{{disableLegacyBoxcarringMode}}"{{/disableLegacyBoxcarringMode}} {{#enableStreaming}}disableStreaming="true"{{/enableStreaming}}>
  {{#description}}<description>{{description}}</description>{{/description}}{{^description}}<description/>{{/description}}
  {{#datasources}}
  <config id="{{dataSourceName}}" {{#enableOData}}enableOData="{{enableOData}}"{{/enableOData}}>
    {{#datasourceProperties}}
    <property name="{{key}}">{{value}}</property>
    {{/datasourceProperties}}
    {{#dynamicUserAuthClass}}<property name="dynamicUserAuthClass">{{dynamicUserAuthClass}}</property>{{/dynamicUserAuthClass}}
    {{#dynamicUserAuthMapping}}<property name="dynamicUserAuthMapping">
      <configuration>
        {{#datasourceConfigurations}}
        <entry request="{{carbonUsername}}">
          <username>{{username}}</username>
          <password>{{password}}</password>
        </entry>
        {{/datasourceConfigurations}}
      </configuration>
    </property>{{/dynamicUserAuthMapping}}
  </config>
  {{/datasources}}
  {{#authProviderClass}}<authorization_provider class="{{authProviderClass}}">
    {{#authProperties}}
    <property name="{{key}}">{{value}}</property>
    {{/authProperties}}
  </authorization_provider>{{/authProviderClass}}
</data>`;
}

export function getDataServiceEditMustacheTemplate() {
    return `
<data name="{{dataServiceName}}" serviceNamespace="{{dataServiceNamespace}}" serviceGroup="{{serviceGroup}}" transports="{{selectedTransports}}" {{#publishSwagger}}publishSwagger="{{publishSwagger}}"{{/publishSwagger}} {{#jndiName}}txManagerJNDIName="{{jndiName}}"{{/jndiName}} {{#enableBoxcarring}}enableBoxcarring="{{enableBoxcarring}}"{{/enableBoxcarring}} {{#enableBatchRequests}}enableBatchRequests="{{enableBatchRequests}}"{{/enableBatchRequests}} {{#serviceStatus}}serviceStatus="active"{{/serviceStatus}} {{#disableLegacyBoxcarringMode}}disableLegacyBoxcarringMode="{{disableLegacyBoxcarringMode}}"{{/disableLegacyBoxcarringMode}} {{#enableStreaming}}disableStreaming="true"{{/enableStreaming}}>
  {{#description}}<description>{{description}}</description>{{/description}}{{^description}}<description/>{{/description}}
  {{#datasources}}
  <config id="{{dataSourceName}}" {{#enableOData}}enableOData="{{enableOData}}"{{/enableOData}}>
    {{#datasourceProperties}}
    <property name="{{key}}">{{value}}</property>
    {{/datasourceProperties}}
    {{#dynamicUserAuthClass}}<property name="dynamicUserAuthClass">{{dynamicUserAuthClass}}</property>{{/dynamicUserAuthClass}}
    {{#dynamicUserAuthMapping}}<property name="dynamicUserAuthMapping">
      <configuration>
        {{#datasourceConfigurations}}
        <entry request="{{carbonUsername}}">
          <username>{{username}}</username>
          <password>{{password}}</password>
        </entry>
        {{/datasourceConfigurations}}
      </configuration>
    </property>{{/dynamicUserAuthMapping}}
  </config>
  {{/datasources}}
  {{#queries}}
    {{{.}}}
  {{/queries}}
  {{#resources}}
        {{{.}}}
    {{/resources}}
  {{#operations}}
  {{{.}}}
  {{/operations}}
  {{#authProviderClass}}<authorization_provider class="{{authProviderClass}}">
    {{#authProperties}}
    <property name="{{key}}">{{value}}</property>
    {{/authProperties}}
  </authorization_provider>{{/authProviderClass}}
</data>`;
}

export function getDataServiceXml(data: DataServiceArgs) {

    data.description = data.description ? data.description : null;
    data.enableBoxcarring = data.enableBoxcarring ? data.enableBoxcarring : null;
    data.enableBatchRequests = data.enableBatchRequests ? data.enableBatchRequests : null;
    data.disableLegacyBoxcarringMode = data.disableLegacyBoxcarringMode ? data.disableLegacyBoxcarringMode : null;
    data.enableStreaming = data.enableStreaming ? null : !data.enableStreaming;
    data.serviceStatus = data.serviceStatus ? data.serviceStatus : null;

    if (data.authProperties != null && data.authProperties.length == 0) {
        data.authProperties = null;
    }

    data.datasources.forEach(datasource => {
        datasource.enableOData = datasource.enableOData ? datasource.enableOData : null;
    })

    if (data.datasources.length > 0) {
        data.datasources.forEach(datasource => {
            assignNullToEmptyStrings(datasource);
        })
    }

    data.datasources.forEach(datasource => {
        if (datasource.datasourceConfigurations != null && datasource.datasourceConfigurations.length > 0) {
            datasource.dynamicUserAuthMapping = true;
        } else {
            datasource.dynamicUserAuthMapping = null;
        }
    });

    assignNullToEmptyStrings(data);

    const modifiedData = {
        ...data
    };

    if (data.writeType === 'edit') {
        return render(getDataServiceEditMustacheTemplate(), modifiedData);
    } else {
        return render(getDataServiceCreateMustacheTemplate(), modifiedData);
    }
}

function assignNullToEmptyStrings(obj: { [key: string]: any }): void {
    for (const key in obj) {
        if ((Array.isArray(obj[key]) && obj[key].length == 0) || obj[key] === '' || obj[key] === 'disable' || obj[key] == undefined) {
            obj[key] = null;
        }
    }
}
