export default {
    CHECKED_PAYLOAD_FUNCTION_INVOCATION: '{{{ TYPE }}} {{{ VARIABLE }}} = check {{{ RESPONSE }}}.{{{ PAYLOAD }}}();',
    DECLARATION: '{{{ TYPE }}} {{{ VARIABLE }}} = new ({{{ PARAMS }}});',
    FOREACH_STATEMENT_CONDITION: '{{{ VARIABLE }}} in {{{ COLLECTION }}}',
    FOREACH_STATEMENT: '{{{ VARIABLE }}} in {{{ COLLECTION }}}',
    IF_STATEMENT_CONDITION: '({{{ CONDITION }}})',
    IF_STATEMENT: `
if ({{{ CONDITION }}}) {

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
    LISTENER_DECLARATION:  `
listener http:Listener {{{ LISTENER_NAME }}} = new ({{{ PORT }}});
`,
    FUNCTION_DEFINITION: `
function {{{ NAME }}} ({{{ PARAMETERS }}}) {{{ RETURN_TYPE }}} {

}`,
    FUNCTION_DEFINITION_SIGNATURE: `{{{ NAME }}} ({{{ PARAMETERS }}}) {{{ RETURN_TYPE }}}`,
    SERVICE_WITH_LISTENER_DECLARATION_UPDATE: `
listener http:Listener {{{ LISTENER_NAME }}} = new ({{{ PORT }}});

service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}}`,
    SERVICE_DECLARATION_WITH_INLINE_LISTENER_UPDATE: `
service /{{{ BASE_PATH }}} on new http:Listener({{{ PORT }}})`,
    SERVICE_DECLARATION_WITH_SHARED_LISTENER_UPDATE: `
service /{{{ BASE_PATH }}} on {{{ LISTENER_NAME }}}`,
    TYPE_DEFINITION: `
{{#if ACCESS_MODIFIER }}{{{ ACCESS_MODIFIER }}} {{/if}}type {{{ TYPE_NAME }}} {{{ TYPE_DESCRIPTOR }}}`
}
