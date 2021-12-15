export default {
    CHECKED_PAYLOAD_FUNCTION_INVOCATION: '{{{ TYPE }}} {{{ VARIABLE }}} = check {{{ RESPONSE }}}.{{{ PAYLOAD }}}();',
    DECLARATION: '{{{ TYPE }}} {{{ VARIABLE }}} = new ({{{ PARAMS }}});',
    FOREACH_STATEMENT_CONDITION: '{{{ TYPE }}} {{{ VARIABLE }}} in {{{ COLLECTION }}}',
    FOREACH_STATEMENT: `
foreach {{{ TYPE }}} {{{ VARIABLE }}} in {{{ COLLECTION }}} {

}`,
    IF_STATEMENT_CONDITION: '({{{ CONDITION }}})',
    IF_STATEMENT: `
if ({{{ CONDITION }}}) {

} else {

}`,

    IF_CONDITION: `
if ({{{ CONDITION }}}) {

`,
    ELSE_IF_CONDITION: `
} else if ({{{ CONDITION }}}) {

`,
    ELSE_STATEMENT: `
} else {

}`,
    IMPORT: 'import {{{ TYPE }}};',
    LOG_STATEMENT: 'log:print{{{ TYPE }}}({{{ LOG_EXPR }}});',
    PROPERTY_STATEMENT: '{{{ PROPERTY }}}',
    REMOTE_SERVICE_CALL_CHECK: '{{{ TYPE }}} {{{ VARIABLE }}} = check {{{ CALLER }}}-> {{{ FUNCTION }}}({{{ PARAMS }}});',
    REMOTE_SERVICE_CALL: '{{{ TYPE }}} {{{ VARIABLE }}} = {{{ CALLER }}}->{{{ FUNCTION }}}({{{ PARAMS }}});',
    RESOURCE_SIGNATURE: '{{{ METHOD }}} {{{ PATH }}} ({{{ QUERY_PARAM }}}{{{ PAYLOAD }}}{{#if ADD_REQUEST}}http:Request request{{/if}}{{#if ADD_CALLER}}{{#if ADD_REQUEST}}, {{/if}}{{/if}}{{#if ADD_CALLER}}http:Caller caller{{/if}}) {{#if ADD_RETURN}}returns {{ADD_RETURN}}{{/if}}',
    RESOURCE: `
resource function {{{ METHOD }}} {{{ PATH }}} ({{{ QUERY_PARAM }}}{{{PAYLOAD}}}{{#if ADD_REQUEST}}http:Request request{{/if}}{{#if ADD_CALLER}}{{#if ADD_REQUEST}}, {{/if}}{{/if}}{{#if ADD_CALLER}}http:Caller caller{{/if}}) {{#if ADD_RETURN}}returns {{ADD_RETURN}}{{/if}} {

}`,
    RESPOND_WITH_CHECK: 'check {{{ CALLER }}}->respond({{{ EXPRESSION }}});',
    RETURN_STATEMENT: 'return {{{ RETURN_EXPR }}};',
    SERVICE_CALL_CHECK: '{{{ TYPE }}} {{{ VARIABLE }}} = check {{{ CALLER }}}.{{{ FUNCTION }}}({{{ PARAMS }}});',
    SERVICE_CALL: '{{{ TYPE }}} {{{ VARIABLE }}} = {{{ CALLER }}}.{{{ FUNCTION }}}({{{ PARAMS }}});',
    WHILE_STATEMENT_CONDITION: '({{{ CONDITION }}})',
    WHILE_STATEMENT: `
while ({{{ CONDITION }}}) {

}`,
    SERVICE_AND_LISTENER_DECLARATION: `
listener http:Listener {{{ LISTENER_NAME }}} = new ({{{ PORT }}});

service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}} {
    resource function get .(http:Caller caller) returns error? {
    }
}`,
    SERVICE_DECLARATION_WITH_NEW_INLINE_LISTENER: `
service /{{{ BASE_PATH }}} on new http:Listener({{{ PORT }}}) {
    resource function get .(http:Caller caller) returns error? {
    }
}`,
    SERVICE_DECLARATION_WITH_SHARED_LISTENER: `
service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}} {
    resource function get .(http:Caller caller) returns error? {
    }
}`,
    LISTENER_DECLARATION: `
listener http:Listener {{{ LISTENER_NAME }}} = new ({{{ PORT }}});
`,
    FUNCTION_DEFINITION: `
{{{ ACCESS_MODIFIER }}} function {{{ NAME }}} ({{{ PARAMETERS }}}) {{{ RETURN_TYPE }}} {

}`,
    FUNCTION_DEFINITION_SIGNATURE: `{{{ NAME }}} ({{{ PARAMETERS }}}) {{{ RETURN_TYPE }}}`,
    SERVICE_WITH_LISTENER_DECLARATION_UPDATE: `
listener http:Listener {{{ LISTENER_NAME }}} = new ({{{ PORT }}});

service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}}`,
    SERVICE_DECLARATION_WITH_INLINE_LISTENER_UPDATE: `
service /{{{ BASE_PATH }}} on new http:Listener({{{ PORT }}})`,
    SERVICE_DECLARATION_WITH_SHARED_LISTENER_UPDATE: `
service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}}`,
    MODULE_VAR_DECL_WITH_INIT: `
{{{ACCESS_MODIFIER}}} {{{VAR_QUALIFIER}}} {{{VAR_TYPE}}} {{{VAR_NAME}}} = {{{VAR_VALUE}}};`,
    CONSTANT_DECLARATION: `
{{{ACCESS_MODIFIER}}} const {{{CONST_TYPE}}} {{{CONST_NAME}}} = {{{CONST_VALUE}}};`,
    MODULE_VAR_DECL_WITH_INIT_WITH_DISPLAY: `@display {
    label: {{{DISPLAY_LABEL}}}
}
{{{ACCESS_MODIFIER}}} {{{VAR_QUALIFIER}}} {{{VAR_TYPE}}} {{{VAR_NAME}}} = {{{VAR_VALUE}}};`,
    TYPE_DEFINITION: `
{{#if ACCESS_MODIFIER }}{{{ ACCESS_MODIFIER }}} {{/if}}type {{{ TYPE_NAME }}} {{{ TYPE_DESCRIPTOR }}}`,
    TRIGGER: `
    configurable {{triggerType}}:ListenerConfig userInput = {
        {{#each this.listenerParams.0.fields}}
            {{ this.name }}: {{{ this.defaultValue }}} {{#unless @last}},{{/unless}}
            {{/each}}
        };

        {{#if httpBased }}listener http:Listener httpListener = new(8090);{{/if}}
        listener {{triggerType}}:Listener webhookListener = new(userInput{{#if httpBased }}, httpListener{{/if}});

        {{#each serviceTypes}}
        service {{../triggerType}}:{{ this.name }} on webhookListener {

          {{#each this.functions}}
            remote function {{ this.name }}({{#each this.parameters}}{{#if @index}},
            {{/if}}{{../../../triggerType}}:{{this.typeInfo.name}} {{this.name}} {{/each}}) returns error? {
              //Not Implemented
            }
          {{/each}}
        }
        {{/each}}

        {{#if httpBased }}service /ignore on httpListener {}{{/if}}`,
    TRIGGER_UPDATE: `
    service {{{ TRIGGER_CHANNEL }}} on {{{ LISTENER_NAME }}}`
}
