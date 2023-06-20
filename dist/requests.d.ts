import { FetchOptions } from "./types/yt-response";
import { ChatItem, YoutubeId } from "./types/data";
export type CustomFetchChatFunction = (options: FetchOptions) => Promise<any>;
export declare function fetchChat(options: FetchOptions, customFunc?: CustomFetchChatFunction): Promise<[ChatItem[], string]>;
export type CustomFetchLivePageFunction = (url: string) => Promise<string>;
export declare function fetchLivePage(id: YoutubeId, customFunc?: CustomFetchLivePageFunction): Promise<FetchOptions & {
    liveId: string;
}>;
