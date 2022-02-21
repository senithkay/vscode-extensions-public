export type topLevelOptions =
    | "Main"
    | "Service"
    | "Trigger"
    | "Variable"
    | "Record"
    | "Function"
    | "Configurable"
    | "Constant"
    | "Listener"
    | "Enum"
    | "Class"
    | "Other"
    | "Resource";

export type methods = "GET" | "PUT" | "DELETE" | "POST" | "OPTIONS" | "HEAD" | "PATCH";

export type optionNames =
    | "Connector"
    | "Action"
    | "HTTP"
    | "Log"
    | "Variable"
    | "Assignment"
    | "Other"
    | "If"
    | "ForEach"
    | "While"
    | "Return"
    | "Respond"