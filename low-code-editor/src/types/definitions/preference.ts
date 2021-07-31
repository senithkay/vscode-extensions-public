import { AppSplitViews } from "../";

export interface ZoomStatus {
    scale: number,
    panX: number,
    panY: number,
}
export interface AppPreference {
    appId: number
    obsId: string
    splitView : AppSplitViews
    zoomStatus: ZoomStatus
}

export interface UserPreference {
    hasTakenProductTour: boolean;
    showHotspots: boolean;
    isDarkThemeSelected?: boolean;
    isToolbarHidden?: boolean;
    productTourProgress: number;
    curlPayload: string;
}

export interface PreferenceState {
    userPreference: UserPreference;
    perAppPreference : AppPreference[]
}

export interface AppPreferenceId {
    appId : number;
    obsId : string;
}
