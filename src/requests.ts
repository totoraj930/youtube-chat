import axios from "axios"
import { parseChatData, getOptionsFromLivePage } from "./parser"
import { FetchOptions } from "./types/yt-response"
import { ChatItem, YoutubeId } from "./types/data"

axios.defaults.headers.common["Accept-Encoding"] = "utf-8"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomFetchChatFunction = (options: FetchOptions) => Promise<any>

const fetchChatFunc: CustomFetchChatFunction = async (options) => {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`
  const res = await axios.post(url, {
    context: {
      client: {
        clientVersion: options.clientVersion,
        clientName: "WEB",
      },
    },
    continuation: options.continuation,
  })
  return res.data
}

export async function fetchChat(
  options: FetchOptions,
  customFunc: CustomFetchChatFunction = fetchChatFunc
): Promise<[ChatItem[], string]> {
  const data = await customFunc(options)
  return parseChatData(data)
}

export type CustomFetchLivePageFunction = (url: string) => Promise<string>

const fetchLivePageFunc: CustomFetchLivePageFunction = async (url) => {
  const res = await axios.get(url)
  return res.data.toString()
}

export async function fetchLivePage(
  id: YoutubeId,
  customFunc: CustomFetchLivePageFunction = fetchLivePageFunc
) {
  const url = generateLiveUrl(id)
  if (!url) {
    throw TypeError("not found id")
  }
  const data = await customFunc(url)
  return getOptionsFromLivePage(data)
}

function generateLiveUrl(id: YoutubeId) {
  if ("channelId" in id) {
    return `https://www.youtube.com/channel/${id.channelId}/live`
  } else if ("liveId" in id) {
    return `https://www.youtube.com/watch?v=${id.liveId}`
  } else if ("handle" in id) {
    let handle = id.handle
    if (!handle.startsWith("@")) {
      handle = "@" + handle
    }
    return `https://www.youtube.com/${handle}/live`
  }
  return ""
}
