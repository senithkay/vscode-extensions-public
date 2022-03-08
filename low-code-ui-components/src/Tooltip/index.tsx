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
import { useIntl } from 'react-intl';

import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import { InfoIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import * as MonacoEditor from 'monaco-editor';

import useStyles, { tooltipInvertedStyles, tooltipStyles } from "./style";

export { TooltipProps } from '@material-ui/core/Tooltip';

interface TooltipPropsExtended extends TooltipProps {
    actionText?: string;
    actionLink?: string;
    inverted?: boolean;
    codeSnippet?: boolean;
    content?: string; // Only when Code Snippet prop available
    example?: boolean; // Only when Code Snippet prop available
    disabled?: boolean;
    openInCodeView?: () => void;
    heading?: string;
    typeExamples?: string;
};

const TooltipComponent = withStyles(tooltipStyles)(TooltipBase);
const TooltipBaseInverted = withStyles(tooltipInvertedStyles)(TooltipBase);

export function Tooltip(props: Partial<TooltipPropsExtended>) {
    const styles = useStyles();
    const intl = useIntl();

    const tooltipHintText = intl.formatMessage({
        id: "lowcode.develop.elements.tooltip.hintText",
        defaultMessage: "Hints:"
    });

    const tooltipHintSuggestionText = intl.formatMessage({
        id: "lowcode.develop.elements.tooltip.suggestionText",
        defaultMessage: "Press Ctrl/Cmd+Spacebar for suggestions"
    });
    const tooltipHintVarScopeText = intl.formatMessage({
        id: "lowcode.develop.elements.tooltip.varScopeText",
        defaultMessage: "You can use variables within the scope"
    });

    // Ref: <code>
    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
        }
    };

    const { children, heading, title, content, example, actionText, actionLink, inverted, disabled, codeSnippet, openInCodeView,  typeExamples, ...restProps } = props;

    // Skip Tooltip rendering if disabled prop provided.
    if (disabled) return (<>{children}</>);

    let TooltipComponentRef = TooltipComponent;

    // Always invert background color if interactive prop set to `true`
    if (props.interactive) {
        TooltipComponentRef = TooltipBaseInverted;
    }

    const GenericExamples = () => (
        <pre className={styles.exampleCodeWrap}>
            <span>E.g.</span><code ref={codeRef} data-lang="ballerina" className={styles.codeExample}>{typeExamples}</code>
        </pre>
    );
    const GenericCodeHints = () => (
        <div className={styles.codeHintWrap}>
            <div className={styles.codeHint}><b>{tooltipHintText}</b></div>
            <ul className={styles.tooltipHints}>
                <li className={styles.codeHint}>{tooltipHintSuggestionText}</li>
                <li className={styles.codeHint}>{tooltipHintVarScopeText}</li>
            </ul>
        </ div>
    );

    let tooltipTitle = (
        <div>
            {heading && (<h4 className={styles.heading}>{heading}</h4>)}
            <div>{title}</div>
            {typeExamples && <><GenericExamples /><GenericCodeHints /></>}
            {actionText && (<a className={styles.buttonLink} href={actionLink} target="_blank">{actionText}</a>)}
        </div>
    );

    // Modify tooltipTitle if codeSnippet prop has set.
    if (codeSnippet) {
        const Code = () => (
            <code
                ref={codeRef}
                data-lang="ballerina"
                className={example ? styles.codeExample : styles.code}
            >
                {content}
            </code>
        );

        const OpenInCodeLink = () => (
            <React.Fragment>
                <Divider className={styles.divider} light={true} />
                <span className={styles.editorLink} onClick={openInCodeView}>View in Code Editor</span>
            </React.Fragment>
        )

        let CodeSnippet = () => (
            <pre className={styles.pre}>
                <Code />
                {openInCodeView && <OpenInCodeLink />}
            </pre>
        );

        if (example) {
            CodeSnippet = () => (
                <div className={styles.exampleCodeWrap}>
                    <div>E.g.</div> <Code />
                </div>
            );
        }

        tooltipTitle = (
            <>
                {heading && (<h4 className={styles.heading}>{heading}</h4>)}
                {title && (<p>{title}</p>)}
                <CodeSnippet />
                <GenericExamples />
                <GenericCodeHints />
            </>
        );
    }

    return <TooltipComponentRef {...restProps} title={tooltipTitle}>{children}</TooltipComponentRef>
}

export function TooltipIcon(props: Partial<TooltipPropsExtended>) {
    const styles = useStyles();

    let iconComponent =  <InfoIcon />;

    const { title, children, ...restProps } = props;

    if (children) {
        iconComponent = <><div className={styles.content}>{children}</div> <div className={styles.iconWrapper}>{iconComponent}</div></>;
    }

    return (
        <Tooltip {...restProps} title={title} interactive={true} placement="right-start">
            <div className={styles.componentWrapper}>
                {iconComponent}
            </div>
        </Tooltip>
    );
}

export function TooltipCodeSnippet(props: Partial<TooltipPropsExtended>) {
    const { content = "", openInCodeView, children, ...restProps } = props;

    return (
        <Tooltip
            {...restProps}
            openInCodeView={openInCodeView}
            content={content.trim()}
            title={null}
            codeSnippet={true}
            interactive={true}
        >
            {children}
        </Tooltip>
    );
}
