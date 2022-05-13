import { EventEmitter } from "events"
import TypedEmitter from "typed-emitter"
import { ChatItem, MetadataItem } from "./types/data"
import { FetchOptions } from "./types/yt-response"
import { fetchChat, fetchLivePage, fetchMetadata } from "./requests"

interface LiveChatEvents {
  start: (liveId: string) => void
  end: (reason?: string) => void
  chat: (chatItem: ChatItem) => void
  metadata: (metadataItem: MetadataItem) => void
  error: (err: Error | unknown) => void
}

/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends (EventEmitter as new () => TypedEmitter<LiveChatEvents>) {
  liveId?: string
  #observer?: NodeJS.Timer
  #metaObserver?: NodeJS.Timer
  #options?: FetchOptions
  #metaOptions?: FetchOptions
  readonly #interval: number = 1000
  readonly #metaInterval: number = 5000
  readonly #id: { channelId: string } | { liveId: string }

  constructor(id: { channelId: string } | { liveId: string }, interval = 1000, metaInterval = 5000) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id))) {
      throw TypeError("Required channelId or liveId.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }

    this.#id = id
    this.#interval = interval
    this.#metaInterval = metaInterval
  }

  async start(): Promise<boolean> {
    if (this.#observer) {
      return false
    }
    try {
      const options = await fetchLivePage(this.#id)
      this.liveId = options.liveId
      this.#options = options
      this.#metaOptions = {
        apiKey: options.apiKey,
        clientVersion: options.clientVersion,
        continuation: "",
      }

      this.#observer = setInterval(() => this.#execute(), this.#interval)

      this.#metaObserver = setInterval(() => this.#executeMeta(), this.#metaInterval)

      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stop(reason?: string) {
    if (this.#observer) {
      clearInterval(this.#observer)
      this.#observer = undefined
    }
    if (this.#metaObserver) {
      clearInterval(this.#metaObserver)
      this.#metaObserver = undefined
    }
    this.emit("end", reason)
  }

  async #execute() {
    if (!this.#options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {
      const [chatItems, continuation] = await fetchChat(this.#options)
      chatItems.forEach((chatItem) => this.emit("chat", chatItem))

      this.#options.continuation = continuation
    } catch (err) {
      this.emit("error", err)
    }
  }

  async #executeMeta() {
    if (!this.#metaOptions || !this.liveId) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {
      const [metadataItem, continuation] = await fetchMetadata(this.#metaOptions, this.liveId)
      this.emit("metadata", metadataItem)

      this.#metaOptions.continuation = continuation
    } catch (err) {
      this.emit("error", err)
    }
  }
}
