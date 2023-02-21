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
}
