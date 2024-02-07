/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

function getValidateMustacheTemplate() {
    return `<validate {{#source}}source="{{source}}"{{/source}} 
          {{#cache-schema}}cache-schema="{{cache-schema}}"{{/cache-schema}} 
          {{#description}}description="{{description}}"{{/description}}>
    {{#schema}}
    <schema key="{{key}}" optional="{{optional}}" type="{{type}}" pattern="{{pattern}}" max="{{max}}" min="{{min}}" 
{{#values}}values="{{values}}"{{/values}} {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
{{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}/>
    {{/schema}}
    {{#on-fail}}
    <on-fail>
        {{#sequence}}
        <sequence key="{{key}}" {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
      {{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}>
{{#mediator}}
<{{type}} key="{{key}}" {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
           {{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}>
    {{#args}}
    <arg value="{{value}}" {{#description}}description="{{description}}"{{/description}}/>
    {{/args}}
</{{type}}>
{{/mediator}}
        </sequence>
        {{/sequence}}
    </on-fail>
    {{/on-fail}}
</validate>`;
}
