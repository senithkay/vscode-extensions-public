import { APISortingData, SortingData } from "../";
import { ApiManagerApiObj, AppInfo } from "../../api/models";

export interface HomeViewState {
    isAppListLoading: boolean;
    isApiListLoading: boolean;
    thumbnailCount: number;
    isAPIThumbnailLoading: boolean;
    isAppDeleteLoading: boolean;
    isAppCreateLoading: boolean;
    appList: AppInfo[];
    apiList: ApiManagerApiObj[];
    error?: Error;
    appListRowsPerPage: number;
    appListPageNumber: number;
    appListSortedColumn: SortingData;
    apiListRowsPerPage: number;
    apiListPageNumber: number;
    apiListSortedColumn: APISortingData;
    createdApp?: AppInfo;
}
