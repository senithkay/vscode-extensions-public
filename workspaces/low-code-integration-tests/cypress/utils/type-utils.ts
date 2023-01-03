export type topLevelOptions =
    | "Main"
    | "Service"
    | "Trigger"
    | "Variable"
    | "Record"
    | "Function"
    | "Configurable"
    | "Constant"
    | "Connector"
    | "Listener"
    | "Enum"
    | "Class"
    | "Other"
    | "Resource"
    | "Data Mapper";

export type blockLevelOptions =
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
    | "Worker"

export type methods = "GET" | "PUT" | "DELETE" | "POST" | "OPTIONS" | "HEAD" | "PATCH";

export type modelTypes = "IntTypeDesc" | "BooleanLiteral"  | "SimpleNameReference" | "NumericLiteral" | any;
