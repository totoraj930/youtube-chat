/** APIレスポンスの型 */
/** updated_metadata Response */
export interface UpdatedMetadataResponse {
    actions: Action[];
    continuation: Continuation;
    responseContext: object;
}
/** get_live_chat Response */
export interface GetLiveChatResponse {
    responseContext: object;
    trackingParams?: string;
    continuationContents: {
        liveChatContinuation: {
            continuations: Continuation[];
            actions: Action[];
        };
    };
}
export interface Continuation {
    invalidationContinuationData?: {
        invalidationId: {
            objectSource: number;
            objectId: string;
            topic: string;
            subscribeToGcmTopics: boolean;
            protoCreationTimestampMs: string;
        };
        timeoutMs: number;
        continuation: string;
    };
    timedContinuationData?: {
        timeoutMs: number;
        continuation: string;
        clickTrackingParams: string;
    };
}
export interface Action {
    addChatItemAction?: AddChatItemAction;
    addLiveChatTickerItemAction?: object;
    updateViewershipAction?: UpdateViewershipAction;
    updateToggleButtonTextAction?: UpdateToggleButtonTextAction;
    updateTitleAction?: UpdateTitleAction;
    updateDescriptionAction?: UpdateDescriptionAction;
    updateDateTextAction?: UpdateDateTextAction;
}
export interface Thumbnail {
    url: string;
    width?: number;
    height?: number;
}
export interface MessageText {
    text: string;
}
export interface MessageEmoji {
    emoji: {
        emojiId: string;
        shortcuts: string[];
        searchTerms: string[];
        supportsSkinTone: boolean;
        image: {
            thumbnails: Thumbnail[];
            accessibility: {
                accessibilityData: {
                    label: string;
                };
            };
        };
        variantIds: string[];
        isCustomEmoji?: true;
    };
}
export declare type MessageRun = MessageText | MessageEmoji;
export interface AuthorBadge {
    liveChatAuthorBadgeRenderer: {
        customThumbnail?: {
            thumbnails: Thumbnail[];
        };
        icon?: {
            iconType: string;
        };
        tooltip: string;
        accessibility: {
            accessibilityData: {
                label: string;
            };
        };
    };
}
export interface MessageRendererBase {
    authorName?: {
        simpleText: string;
    };
    authorPhoto: {
        thumbnails: Thumbnail[];
    };
    authorBadges?: AuthorBadge[];
    contextMenuEndpoint: {
        clickTrackingParams: string;
        commandMetadata: {
            webCommandMetadata: {
                ignoreNavigation: true;
            };
        };
        liveChatItemContextMenuEndpoint: {
            params: string;
        };
    };
    id: string;
    timestampUsec: string;
    authorExternalChannelId: string;
    contextMenuAccessibility: {
        accessibilityData: {
            label: string;
        };
    };
}
export interface LiveChatTextMessageRenderer extends MessageRendererBase {
    message: {
        runs: MessageRun[];
    };
}
export interface LiveChatPaidMessageRenderer extends LiveChatTextMessageRenderer {
    purchaseAmountText: {
        simpleText: string;
    };
    headerBackgroundColor: number;
    headerTextColor: number;
    bodyBackgroundColor: number;
    bodyTextColor: number;
    authorNameTextColor: number;
}
export interface LiveChatPaidStickerRenderer extends MessageRendererBase {
    purchaseAmountText: {
        simpleText: string;
    };
    sticker: {
        thumbnails: Thumbnail[];
        accessibility: {
            accessibilityData: {
                label: string;
            };
        };
    };
    moneyChipBackgroundColor: number;
    moneyChipTextColor: number;
    stickerDisplayWidth: number;
    stickerDisplayHeight: number;
    backgroundColor: number;
    authorNameTextColor: number;
}
export interface LiveChatMembershipItemRenderer extends MessageRendererBase {
    headerPrimaryText?: {
        runs: MessageRun[];
    };
    headerSubtext: {
        runs?: MessageRun[];
        simpleText?: string;
    };
    authorBadges: AuthorBadge[];
}
export interface LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
    id: string;
    timestampUsec: string;
    authorExternalChannelId: string;
    header: {
        liveChatSponsorshipsHeaderRenderer: LiveChatSponsorshipsHeaderRenderer;
    };
}
export interface LiveChatSponsorshipsHeaderRenderer {
    primaryText: {
        runs: MessageRun[];
    };
    image?: {
        thumbnails?: {
            url: string;
        }[];
    };
    authorName?: {
        simpleText: string;
    };
    authorPhoto: {
        thumbnails: Thumbnail[];
    };
    authorBadges?: AuthorBadge[];
    contextMenuEndpoint: {
        clickTrackingParams: string;
        commandMetadata: {
            webCommandMetadata: {
                ignoreNavigation: true;
            };
        };
        liveChatItemContextMenuEndpoint: {
            params: string;
        };
    };
    contextMenuAccessibility: {
        accessibilityData: {
            label: string;
        };
    };
}
export interface AddChatItemAction {
    item: {
        liveChatTextMessageRenderer?: LiveChatTextMessageRenderer;
        liveChatPaidMessageRenderer?: LiveChatPaidMessageRenderer;
        liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer;
        liveChatPaidStickerRenderer?: LiveChatPaidStickerRenderer;
        liveChatSponsorshipsGiftPurchaseAnnouncementRenderer?: LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer;
        liveChatViewerEngagementMessageRenderer?: object;
    };
    clientId: string;
}
export interface VideoViewCountRenderer {
    isLive: boolean;
    extraShortViewCount: {
        accessibility: {
            accessibilityData: {
                label: string;
            };
        };
        simpleText: string;
    };
    viewCount: {
        simpleText: string;
    };
}
/** 視聴者数 */
export interface UpdateViewershipAction {
    viewCount: {
        videoViewCountRenderer: VideoViewCountRenderer;
    };
}
/** いいね数 */
export interface UpdateToggleButtonTextAction {
    buttonId: "TOGGLE_BUTTON_ID_TYPE_LIKE" | string;
    defaultText: {
        simpleText: string;
    };
    toggledText: {
        simpleText: string;
    };
}
/** n分前にライブ配信開始など */
export interface UpdateDateTextAction {
    dateText: {
        simpleText: string;
    };
}
/** タイトル */
export interface UpdateTitleAction {
    title: {
        runs: {
            text?: string;
        }[];
    };
}
/** 概要欄 */
export interface UpdateDescriptionAction {
    description: {
        runs: {
            text?: string;
        }[];
    };
}
/** Options for get_live_chat */
export interface FetchOptions {
    apiKey: string;
    clientVersion: string;
    continuation: string;
    language?: "ja" | "en";
    location?: "JP" | "US";
}
