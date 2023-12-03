import { Uri, Webview } from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    if (process.env.WEB_VIEW_DEV_MODE === "true") {
        return process.env.WEB_VIEW_DEV_HOST + pathList[pathList.length - 1];
    }
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}