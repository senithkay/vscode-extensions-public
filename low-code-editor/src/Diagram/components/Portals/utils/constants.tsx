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
    path: {
        title: "Set the path to expose the API.",
        content: "/users/[string name]"
    },
    SMTP: {
        host: "Host address from your SMTP client configurations",
        username: "Username from your SMTP client configurations",
        password: "Password from your SMTP client configurations",
        from: "Email address of the sender",
        to: "Email address of the receiver(s)",
        subject: "Subject of the email",
        body: "Body of the email"
    },
    IMAP: {
        host: "Host address from your IMAP client configurations",
        username: "Username from your IMAP client configurations",
        password: "Password from your IMAP client configurations",
    },
    POP3: {
        host: "Host address from your POP3 client configurations",
        username: "Username from your POP3 client configurations",
        password: "Password from your POP3 client configurations",
    },
    connectorButtons: {
        savaButton: "Save connector initialization",
        savaNextButton: "Configure connector invocation"
    }
}

export const connectorCategories = {
    GENERIC_CONNECTORS: "generic-connectors",
    SERVICE_CONNECTORS: "service-connectors",
    CHOREO_CONNECTORS: "choreo-connectors"
}
