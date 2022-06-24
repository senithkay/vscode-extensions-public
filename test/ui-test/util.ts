import { expect } from "chai";
import { SideBarView, CustomTreeSection, ActivityBar } from "vscode-extension-tester";

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getDiagramExplorer() {
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
    return diagramExplorer;
}
