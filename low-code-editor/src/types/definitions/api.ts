import { ApiCreateView, ApiManagerApiObj, ApiThumbnail, BusinessPlan } from "../../api/models";

export interface APIViewState {
    error?: Error;
    businessPlans?: BusinessPlan[];
    currentApi?: ApiManagerApiObj;
    apiThumbnail?: ApiThumbnail;
    isApiDeleting: boolean;
    isMoreAPIDetailsFetching: boolean;
    apiCreateView: ApiCreateView;
    configView: any; // TODO Use accurate type def.
}
