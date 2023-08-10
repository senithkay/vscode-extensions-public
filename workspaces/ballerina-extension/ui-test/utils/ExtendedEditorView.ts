import { waitUntil } from "../util";
import { By, EditorView } from "vscode-extension-tester";

export class ExtendedEditorView {
    editorView: EditorView;

    constructor(treeItem: EditorView) {
        this.editorView = treeItem;
    }

    async getAction(title: string) {
        const element = By.xpath("//li[@title='" + title + "']");
        await waitUntil(element);
        return await this.editorView.findElement(element);
    }

    async getCodeLense(title: string, index: number = 0) {
        const element = By.xpath("//a[text()='" + title + "']");
        await waitUntil(element, 30000);
        return (await this.editorView.findElements(element))[index];
    }
}
