/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// import {
//     createStyles,
//     makeStyles,
//     Theme,
// } from '@material-ui/core/styles';


import { css } from "@emotion/css";

export const useStyles = () => ({
    balModuleListWrap: css({
        marginTop: '16px', // theme.spacing(2)
        height: '80vh',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
    }),
    balModuleSectionWrap: css({
        marginTop: '48px', // theme.spacing(6)
        '&:first-of-type': {
            marginTop: 0,
        },
    }),
    pageLoadingText: css({
        marginLeft: '16px', // theme.spacing(2)
    }),
    container: css({
        width: '600px',
        height: '85vh',
        '& .MuiFormControl-marginNormal': {
            margin: '0 !important',
        },
        '& #module-list-container': {
            paddingRight: 0,
        },
    }),
    msgContainer: css({
        height: '80vh',
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
    }),
    resultsContainer: css({
        marginTop: '16px', // theme.spacing(2)
        scrollbarWidth: 'none',
        display: 'flex',
        alignContent: 'flex-start',
    }),
    filterBtn: css({
        '& .MuiIconButton-root': {
            padding: 0,
        },
        '& h5': {
            color: '#000000', // theme.palette.common.black
            fontWeight: 400,
            marginLeft: '8px', // theme.spacing(1)
        },
    }),
    filterTagWrap: css({
        maxHeight: '48px',
    }),
    filterTag: css({
        border: '1px solid #E6E7EC',
        borderRadius: '8px',
        paddingLeft: '8px',
    }),
    filterRemoveBtn: css({
        padding: '8px',
    }),
});

export default useStyles;


// const useStyles = makeStyles((theme: Theme) =>
//     createStyles({
//         balModuleListWrap: {
//             marginTop: theme.spacing(2),
//             height: '80vh',
//             overflowY: 'scroll',
//             scrollbarWidth: 'none',
//         },
//         balModuleSectionWrap: {
//             marginTop: theme.spacing(6),
//             '&:first-child': {
//                 marginTop: 0
//             }
//         },
//         pageLoadingText: {
//             marginLeft: theme.spacing(2),
//         },
//         container: {
//             width: 600,
//             height: '85vh',
//             '& .MuiFormControl-marginNormal': {
//                 margin: '0 !important',
//             },
//             '& #module-list-container': {
//                 paddingRight: 0,
//             },
//         },
//         msgContainer: {
//             height: '80vh',
//             alignContent: 'center',
//             alignItems: 'center',
//         },
//         resultsContainer: {
//             marginTop: theme.spacing(2),
//             scrollbarWidth: 'none',
//             display: 'flex',
//             alignContent: 'flex-start',
//         },
//         filterBtn: {
//             '& .MuiIconButton-root': {
//                 padding: 0
//             },
//             '& h5': {
//                 color: theme.palette.common.black,
//                 fontWeight: 400,
//                 marginLeft: theme.spacing(1),
//             },
//         },
//         filterTagWrap: {
//             maxHeight: '48px',
//         },
//         filterTag: {
//             border: '1px solid #E6E7EC',
//             borderRadius: '8px',
//             paddingLeft: '8px'
//         },
//         filterRemoveBtn: {
//             padding: '8px',
//         }
//     })
// );

// export default useStyles;


