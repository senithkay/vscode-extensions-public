import { commands, window as w } from "vscode";
import { ResponseError } from "vscode-jsonrpc";
import { ErrorCode } from "./choreo-rpc/constants";
import { getLogger } from "./logger/logger";
import { authStore } from "./stores/auth-store";
import { openBillingPortal } from "./utils";
import { choreoEnvConfig } from "./auth/auth";

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
            case ErrorCode.UserNotFound:
                // Ignore error
                break;
            case ErrorCode.MaxProjectCountError:
                w.showErrorMessage(
                    "Failed to create project due to reaching maximum number of projects allowed within the free tier.",
                    "Upgrade"
                ).then((res) => {
                    if (res === "Upgrade") {
                        commands.executeCommand(
                            "vscode.open",
                            `${choreoEnvConfig.getBillingUrl()}/cloud/choreo/upgrade`
                        );
                    }
                });
                break;
            case ErrorCode.MaxComponentCountError:
                w.showErrorMessage(
                    "Failed to create component due to reaching maximum number of components allowed within the free tier.",
                    "Upgrade"
                ).then((res) => {
                    if (res === "Upgrade") {
                        commands.executeCommand(
                            "vscode.open",
                            `${choreoEnvConfig.getBillingUrl()}/cloud/choreo/upgrade`
                        );
                    }
                });
                break;
                case ErrorCode.EpYamlNotFound:
                    w.showErrorMessage(
                        ".choreo/endpoints.yaml file not found. Try again after committing your endpoints.yaml to your remote repo",
                        "View Documentation"
                    ).then((res) => {
                        if (res === "View Documentation") {
                            commands.executeCommand(
                                "vscode.open",
                                `https://wso2.com/choreo/docs/develop-components/configure-endpoints-body/`
                            );
                        }
                    });
                    break;
            default:
                getLogger().error("Unknown error", err);
                break;
        }
    }
}
