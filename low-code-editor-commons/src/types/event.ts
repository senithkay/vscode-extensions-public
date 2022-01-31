// types related track lowcode events
export const ADD_STATEMENT = "editor-workspace-add-statement";
export const SAVE_STATEMENT = "editor-workspace-save-statement";

export const ADD_CONNECTOR = "editor-workspace-add-connector";
export const SAVE_CONNECTOR = "editor-workspace-save-connector";
export const SEARCH_CONNECTOR = "editor-workspace-search-connector";
export const SAVE_CONNECTOR_INIT = "editor-workspace-save-connector-init";
export const SAVE_CONNECTOR_INVOKE = "editor-workspace-save-connector-invoke";
export const CONNECTOR_CLOSED = "editor-workspace-connector-form-closed";

export const ADD_CONFIGURABLE = "editor-workspace-add-configurable";

export const ADD_VARIABLE = "editor-workspace-add-variable";
export const SAVE_VARIABLE = "editor-workspace-save-variable";
export const ADD_OTHER_STATEMENT = "editor-workspace-add-other-statement";
export const SAVE_OTHER_STATEMENT = "editor-workspace-save-other-statement";

export const OPEN_LOW_CODE = "editor-workspace-open";

export type EVENT_NAME = typeof ADD_STATEMENT |
    typeof SAVE_STATEMENT | typeof ADD_CONNECTOR |
    typeof SAVE_CONNECTOR_INIT | typeof SAVE_CONNECTOR |
    typeof SAVE_CONNECTOR_INVOKE |
    typeof CONNECTOR_CLOSED | typeof ADD_VARIABLE | typeof SAVE_VARIABLE | typeof ADD_CONNECTOR | typeof SAVE_CONNECTOR |
    typeof ADD_OTHER_STATEMENT | typeof SAVE_OTHER_STATEMENT | typeof SEARCH_CONNECTOR | typeof ADD_CONFIGURABLE |
    typeof OPEN_LOW_CODE;

export interface LowcodeEvent {
    type: EVENT_NAME;
    name?: any;
    property?: any;
}
