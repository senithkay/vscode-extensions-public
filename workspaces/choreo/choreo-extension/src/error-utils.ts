import { window as w } from 'vscode'
import { ResponseError } from "vscode-jsonrpc";
import { ErrorCode } from "./choreo-rpc/constants";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";

export function handlerError(err: any) {
    if (err instanceof ResponseError) {
        switch (err.code) {
            case ErrorCode.ParseError:
                getLogger().error("ParseError", err);
                break;
            case ErrorCode.InvalidRequest:
                getLogger().error("InvalidRequest", err);
                break;
            case ErrorCode.MethodNotFound:
                getLogger().error("MethodNotFound", err);
                break;
            case ErrorCode.InvalidParams:
                getLogger().error("InvalidParams", err);
                break;
            case ErrorCode.InternalError:
                getLogger().error("InternalError", err);
                break;
            case ErrorCode.UnauthorizedError:
                authStore.getState().logout();
                w.showErrorMessage("Unauthorized. Please sign in again.");
                break;
            case ErrorCode.TokenNotFoundError:
                authStore.getState().logout();
                w.showErrorMessage("Token not found. Please sign in again.");
                break;
            case ErrorCode.InvalidTokenError:
                authStore.getState().logout();
                w.showErrorMessage("Invalid token. Please sign in again.");
                break;
            case ErrorCode.ForbiddenError:
                getLogger().error("ForbiddenError", err);
                break;
            case ErrorCode.RefreshTokenError:
                authStore.getState().logout();
                w.showErrorMessage("Error refreshing token. Please sign in again.");
                break;
            case ErrorCode.ComponentNotFound:
                w.showErrorMessage("Component not found");
                break;
            case ErrorCode.ProjectNotFound:
                w.showErrorMessage("Project not found");
                break;
            default:
                getLogger().error("Unknown error", err);
                break;
        }
    }
}

