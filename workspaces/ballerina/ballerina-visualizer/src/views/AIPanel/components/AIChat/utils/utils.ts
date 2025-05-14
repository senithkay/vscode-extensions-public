/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

const ONBOARDING_COUNTER_KEY = "onboardingCounter";

export function incrementOnboardingOpens(): number {
    const current = parseInt(localStorage.getItem(ONBOARDING_COUNTER_KEY) || "0", 10);
    const next = current + 1;
    localStorage.setItem(ONBOARDING_COUNTER_KEY, next.toString());
    return next;
}

export function getOnboardingOpens(): number {
    return parseInt(localStorage.getItem(ONBOARDING_COUNTER_KEY) || "0", 10);
}
