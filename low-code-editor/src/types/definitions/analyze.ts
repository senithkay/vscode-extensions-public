import { GraphAnalysisData, SequenceDiagramAnalysisData } from "../../api/models";

export interface ServiceAnalysisInfo {
    sequenceDiagramData: SequenceDiagramAnalysisData[],
    graphData: GraphAnalysisData[]
    isLoading: boolean,
    isAdvanceLoading: boolean,
    error?: Error,
    currentSelection?: SequenceDiagramAnalysisData,
    bannerData?: GraphAnalysisData,
    isBannerDataLoading?: boolean,
    isPerformanceViewOpen?: boolean
}

export interface JobAnalysisInfo {
    sequenceDiagramData: SequenceDiagramAnalysisData[],
    graphData: GraphAnalysisData[],
    isAdvanceLoading: boolean,
    isLoading: boolean,
    error?: Error,
    currentSelection?: SequenceDiagramAnalysisData,
    isPerformanceViewOpen?: boolean
}

export type AnalysisInfo = ServiceAnalysisInfo | JobAnalysisInfo;
