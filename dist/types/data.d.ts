/** 整形後の型 */
/** 取得したチャット詳細 */
export interface ChatItem {
    id: string;
    author: {
        name: string;
        thumbnail?: ImageItem;
        channelId: string;
        badge?: {
            thumbnail: ImageItem;
            label: string;
        };
    };
    message: MessageItem[];
    superchat?: PaidMessage | PaidSticker;
    isMembership: boolean;
    isVerified: boolean;
    isOwner: boolean;
    isModerator: boolean;
    timestamp: Date;
}
/** スーパーチャット */
export interface PaidMessage {
    amount: string;
    color: string;
    colorPalette: {
        headerBackgroundColor: string;
        headerTextColor: string;
        bodyBackgroundColor: string;
        bodyTextColor: string;
        authorNameTextColor: string;
    };
}
/** スーパーステッカー */
export type PaidSticker = {
    amount: string;
    color: string;
    sticker: ImageItem;
    colorPalette: {
        moneyChipBackgroundColor: string;
        moneyChipTextColor: string;
        backgroundColor: string;
        authorNameTextColor: string;
    };
};
/** チャットメッセージの文字列or絵文字 */
export type MessageItem = {
    text: string;
} | EmojiItem;
/** 画像 */
export interface ImageItem {
    url: string;
    alt: string;
}
/** Emoji */
export interface EmojiItem extends ImageItem {
    emojiText: string;
    isCustomEmoji: boolean;
}
export type YoutubeId = {
    channelId: string;
} | {
    liveId: string;
} | {
    handle: string;
};
