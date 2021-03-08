import {
    PostmanCollectionInfo, PostmanRequestInfo, PostmanWorkspaceInfo, SelectedPostmanCollectionUidInfo,
    SelectedPostmanWorkspaceInfo
} from "../../api/models";

export const INITIAL = "initialview";
export const API_KEY = "apikeyview";
export const WORKSPACE = "workspaceview";
export const REQUEST = "requestview";
export const COLLECTION = "collectionview";
export const WORKSPACE_CREATE = "workspacecreate";
export const COLLECTION_OVERVIEW = "collectionoverview";
export const COLLECTION_CREATE = "collectioncreate";


export type CONFIG_VIEWS = typeof INITIAL | typeof API_KEY | typeof WORKSPACE | typeof REQUEST | typeof COLLECTION |
    typeof COLLECTION_OVERVIEW | typeof WORKSPACE_CREATE | typeof COLLECTION_CREATE;

export interface SettingsState {
    isAPIkeyValidationInProgress: boolean;
    isPostmanSettingsExistsCallinProgress: boolean;
    postmanSettingsExists: boolean;
    isApiKeyValid : boolean;
    apiKeySaveInProgress: boolean;
    apiKeyDeleteInProgress: boolean;
    apiKeySaved: boolean;
    deployLogNotFound: boolean,
    isWorkspaceCreateLoading: boolean,
    isWorkspaceListLoading: boolean,
    workspaceList: PostmanWorkspaceInfo[],
    isCreateNewRequestInProgress : boolean,
    createRequestSuccess : boolean | null
    isWorkspaceLinkLoading: boolean,
    isWorkspaceLinked: boolean,
    createdWorkspace?: PostmanWorkspaceInfo,
    isCollectionCreateLoading: boolean,
    createdCollection?: PostmanCollectionInfo,
    isCollectionListLoading: boolean,
    collectionList: PostmanCollectionInfo[],
    selectedWorkspace: SelectedPostmanWorkspaceInfo,
    isSelectedWorkspaceLoading: boolean;
    selectedWorkspaceCallSuccess: boolean;
    isCollectionUidSaveInProgress: boolean;
    collectionUidSaved: boolean;
    isCollectionUidFetchInProgress: boolean,
    selectedCollection: SelectedPostmanCollectionUidInfo,
    requestList: PostmanRequestInfo[];
    requestListLoading: boolean;
    initialSettingsCheckInProgress: boolean;
    initialState: CONFIG_VIEWS;
    requestLimitReached: boolean;
    err?: Error
}
