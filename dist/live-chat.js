import { EventEmitter } from "events";
import { fetchChat, fetchLivePage } from "./requests";
/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends EventEmitter {
    liveId;
    #observer;
    #options;
    #interval = 1000;
    #id;
    customFetchChatFunc;
    customFetchLivePageFunc;
    constructor(id, interval = 1000) {
        super();
        if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
            throw TypeError("Required channelId or liveId or handle.");
        }
        else if ("liveId" in id) {
            this.liveId = id.liveId;
        }
        this.#id = id;
        this.#interval = interval;
    }
    async start() {
        if (this.#observer) {
            return false;
        }
        try {
            const options = await fetchLivePage(this.#id, this.customFetchLivePageFunc);
            this.liveId = options.liveId;
            this.#options = options;
            this.#observer = setInterval(() => this.#execute(), this.#interval);
            this.emit("start", this.liveId);
            return true;
        }
        catch (err) {
            this.emit("error", err);
            return false;
        }
    }
    stop(reason) {
        if (this.#observer) {
            clearInterval(this.#observer);
            this.#observer = undefined;
            this.emit("end", reason);
        }
    }
    async #execute() {
        if (!this.#options) {
            const message = "Not found options";
            this.emit("error", new Error(message));
            this.stop(message);
            return;
        }
        try {
            const [chatItems, continuation] = await fetchChat(this.#options, this.customFetchChatFunc);
            chatItems.forEach((chatItem) => this.emit("chat", chatItem));
            this.#options.continuation = continuation;
        }
        catch (err) {
            this.emit("error", err);
        }
    }
}
//# sourceMappingURL=live-chat.js.map