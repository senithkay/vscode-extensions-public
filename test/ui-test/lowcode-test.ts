import { ActivityBar, CustomTreeSection, WebView, SideBarView, VSBrowser, By } from 'vscode-extension-tester';
import { join } from 'path';
import { expect } from 'chai';
import { wait } from './util';

describe('VSCode Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        await wait(2000);
    });

    it('Test Diagram', async () => {
        const activityBar = new ActivityBar();

        const lowCodeActivity = await activityBar.getViewControl('Ballerina Low-Code');
        lowCodeActivity!.openView();
        const sideBar = new SideBarView();
        const diagramExplorer = await sideBar.getContent().getSection('Diagram Explorer') as CustomTreeSection;

        // test diagram explorer tree view
        await wait(5000);
        const rootFolder = (await diagramExplorer.getVisibleItems())[0];
        await rootFolder.expand();
        (await rootFolder.findChildItem("hello_world.bal"))?.click();
        await wait(5000)
        const webview = new WebView();
        await webview.switchToFrame();
        const element = await webview.findWebElement(By.id("canvas-overlay"));
        expect(element).is.not.undefined;
    });
});
