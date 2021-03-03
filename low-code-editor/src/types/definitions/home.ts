import { APISortingData, SortingData } from "../";
import { APIManagerAPIObj, AppInfo } from "../../api/models";

export interface HomeViewState {
    isAppListLoading: boolean;
    isApiListLoading: boolean;
    thumbnailCount: number;
    isAPIThumbnailLoading: boolean;
    isAppDeleteLoading: boolean;
    isAppCreateLoading: boolean;
    appList: AppInfo[];
    apiList: APIManagerAPIObj[];
    error?: Error;
    appListRowsPerPage: number;
    appListPageNumber: number;
    appListSortedColumn: SortingData;
    apiListRowsPerPage: number;
    apiListPageNumber: number;
    apiListSortedColumn: APISortingData;
    createdApp?: AppInfo;
}
