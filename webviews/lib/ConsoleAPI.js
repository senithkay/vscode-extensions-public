export class ConsoleAPI {
    constructor() {
        const vscode = acquireVsCodeApi();
        const vscode_messenger = require("vscode-messenger-webview");
        this.messenger = new vscode_messenger.Messenger(vscode);
        this.messenger.start();
    }
    static getInstance() {
        if (!ConsoleAPI.instance) {
            ConsoleAPI.instance = new ConsoleAPI();
        }
        return ConsoleAPI.instance;
    }
    executeTest(input) {
        return this.messenger.sendRequest({ method: 'executeTest' }, { type: 'extension' }, input);
    }
    getContext() {
        return this.messenger.sendRequest({ method: 'getContext' }, { type: 'extension' });
    }
    getState() {
        return this.messenger.sendRequest({ method: 'getState' }, { type: 'extension' });
    }
    onStateChanged(callbal) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }
}
//# sourceMappingURL=ConsoleAPI.js.map