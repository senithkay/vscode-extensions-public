import { ActivityBar, CustomTreeSection, EditorView, SideBarView, VSBrowser } from 'vscode-extension-tester';
import { join } from 'path';
import { expect } from 'chai';
import { wait } from './util';

describe('Hello World Example UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
        await wait(2000);
    });

    it('Test Title bar', async () => {
        const editorView = new EditorView();
        expect(await editorView.getAction("Run")).is.not.undefined;
        expect(await editorView.getAction("Debug")).is.not.undefined;

        await wait(5000);
        expect(await editorView.getAction("Show Diagram")).is.not.undefined;
        (await editorView.getAction("Show Diagram"))!.click();

        await wait(2000);
        expect(await editorView.getAction("Show Source", 1)).is.not.undefined;

    });

    it('Test Side bar', async () => {
        const activityBar = new ActivityBar();

        // test side bar low code activity
        const lowCodeActivity = await activityBar.getViewControl('Ballerina Low-Code');
        expect(lowCodeActivity).is.not.undefined;
        lowCodeActivity!.openView();

        const sideBar = new SideBarView();
        // test tree views
        expect(await sideBar.getTitlePart().getTitle()).is.equal("BALLERINA LOW-CODE");
        const diagramExplorer = await sideBar.getContent().getSection('Diagram Explorer') as CustomTreeSection;
        const choreoLogin = await sideBar.getContent().getSection('Choreo') as CustomTreeSection;
        expect(diagramExplorer).is.not.undefined;
        expect(choreoLogin).is.not.undefined;

        // test root buttons
        expect(diagramExplorer.getAction("Add Module")).is.not.undefined;
        expect(diagramExplorer.getAction("Refresh")).is.not.undefined;

        // test diagram explorer tree view
        await wait(5000);
        const rootFolder = (await diagramExplorer.getVisibleItems())[0];
        expect(rootFolder).is.not.undefined;
        expect(await rootFolder.getLabel()).is.equal("data");
        expect(await rootFolder.getActionButton("New File")).is.not.undefined;
        expect(await rootFolder.getActionButton("New Folder")).is.not.undefined;
        expect(await rootFolder.getActionButton("Delete")).is.not.undefined;
        await rootFolder.expand();
        expect(await rootFolder.findChildItem("hello_world.bal")).is.not.undefined;

    });
});
