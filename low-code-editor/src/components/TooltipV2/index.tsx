/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';

import Divider from '@material-ui/core/Divider';
import {withStyles} from "@material-ui/core/styles";
import TooltipBase, {TooltipProps} from '@material-ui/core/Tooltip';
import * as MonacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import useStyles, {tooltipBaseStyles} from "./style";

export { TooltipProps } from '@material-ui/core/Tooltip';

interface TooltipPropsExtended extends TooltipProps {
    type: string,
    heading?: string,
    subHeading?: string;
    actionText?: string;
    actionLink?: string;
    codeSnippet?: string;
    example?: string;
    disabled?: boolean;
    openInCodeView?: () => void;
}

const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);
const codeRef = (ref: HTMLPreElement) => {
    if (ref) {
        MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
    }
}

export default function TooltipV2(props: Partial<TooltipPropsExtended>) {
    const { children, title, example, actionText, actionLink, disabled, codeSnippet, openInCodeView, heading,
            subHeading, type, ...restProps } = props;
    const styles = useStyles();
    let tooltipComp = (
        <div>
            <h4 className={styles.heading}>{heading}</h4>
        </div>
    )

    switch (type){
        case "diagram-code" :
            tooltipComp = DiagramCodeTooltip(props)
            break;
        case "example" :
            tooltipComp = ExampleTooltip(props)
            break;
        case "title" :
            tooltipComp = TitleTooltip(props)
            break;
        case "title-content" :
            tooltipComp = TitleContentTooltip(props)
            break;
        case "truncate-code" :
            tooltipComp = CodeTruncateTooltip(props)
            break;
        case "action" :
            tooltipComp = ActionTooltip(props)
            break;
        case "icon" :
            tooltipComp = TooltipIcon(props)
            break;
    }
    if (disabled) return (<>{children}</>);

    return <TooltipComponent interactive={true} {...restProps} title={tooltipComp}>{children}</TooltipComponent>
}

function TooltipIcon(props: Partial<TooltipPropsExtended>) {
    const styles = useStyles();
    const { children } = props;
    const infoIcon = <img src="../../../../../../images/info.svg"  alt="info-icon"/>;
    let iconComponent = infoIcon;
    if (children) {
        iconComponent = <><div>{children}</div> <div className={styles.iconWrapper}>{infoIcon}</div></>;
    }

    return (
        <div className={styles.componentWrapper}>
            {iconComponent}
        </div>
    );
}

function DiagramCodeTooltip(props: Partial<TooltipPropsExtended>) {
    const {codeSnippet, openInCodeView} = props;
    const styles = useStyles();
    const Code = () => (
        <code
            ref={codeRef}
            data-lang="ballerina"
            className={codeSnippet ? styles.codeExample : styles.code}
        >
            {codeSnippet.trim()}
        </code>
    );
    const OpenInCodeLink = () => (
        <React.Fragment>
            <Divider className={styles.divider} light={true}/>
            <span className={styles.editorLink} onClick={openInCodeView}>View in Code Editor</span>
        </React.Fragment>
    )
    return (
        <pre className={styles.pre}>
                <Code/>
            {openInCodeView && <OpenInCodeLink/>}
            </pre>
    );
}

function ExampleTooltip(props: Partial<TooltipPropsExtended>) {
    const { heading, subHeading, example } = props;
    const styles = useStyles();
    return (
        <div>
            <h4 className={styles.heading}>{heading}</h4>
            <h2 className={styles.subHeading}>{subHeading}</h2>
            <div className={styles.codeExample}>
               <div>Eg: </div>{example}
            </div>
        </div>
    )
}

function ActionTooltip(props: Partial<TooltipPropsExtended>) {
    const { heading, actionText, actionLink } = props;
    const styles = useStyles();
    return (
        <div>
            {heading && (<h4 className={styles.heading}>{heading}</h4>)}
            {actionText && (<a className={styles.buttonLink} href={actionLink} target="_blank">{actionText}</a>)}
        </div>
    )
}

function TitleTooltip(props: Partial<TooltipPropsExtended>) {
    const { heading } = props;
    const styles = useStyles();
    return (
        <div>
            <h4 className={styles.heading}>{heading}</h4>
        </div>
    );
}

function TitleContentTooltip(props: Partial<TooltipPropsExtended>) {
    const { heading, subHeading } = props;
    const styles = useStyles();
    return (
        <div>
            <div className={styles.heading}>{heading}</div>
            <div className={styles.subHeading}>{subHeading}</div>
        </div>
    );
}

function CodeTruncateTooltip(props: Partial<TooltipPropsExtended>) {
    const {codeSnippet} = props;
    const styles = useStyles();
    return (
        <code
            ref={codeRef}
            data-lang="ballerina"
            className={styles.code}
        >
            {codeSnippet.trim()}
        </code>
    );
}
