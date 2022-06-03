/** 整形後の型 */

/** 取得したチャット詳細 */
export interface ChatItem {
  id: string
  author: {
    name: string
    thumbnail?: ImageItem
    channelId: string
    badge?: {
      thumbnail: ImageItem
      label: string
    }
  }
  message: MessageItem[]
  superchat?: {
    amount: string
    color: string
    sticker?: ImageItem
    colorList: {
      // スパチャのみ
      headerBackgroundColor?: string
      headerTextColor?: string
      bodyBackgroundColor?: string
      bodyTextColor?: string
      // ステッカーのみ
      moneyChipBackgroundColor?: string
      moneyChipTextColor?: string
      backgroundColor?: string
      // 両方
      authorNameTextColor?: string
    }
  }
  membership? : {
    text: MessageItem[]
    subText?: string
  }
  isMembership: boolean
  isVerified: boolean
  isOwner: boolean
  isModerator: boolean
  timestamp: Date
}

/** チャットメッセージの文字列or絵文字 */
export type MessageItem = { text: string } | EmojiItem

/** 画像 */
export interface ImageItem {
  url: string
  alt: string
}

/** Emoji */
export interface EmojiItem extends ImageItem {
  emojiText: string
  isCustomEmoji: boolean
}

/** 取得したMetadata */
export interface MetadataItem {
  title?: string
  description?: string
  viewership?: number | string
  like?: number
  dateText?: string
}
