import { OpenDialogOptions } from "@wso2-enterprise/choreo-core";
export interface ShowOpenDialogInputProps extends Omit<OpenDialogOptions, "defaultUri"> {
    label: string;
    repo: string;
    path: string;
    onOpen: (path: string) => void;
}
export declare const RepoFileOpenDialogInput: (props: ShowOpenDialogInputProps) => JSX.Element;
