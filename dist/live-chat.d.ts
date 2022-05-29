import TypedEmitter from "typed-emitter";
import { ChatItem, MetadataItem } from "./types/data";
interface LiveChatEvents {
    start: (liveId: string) => void;
    end: (reason?: string) => void;
    chat: (chatItem: ChatItem) => void;
    chatlist: (chatItems: ChatItem[]) => void;
    metadata: (metadataItem: MetadataItem) => void;
    error: (err: Error | unknown) => void;
}
declare const LiveChat_base: new () => TypedEmitter<LiveChatEvents>;
/**
 * YouTubeライブチャット取得イベント
 */
export declare class LiveChat extends LiveChat_base {
    #private;
    liveId?: string;
    constructor(id: {
        channelId: string;
    } | {
        liveId: string;
    }, interval?: number, metaInterval?: number);
    start(): Promise<boolean>;
    stop(reason?: string): void;
}
export {};
