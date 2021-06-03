import {
	CMP_JSON_TO_RECORD,
	sendTelemetryEvent,
	TM_EVENT_PASTE_AS_RECORD,
} from "../telemetry";
import { commands } from "vscode";
import { BallerinaExtension } from "../core";
import { pasteAsRecord } from "./paste-as-record";

export function activate(ballerinaExtInstance: BallerinaExtension) {
	sendTelemetryEvent(
		ballerinaExtInstance,
		TM_EVENT_PASTE_AS_RECORD,
		CMP_JSON_TO_RECORD
	);

	if (!ballerinaExtInstance.langClient) {
		return;
	}

	commands.registerCommand("ballerina.pasteAsRecord", () =>
		pasteAsRecord(ballerinaExtInstance)
	);
}
