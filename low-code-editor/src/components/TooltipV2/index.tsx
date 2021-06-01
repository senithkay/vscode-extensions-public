/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
    text?: {heading?: string, content?: string, example?: string, code?: string},
    action?: {link: string, text: string},
    disabled?: boolean;
    onClick?: () => void;
}

const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);
const codeRef = (ref: HTMLPreElement) => {
    if (ref) {
        MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
    }
}

export default function TooltipV2(props: Partial<TooltipPropsExtended>) {
    const { children, title, text, action, disabled, onClick, type, ...restProps } = props;
    const styles = useStyles();
    let tooltipComp = (
        <div>
            <h4 className={styles.heading}>{text.heading}</h4>
        </div>
    )

    switch (type){
        case "diagram-code" :
            tooltipComp = DiagramCodeTooltip(props)
            break;
        case "example" :
            tooltipComp = ExampleTooltip(props)
            break;
        case "heading" :
            tooltipComp = HeadingTooltip(props)
            break;
        case "heading-content" :
            tooltipComp = HeadingContentTooltip(props)
            break;
        case "truncate-code" :
            tooltipComp = CodeTruncateTooltip(props)
            break;
        case "info" :
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
    const { text, onClick } = props;
    const styles = useStyles();
    const Code = () => (
        <code
            ref={codeRef}
            data-lang="ballerina"
            className={text.code ? styles.codeExample : styles.code}
        >
            {text.code.trim()}
        </code>
    );
    const OpenInCodeLink = () => (
        <React.Fragment>
            <Divider className={styles.divider} light={true}/>
            <span className={styles.editorLink} onClick={onClick}>View in Code Editor</span>
        </React.Fragment>
    )
    return (
        <pre className={styles.pre}>
                <Code/>
            {onClick && <OpenInCodeLink/>}
            </pre>
    );
}

function ExampleTooltip(props: Partial<TooltipPropsExtended>) {
    const { text } = props;
    const styles = useStyles();
    return (
        <div>
            <h4 className={styles.heading}>{text.heading}</h4>
            <h2 className={styles.subHeading}>{text.content}</h2>
            <div className={styles.codeExample}>
               <div>Eg: </div>{text.example}
            </div>
        </div>
    )
}

function ActionTooltip(props: Partial<TooltipPropsExtended>) {
    const { text, action } = props;
    const styles = useStyles();
    return (
        <div>
            {text.heading && (<div className={styles.heading}>{text.heading}</div>)}
            {text.content && (<div className={styles.subHeading}>{text.content}</div>)}
            <Divider className={styles.divider} light={true}/>
            {action.text && (<a className={styles.buttonLink} href={action.link} target="_blank">{action.text}</a>)}
        </div>
    )
}

function HeadingTooltip(props: Partial<TooltipPropsExtended>) {
    const { text } = props;
    const styles = useStyles();
    return (
        <div>
            <h4 className={styles.heading}>{text.content}</h4>
        </div>
    );
}

function HeadingContentTooltip(props: Partial<TooltipPropsExtended>) {
    const { text } = props;
    const styles = useStyles();
    return (
        <div>
            <div className={styles.heading}>{text.heading}</div>
            <div className={styles.subHeading}>{text.content}</div>
        </div>
    );
}

function CodeTruncateTooltip(props: Partial<TooltipPropsExtended>) {
    const { text } = props;
    const styles = useStyles();
    return (
        <code
            ref={codeRef}
            data-lang="ballerina"
            className={styles.code}
        >
            {text.code.trim()}
        </code>
    );
}
