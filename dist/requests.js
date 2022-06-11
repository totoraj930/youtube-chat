import { http } from "@tauri-apps/api";
import { parseChatData, getOptionsFromLivePage, parseMetadata } from "./parser";
export async function fetchChat(options) {
    const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`;
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
    });
    return parseChatData(res.data);
}
export async function fetchLivePage(id) {
    const url = "channelId" in id
        ? `https://www.youtube.com/channel/${id.channelId}/live`
        : "liveId" in id
            ? `https://www.youtube.com/watch?v=${id.liveId}`
            : `https://www.youtube.com/c/${id.customChannelId}/live`;
    const res = await http.fetch(url, { method: "GET", responseType: http.ResponseType.Text });
    return getOptionsFromLivePage(res.data);
}
export async function fetchMetadata(options, liveId) {
    const url = `https://www.youtube.com/youtubei/v1/updated_metadata?key=${options.apiKey}`;
    const payload = {
        context: {
            client: {
                clientVersion: options.clientVersion,
                clientName: "WEB",
                hl: options.language || "ja",
                gl: options.location || "JP",
            },
        },
    };
    if (options.continuation.length > 0) {
        payload.continuation = options.continuation;
    }
    else {
        payload.videoId = liveId;
    }
    const res = await http.fetch(url, {
        method: "POST",
        responseType: http.ResponseType.JSON,
        headers: {
            "content-type": "application/json",
        },
        body: http.Body.json(payload),
    });
    return parseMetadata(res.data);
}
//# sourceMappingURL=requests.js.map