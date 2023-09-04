
// TODO: Make a decision on where we keep these.
// We can either make expression editor module a library which has all the utils
// or we can move all the stuff in to statement editor except expression editor.
export interface ExpressionEditorHintProps {
    onClickHere: () => void;
    type: HintType;
    editorContent?: string;
    expressionType?: string;
}

export enum HintType {
    ADD_CHECK,
    ADD_DOUBLE_QUOTES,
    ADD_BACK_TICKS,
    ADD_DOUBLE_QUOTES_EMPTY,
    ADD_BACK_TICKS_EMPTY,
    ADD_TO_STRING,
    ADD_ELVIS_OPERATOR,
    SUGGEST_CAST,
    CONFIGURABLE,
}
