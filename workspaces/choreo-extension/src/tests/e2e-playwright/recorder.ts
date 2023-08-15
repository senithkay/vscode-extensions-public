import { startVSCode } from "./launch";

(async () => {
    const vscode = await startVSCode();
    const page = await vscode.firstWindow();
    page.pause();
})();
