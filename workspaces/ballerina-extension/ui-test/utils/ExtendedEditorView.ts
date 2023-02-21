import { By, EditorView, until, VSBrowser } from "vscode-extension-tester";

export class ExtendedEditorView {
    editorView: EditorView;

    constructor(treeItem: EditorView) {
        this.editorView = treeItem;
    }

    async getAction(title: string) {
        const elemetnt = "//li[@title='" + title + "']";
        return await this.editorView.findElement(By.xpath(elemetnt));
    }
}
