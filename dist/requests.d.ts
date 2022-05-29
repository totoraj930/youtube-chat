import { FetchOptions } from "./types/yt-response";
import { ChatItem, MetadataItem } from "./types/data";
export declare function fetchChat(options: FetchOptions): Promise<[ChatItem[], string]>;
export declare function fetchLivePage(id: {
    channelId: string;
} | {
    liveId: string;
}): Promise<FetchOptions & {
    liveId: string;
}>;
export declare function fetchMetadata(options: FetchOptions, liveId: string): Promise<[MetadataItem, string]>;
