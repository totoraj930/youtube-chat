import TypedEmitter from "typed-emitter";
import { ChatItem, YoutubeId } from "./types/data";
import { CustomFetchChatFunction, CustomFetchLivePageFunction } from "./requests";
type LiveChatEvents = {
    start: (liveId: string) => void;
    end: (reason?: string) => void;
    chat: (chatItem: ChatItem) => void;
    error: (err: Error | unknown) => void;
};
declare const LiveChat_base: new () => TypedEmitter<LiveChatEvents>;
/**
 * YouTubeライブチャット取得イベント
 */
export declare class LiveChat extends LiveChat_base {
    #private;
    liveId?: string;
    customFetchChatFunc?: CustomFetchChatFunction;
    customFetchLivePageFunc?: CustomFetchLivePageFunction;
    constructor(id: YoutubeId, interval?: number);
    start(): Promise<boolean>;
    stop(reason?: string): void;
}
export {};
