import { EventEmitter } from "events";
import { fetchChat, fetchLivePage, fetchMetadata } from "./requests";
/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends EventEmitter {
    liveId;
    #language;
    #location;
    #observer;
    #metaObserver;
    #options;
    #metaOptions;
    #interval = 1000;
    #metaInterval = 5000;
    #id;
    constructor(id, interval = 1000, metaInterval = 5000, language = "ja", location = "JP") {
        super();
        if (!id || (!("channelId" in id) && !("liveId" in id))) {
            throw TypeError("Required channelId or liveId.");
        }
        else if ("liveId" in id) {
            this.liveId = id.liveId;
        }
        this.#id = id;
        this.#interval = interval;
        this.#metaInterval = metaInterval;
        this.#language = language;
        this.#location = location;
    }
    async start() {
        if (this.#observer) {
            return false;
        }
        try {
            const options = await fetchLivePage(this.#id);
            this.liveId = options.liveId;
            this.#options = {
                ...options,
                language: this.#language,
                location: this.#location,
            };
            this.#metaOptions = {
                ...options,
                language: this.#language,
                location: this.#location,
                continuation: "",
            };
            this.#observer = setInterval(() => this.#execute(), this.#interval);
            this.#metaObserver = setInterval(() => this.#executeMeta(), this.#metaInterval);
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
        }
        if (this.#metaObserver) {
            clearInterval(this.#metaObserver);
            this.#metaObserver = undefined;
        }
        this.emit("end", reason);
    }
    async #execute() {
        if (!this.#options) {
            const message = "Not found options";
            this.emit("error", new Error(message));
            this.stop(message);
            return;
        }
        try {
            const [chatItems, continuation] = await fetchChat(this.#options);
            chatItems.forEach((chatItem) => this.emit("chat", chatItem));
            this.emit("chatlist", chatItems);
            this.#options.continuation = continuation;
        }
        catch (err) {
            this.emit("error", err);
        }
    }
    async #executeMeta() {
        if (!this.#metaOptions || !this.liveId) {
            const message = "Not found options";
            this.emit("error", new Error(message));
            this.stop(message);
            return;
        }
        try {
            const [metadataItem, continuation] = await fetchMetadata(this.#metaOptions, this.liveId);
            this.emit("metadata", metadataItem);
            this.#metaOptions.continuation = continuation;
        }
        catch (err) {
            this.emit("error", err);
        }
    }
}
//# sourceMappingURL=live-chat.js.map