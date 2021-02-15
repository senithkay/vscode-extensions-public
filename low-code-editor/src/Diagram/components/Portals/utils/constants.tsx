export const keywords = [
    "if", "else", "fork", "join", "while", "foreach",
    "in", "return", "returns", "break", "transaction",
    "transactional", "retry", "commit", "rollback", "continue",
    "typeof", "enum", "wait", "check", "checkpanic", "panic",
    "trap", "match", "import", "version", "public", "private",
    "as", "lock", "new", "record", "limit", "start", "flush",
    "untainted", "tainted", "abstract", "external", "final",
    "listener", "remote", "is", "from", "on", "select", "where",
    "annotation", "type", "function", "resource", "service", "worker",
    "object", "client", "const", "let", "source", "parameter", "field",
    "xmlns", "true", "false", "null", "table", "key", "default", "do",
    "base16", "base64", "conflict", "outer", "equals", "boolean", "int",
    "float", "string", "decimal", "handle", "var", "any", "anydata", "byte",
    "future", "typedesc", "map", "json", "xml", "error", "never", "readonly",
    "distinct", "stream"
];

// Currently int, string, boolean, collection is used in AI
export const symbolKind: Record<number, string> = {
    1: "file",
    2: "module",
    3: "namespace",
    4: "package",
    5: "class",
    6: "method",
    7: "property",
    8: "field",
    9: "constructor",
    10: "enum",
    11: "interface",
    12: "function",
    13: "variable",
    14: "constant",
    15: "string",
    16: "int", // This is either int, float or decimal
    17: "boolean",
    18: "collection", // This is an Array
    19: "object",
    20: "key",
    21: "null",
    22: "enumMember",
    23: "struct",
    24: "event",
    25: "operator",
    26: "typeParameter"
}

// Tooltip messages
export const tooltipMessages: Record<string, any> = {
    expressionEditor: {
        title: "Add relevant expression syntax to provide inputs to different fields in a contextual manner",
        actionText: "Read More",
        actionLink: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/expression-editor.md"
    },
    currentValue: "Current Value Variable",
    name: "Name of the {0}",
    connectionName: "Add a valid connection name",
    responseVariableName: "Response Variable Name",
    headerName: "Header name",
    headerValue: "Header value",
    payloadVariableName: "Payload Variable Name",
    triggerSelector: {
        title :  "Select a suitable trigger . A trigger is an event or an action that causes a Choreo application to start executing. ",
        actionText : "Learn about triggers",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md"
    },
    apiTrigger: {
        title : "To create an API endpoint and trigger the application by calling it .",
        actionText : "Learn about API trigger",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#1-api"
    },
    manualTrigger: {
        title : "To create an application that can be triggered manually by clicking the 'Run' button",
        actionText : "Learn about manual trigger",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#2-Manual"
    },
    gitHubTrigger: {
        title : "To trigger an application based on GitHub events",
        actionText : "Learn about GitHub trigger",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#5-GitHub"
    },
    scheduleTrigger: {
        title : "To trigger an application according to a given schedule",
        actionText : "Learn about schedule trigger",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#3--schedule"
    },
    calenderTrigger: {
        title : "To trigger an application based on Google Calendar events",
        actionText : "Learn about calendar trigger",
        actionLink : "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#4-calendar"
    },
    httpMethod: "Select a suitable HTTP method to configure the API",
    path: {
        title: "Set the path to expose the API.",
        content: "/users/[string name]"
    },
    scheduleConfig: "Set the schedule for the trigger",
    cronExpression: {
        title: "A cron expression is a string containing subfields separated by white spaces. Each special character (*) represents Seconds, Minutes, Hours, Date, Month, and Day respectively.",
        actionText: "Read More",
        actionLink: "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
    },
    gitHubEvent: "Select a Github event to setup the trigger",
    gitHubAction: "Select a Github action to setup the trigger",
    calenderId: "Select your Google Calender",
    logStatement: {
        title: "Log is a record of an event or an error that occurs in the application",
        content : 'log:printInfo("infolog")\nlog:printError("error log")'
    },
    variableStatement: {
        title: "Variable is a location in memory which has a name and can hold a value",
        content : 'int x = 5'
    },
    ifStatement: {
        title: "If is a conditional check to evaluate if a statement is true or false",
        content : "int x=5 int y=10\nif(x>y)"
    },
    foreachStatement: {
        title: "Foreach is a control flow statement to iterate over a list of items",
        content : 'string [] flowers = ["Rose","Lily"]\nforeach var v in flowers {\nio:println("flower: ", v);}'
    },
    returnStatement: {
        title: "Return statement is used to stop executing the current sub routine and go back to the caller",
        content : 'return true\nreturn false'
    },
    respondStatement: {
        title: "Add a respond statement to the program",
        content : 'respond(caller)'
    },
    codePanelButton : "Code panel",
    analyzerButton : "Performance Forecast",
    fitToScreenButton : "Fit to screen",
    zoomInButton : "Zoom In",
    zoomOutButton : "Zoom Out",
    httpConnector: "To communicate with an external endpoint using the HTTP protocol.",
    smtpConnector: "Add a SMTP connector ",
    pop3Connector: "Add a POP3 Connector",
    imapConnector: "Add a IMAP Connector",
    slackConnector: "Add a Slack Connector",
    salesforceBase: "Salesforce BaseClient Connector",
    salesforceBulk: "Salesforce BulkJob Connector",
    gitHubConnector: "Add a GitHub connector",
    gmailConnector: "Add a Gmail Connector",
    gCalendarConnector: "Add a Google calendar connector",
    gSheetConnector: "Add a Google Sheet Connector",
    twilioConnector: "To integrate your application with Twillio",
}
