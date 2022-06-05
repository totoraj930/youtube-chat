import { EventEmitter } from "events";
import { fetchChat, fetchLivePage, fetchMetadata } from "./requests";
/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends EventEmitter {
    liveId;
    #isStarted = false;
    #language;
    #location;
    #timeout;
    #metaTimeout;
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
    get isStarted() {
        return this.#isStarted;
    }
    get interval() {
        return this.#interval;
    }
    set interval(intervalMs) {
        this.#interval = intervalMs;
    }
    get metaInterval() {
        return this.#metaInterval;
    }
    set metaInterval(intervalMs) {
        this.#metaInterval = intervalMs;
    }
    async start() {
        if (this.#isStarted) {
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
            this.#isStarted = true;
            // 初回リクエスト
            this.#execute();
            this.#executeMeta();
            this.emit("start", this.liveId);
            return true;
        }
        catch (err) {
            this.emit("error", err);
            return false;
        }
    }
    stop(reason) {
        if (this.#timeout) {
            clearTimeout(this.#timeout);
            this.#timeout = undefined;
        }
        if (this.#metaTimeout) {
            clearTimeout(this.#metaTimeout);
            this.#metaTimeout = undefined;
        }
        this.#isStarted = false;
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
        if (!this.#isStarted)
            return;
        this.#timeout = setTimeout(this.#execute.bind(this), this.#interval);
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
        if (!this.#isStarted)
            return;
        this.#metaTimeout = setTimeout(this.#executeMeta.bind(this), this.#metaInterval);
    }
}
//# sourceMappingURL=live-chat.js.map