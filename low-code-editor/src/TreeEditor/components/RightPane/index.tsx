import React from "react";

import { statementEditorStyles } from "../ViewContainer/styles";

export function RightPane() {
    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.AppRightPane}>
            <div className={overlayClasses.AppRightPaneBlock}>
                <h4 className={overlayClasses.AppRightPaneHeading}>Variables</h4>
            </div>
            <div className={overlayClasses.AppRightPaneBlock}>
                <h4 className={overlayClasses.AppRightPaneHeading}>Constants</h4>
            </div>
            <div className={overlayClasses.AppRightPaneBlock}>
                <h4 className={overlayClasses.AppRightPaneHeading}>Functions</h4>
            </div>
            <div className={overlayClasses.AppRightPaneBlock}></div>

        </div>
    );
}
