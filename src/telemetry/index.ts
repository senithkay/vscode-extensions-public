import TelemetryReporter from "vscode-extension-telemetry";
import { BallerinaExtension } from "../core";
import * as os from "os";
import * as vscode from "vscode";

const INSTRUMENTATION_KEY = "3a82b093-5b7b-440c-9aa2-3b8e8e5704e7";

export function createTelemetryReporter(ext: BallerinaExtension): TelemetryReporter {
    const reporter = new TelemetryReporter(ext.getID(), ext.getVersion(), INSTRUMENTATION_KEY);
    if (ext.context) {
        ext.context.subscriptions.push(reporter);
    }
    return reporter;
}

export function getTelemetryProperties(extension: BallerinaExtension, component: string, message: string = ''): { [key: string]: string; } {
    return {
        'common.os': os ? os.platform() : '',
        'common.platformversion': os ? os.release() : '',
        'common.extname': extension ? extension.getID() : '',
        'common.extversion': extension ? extension.getVersion() : '',
        'common.vscodemachineid': vscode && vscode.env ? vscode.env.machineId : '',
        'common.vscodesessionid': vscode && vscode.env ? vscode.env.sessionId : '',
        'common.vscodeversion': vscode ? vscode.version : '',
        'ballerina.version': extension ? extension.ballerinaVersion : '',
        'component': component,
        'message': message
    };
}

export * from "./events";
export * from "./exceptions";
export * from "./components";
