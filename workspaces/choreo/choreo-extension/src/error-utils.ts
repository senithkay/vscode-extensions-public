import { window } from 'vscode'
import { ResponseError } from "vscode-jsonrpc";
import { ErrorCode } from "./choreo-rpc/constants";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";

export function HandlerError(err: any) {
    if (err instanceof ResponseError) {
        switch (err.code) {
            case ErrorCode.ParseError:
                console.error("ParseError", err.message);
                break;
            case ErrorCode.InvalidRequest:
                console.error("InvalidRequest", err.message);
                break;
            case ErrorCode.MethodNotFound:
                console.error("MethodNotFound", err.message);
                break;
            case ErrorCode.InvalidParams:
                console.error("InvalidParams", err.message);
                break;
            case ErrorCode.InternalError:
                console.error("InternalError", err.message);
                break;
            case ErrorCode.UnauthorizedError:
                getLogger().debug("Signing out from Choreo");
                authStore.getState().logout();
                window.showErrorMessage("Unauthorized. Please sign in again.");
                break;
            case ErrorCode.TokenNotFoundError:
                console.error("TokenNotFoundError", err.message);
                break;
            case ErrorCode.InvalidTokenError:
                console.error("InvalidTokenError", err.message);
                break;
            case ErrorCode.ForbiddenError:
                console.error("ForbiddenError", err.message);
                break;
            case ErrorCode.RefreshTokenError:
                console.error("RefreshTokenError", err.message);
                break;
            case ErrorCode.ComponentNotFound:
                console.error("ComponentNotFound", err.message);
                break;
            case ErrorCode.ProjectNotFound:
                console.error("ProjectNotFound", err.message);
                break;
            default:
                console.error("UnknownError", err.message);
                break;
        }
    }
}

