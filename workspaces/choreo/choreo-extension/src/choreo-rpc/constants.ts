// error codes

export enum ErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    UnauthorizedError = -32000,
    TokenNotFoundError = -32001,
    InvalidTokenError = -32002,
    ForbiddenError = -32003,
    RefreshTokenError = -32004,
    ComponentNotFound = -32005,
    ProjectNotFound = -32006,
    MaxProjectCountError = -32007,
    RepoAccessNeeded = -32008,
    EpYamlNotFound = -32009,
    UserNotFound = -32010,
    MaxComponentCountError = -32011,
}

