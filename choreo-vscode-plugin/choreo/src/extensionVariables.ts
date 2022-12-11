import { debug } from "console";
import { commands, EventEmitter, ExtensionContext, TreeItem, TreeView } from "vscode";
import { ChoreoLoginStatus } from "./auth/events";
import { ChoreoAccessToken } from "./auth/types";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";
import { choreoSignedInCtxKey } from "./constants";

export namespace ext {
    export let context: ExtensionContext;
    export let isPluginStartup: boolean;
    export let api: ChoreoExtensionApi;

    // views
    export let projectsTreeView: TreeView<TreeItem>;
    export let accountTreeView: TreeView<TreeItem>;
}
