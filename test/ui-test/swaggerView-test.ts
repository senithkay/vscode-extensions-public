import { ActivityBar, CustomTreeSection, WebView, SideBarView, VSBrowser, By, EditorView } from 'vscode-extension-tester';
import { join } from 'path';
import { expect } from 'chai';
import { wait } from './util';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT);
        await wait(2000);
    });

    it('Test tryit button', async () => {
        const editorView = new EditorView();
        await editorView.closeAllEditors();
        const activityBar = new ActivityBar();

        const lowCodeActivity = await activityBar.getViewControl('Ballerina Low-Code');
        lowCodeActivity!.openView();
        const sideBar = new SideBarView();
        const diagramExplorer = await sideBar.getContent().getSection('Diagram Explorer') as CustomTreeSection;

        await wait(5000);
        const rootFolder = (await diagramExplorer.getVisibleItems())[0];
        await rootFolder.expand();
        (await rootFolder.findChildItem("hello_world_service.bal"))?.click();
        await wait(5000)
        const webview = new WebView();
        await webview.switchToFrame();
        const tryItButton = (await webview.findWebElements(By.className("action-button")))[1];
        expect(tryItButton).is.not.undefined;
        console.log(await tryItButton.getText());

        await tryItButton.click();
        await wait(25000);
    });
});
