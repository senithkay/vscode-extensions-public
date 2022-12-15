import { commands } from "vscode";
import { createNewProjectCmdId } from "../constants";
import { ext } from "../extensionVariables";
import { ProjectCreationWizard } from "../views/webviews/ProjectCreationWizard";

export function activateWizards() {
    const createProjectCmd = commands.registerCommand(createNewProjectCmdId, () => {
        ProjectCreationWizard.render();
    });
  
    ext.context.subscriptions.push(createProjectCmd);
  }