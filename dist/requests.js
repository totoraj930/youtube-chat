import axios from "axios";
import { parseChatData, getOptionsFromLivePage } from "./parser";
axios.defaults.headers.common["Accept-Encoding"] = "utf-8";
const fetchChatFunc = async (options) => {
    const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`;
    const res = await axios.post(url, {
        context: {
            client: {
                clientVersion: options.clientVersion,
                clientName: "WEB",
            },
        },
        continuation: options.continuation,
    });
    return res.data;
};
export async function fetchChat(options, customFunc = fetchChatFunc) {
    const data = await customFunc(options);
    return parseChatData(data);
}
const fetchLivePageFunc = async (url) => {
    const res = await axios.get(url);
    return res.data.toString();
};
export async function fetchLivePage(id, customFunc = fetchLivePageFunc) {
    const url = generateLiveUrl(id);
    if (!url) {
        throw TypeError("not found id");
    }
    const data = await customFunc(url);
    return getOptionsFromLivePage(data);
}
function generateLiveUrl(id) {
    if ("channelId" in id) {
        return `https://www.youtube.com/channel/${id.channelId}/live`;
    }
    else if ("liveId" in id) {
        return `https://www.youtube.com/watch?v=${id.liveId}`;
    }
    else if ("handle" in id) {
        let handle = id.handle;
        if (!handle.startsWith("@")) {
            handle = "@" + handle;
        }
        return `https://www.youtube.com/${handle}/live`;
    }
    return "";
}
//# sourceMappingURL=requests.js.map