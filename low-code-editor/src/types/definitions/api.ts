import { APICreateView, APIManagerAPIObj, APIThumbnail, BusinessPlan, ConfigView } from "../../api/models";

export interface APIViewState {
    error?: Error;
    businessPlans?: BusinessPlan[];
    currentApi?: APIManagerAPIObj;
    apiThumbnail?: APIThumbnail;
    isApiDeleting: boolean;
    isMoreAPIDetailsFetching: boolean;

    apiCreateView: APICreateView;
    configView: ConfigView;
}
