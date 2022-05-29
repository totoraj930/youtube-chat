import { FetchOptions, GetLiveChatResponse, UpdatedMetadataResponse } from "./types/yt-response";
import { ChatItem, MetadataItem } from "./types/data";
export declare function getOptionsFromLivePage(data: string): FetchOptions & {
    liveId: string;
};
/** get_live_chat レスポンスを変換 */
export declare function parseChatData(data: GetLiveChatResponse): [ChatItem[], string];
export declare function parseMetadata(data: UpdatedMetadataResponse): [MetadataItem, string];
