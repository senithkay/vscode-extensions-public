import { EditorView, VSBrowser } from 'vscode-extension-tester';
import { join } from 'path';
import { expect } from 'chai';
import { wait } from './util';

describe('Hello World Example UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');


    it('Test Title bar', async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        const editorView = new EditorView();
        await wait(2000);
        expect(await editorView.getAction("Run")).is.not.undefined;
        expect(await editorView.getAction("Debug")).is.not.undefined;

        await wait(5000);
        expect(await editorView.getAction("Show Diagram")).is.not.undefined;
        (await editorView.getAction("Show Diagram"))!.click();

        await wait(2000);
        expect(await editorView.getAction("Show Source", 1)).is.not.undefined;

    });
});
