import { http } from "@tauri-apps/api"
import { parseChatData, getOptionsFromLivePage, parseMetadata } from "./parser"
import { FetchOptions, GetLiveChatResponse, UpdatedMetadataResponse } from "./types/yt-response"
import { ChatItem, MetadataItem } from "./types/data"

export async function fetchChat(options: FetchOptions): Promise<[ChatItem[], string]> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`
  const res = await http.fetch(url, {
    method: "POST",
    responseType: http.ResponseType.JSON,
    headers: {
      "content-type": "application/json",
    },
    body: http.Body.json({
      context: {
        client: {
          clientVersion: options.clientVersion,
          clientName: "WEB",
          hl: options.language || "ja",
          gl: options.location || "JP",
        },
      },
      continuation: options.continuation,
    }),
  })

  return parseChatData(res.data as GetLiveChatResponse)
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string }) {
  const url =
    "channelId" in id
      ? `https://www.youtube.com/channel/${id.channelId}/live`
      : `https://www.youtube.com/watch?v=${id.liveId}`
  const res = await http.fetch(url, { method: "GET", responseType: http.ResponseType.Text })
  return getOptionsFromLivePage(res.data as string)
}

export async function fetchMetadata(options: FetchOptions, liveId: string): Promise<[MetadataItem, string]> {
  const url = `https://www.youtube.com/youtubei/v1/updated_metadata?key=${options.apiKey}`
  const payload: {
    context: object
    continuation?: string
    videoId?: string
  } = {
    context: {
      client: {
        clientVersion: options.clientVersion,
        clientName: "WEB",
        hl: options.language || "ja",
        gl: options.location || "JP",
      },
    },
  }
  if (options.continuation.length > 0) {
    payload.continuation = options.continuation
  } else {
    payload.videoId = liveId
  }
  const res = await http.fetch(url, {
    method: "POST",
    responseType: http.ResponseType.JSON,
    headers: {
      "content-type": "application/json",
    },
    body: http.Body.json(payload),
  })
  return parseMetadata(res.data as UpdatedMetadataResponse)
}
