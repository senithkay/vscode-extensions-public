import React, { useContext, useEffect } from "react";

import { Context as DiagramContext } from "../Contexts/Diagram";
import { LowCodeEditorProps as Props } from "../types";

import { Diagram } from "./";
import { TriggerType } from "./models";

export default function DiagramContainer(props: Props) {
    const { updateState } = useContext(DiagramContext);

    const {
        workingFile,
        currentApp,
        exprEditorState,
        ...restProps
    } = props;

    const displayType = currentApp ? currentApp.displayType : "";

    useEffect(() => {
        updateState({
            ...restProps,
            currentApp, // TODO Should remove this later as we already can access this via appInfo
        });
    }, [props])

    return (
        <Diagram
            dispatchModifyTrigger={props.onModify}
            dispatchMutations={props.onMutate}
            isReadOnly={props.isReadOnly || false}
            syntaxTree={props.syntaxTree}
            originalSyntaxTree={props.originalSyntaxTree}
            error={props.error}
            isLoadingAST={props.isLoadingAST} // TODO: provide below props to context
            isMutationInProgress={props.isMutationProgress}
            isCodeEditorActive={props.isCodeEditorActive}
            isConfigPanelOpen={props.isConfigPanelOpen}
            isConfigOverlayFormOpen={props.isConfigPanelOpen}
            isWaitingOnWorkspace={props.isWaitingOnWorkspace}
            dispatchFileChange={props.dispatchFileChange}
            dispatchCodeChangeCommit={props.dispatchCodeChangeCommit}
            triggerType={displayType as TriggerType}
            hasConfigurables={props.hasConfigurables}
        />
    )
}
