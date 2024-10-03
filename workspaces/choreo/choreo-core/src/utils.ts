/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const makeURLSafe = (input: string) => input?.trim()?.toLowerCase().replace(/\s+/g, "-");

export const getShortenedHash = (hash: string) => hash?.substring(0, 8);

export const getTimeAgo = (timestamp: string): string => {
	const currentTime = new Date();
	const previousTime = new Date(timestamp);
	const timeDifference = currentTime.getTime() - previousTime.getTime();

	const seconds = Math.floor(timeDifference / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (years > 0) {
		return `${years} year${years > 1 ? "s" : ""} ago`;
	}
	if (months > 0) {
		return `${months} month${months > 1 ? "s" : ""} ago`;
	}
	if (days > 0) {
		return `${days} day${days > 1 ? "s" : ""} ago`;
	}
	if (hours > 0) {
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	}
	if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	}
	return "Just now";
};

export const toTitleCase = (str: string): string => {
	return str
		?.replaceAll("_", " ")
		?.toLowerCase()
		?.replace(/\b\w/g, (char) => char.toUpperCase());
};
