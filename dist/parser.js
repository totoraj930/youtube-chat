export function getOptionsFromLivePage(data) {
    let liveId;
    const idResult = data.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=(.+?)">/);
    if (idResult) {
        liveId = idResult[1];
    }
    else {
        throw new Error("Live Stream was not found");
    }
    const replayResult = data.match(/['"]isReplay['"]:\s*(true)/);
    if (replayResult) {
        throw new Error(`${liveId} is finished live`);
    }
    let apiKey;
    const keyResult = data.match(/['"]INNERTUBE_API_KEY['"]:\s*['"](.+?)['"]/);
    if (keyResult) {
        apiKey = keyResult[1];
    }
    else {
        throw new Error("API Key was not found");
    }
    let clientVersion;
    const verResult = data.match(/['"]clientVersion['"]:\s*['"]([\d.]+?)['"]/);
    if (verResult) {
        clientVersion = verResult[1];
    }
    else {
        throw new Error("Client Version was not found");
    }
    let continuation;
    const continuationResult = data.match(/['"]continuation['"]:\s*['"](.+?)['"]/);
    if (continuationResult) {
        continuation = continuationResult[1];
    }
    else {
        throw new Error("Continuation was not found");
    }
    return {
        liveId,
        apiKey,
        clientVersion,
        continuation,
    };
}
/** get_live_chat レスポンスを変換 */
export function parseChatData(data) {
    let chatItems = [];
    if (data.continuationContents.liveChatContinuation.actions) {
        chatItems = data.continuationContents.liveChatContinuation.actions
            .map((v) => parseActionToChatItem(v))
            .filter((v) => v !== null);
    }
    const continuationData = data.continuationContents.liveChatContinuation.continuations[0];
    let continuation = "";
    if (continuationData.invalidationContinuationData) {
        continuation = continuationData.invalidationContinuationData.continuation;
    }
    else if (continuationData.timedContinuationData) {
        continuation = continuationData.timedContinuationData.continuation;
    }
    return [chatItems, continuation];
}
/** サムネイルオブジェクトをImageItemへ変換 */
function parseThumbnailToImageItem(data, alt) {
    const thumbnail = data.pop();
    if (thumbnail) {
        return {
            url: thumbnail.url,
            alt: alt,
        };
    }
    else {
        return {
            url: "",
            alt: "",
        };
    }
}
function convertColorToHex6(colorNum) {
    return `#${colorNum.toString(16).slice(2).toLocaleUpperCase()}`;
}
function convertColorToRGBA(colorNum) {
    const hexNum = colorNum.toString(16).match(/.{2}/g);
    if (hexNum && hexNum.length === 4) {
        const argb = hexNum.map((num) => parseInt(num, 16));
        const rgba = [...argb.slice(1), argb[0] / 255];
        return `rgba(${rgba.join(", ")})`;
    }
    return "rgba(0, 0, 0, 1)";
}
/** メッセージrun配列をMessageItem配列へ変換 */
function parseMessages(runs) {
    if (!Array.isArray(runs)) {
        return [];
    }
    return runs.map((run) => {
        if ("text" in run) {
            return run;
        }
        else {
            // Emoji
            const thumbnail = run.emoji.image.thumbnails.shift();
            const isCustomEmoji = Boolean(run.emoji.isCustomEmoji);
            // 稀にshortcutsが存在しないものがある
            let shortcut = run.emoji.emojiId;
            if (run.emoji.shortcuts && run.emoji.shortcuts[0]) {
                shortcut = run.emoji.shortcuts[0];
            }
            // const shortcut = run.emoji.shortcuts[0];
            return {
                url: thumbnail ? thumbnail.url : "",
                alt: shortcut,
                isCustomEmoji: isCustomEmoji,
                emojiText: isCustomEmoji ? shortcut : run.emoji.emojiId,
            };
        }
    });
}
/** actionの種類を判別してRendererを返す */
function rendererFromAction(action) {
    if (!action.addChatItemAction) {
        return null;
    }
    const item = action.addChatItemAction.item;
    if (item.liveChatTextMessageRenderer) {
        return item.liveChatTextMessageRenderer;
    }
    else if (item.liveChatPaidMessageRenderer) {
        return item.liveChatPaidMessageRenderer;
    }
    else if (item.liveChatPaidStickerRenderer) {
        return item.liveChatPaidStickerRenderer;
    }
    else if (item.liveChatMembershipItemRenderer) {
        return item.liveChatMembershipItemRenderer;
    }
    else if (item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer) {
        const parentRenderer = item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer;
        return {
            id: parentRenderer.id,
            timestampUsec: parentRenderer.timestampUsec,
            authorExternalChannelId: parentRenderer.authorExternalChannelId,
            ...parentRenderer.header.liveChatSponsorshipsHeaderRenderer
        };
    }
    return null;
}
/** an action to a ChatItem */
function parseActionToChatItem(data) {
    const messageRenderer = rendererFromAction(data);
    if (messageRenderer === null) {
        return null;
    }
    let message = [];
    if ("message" in messageRenderer) {
        message = messageRenderer.message.runs;
    }
    // メンバー系のメッセージは別で出すのでコメントアウト
    /* else if ("headerSubtext" in messageRenderer) {
      message = messageRenderer.headerSubtext.runs
    }*/
    const authorNameText = messageRenderer.authorName?.simpleText ?? "";
    const ret = {
        id: messageRenderer.id,
        author: {
            name: authorNameText,
            thumbnail: parseThumbnailToImageItem(messageRenderer.authorPhoto.thumbnails, authorNameText),
            channelId: messageRenderer.authorExternalChannelId,
        },
        message: parseMessages(message),
        isMembership: false,
        isOwner: false,
        isVerified: false,
        isModerator: false,
        timestamp: new Date(Number(messageRenderer.timestampUsec) / 1000),
    };
    if (messageRenderer.authorBadges) {
        for (const entry of messageRenderer.authorBadges) {
            const badge = entry.liveChatAuthorBadgeRenderer;
            if (badge.customThumbnail) {
                ret.author.badge = {
                    thumbnail: parseThumbnailToImageItem(badge.customThumbnail.thumbnails, badge.tooltip),
                    label: badge.tooltip,
                };
                ret.isMembership = true;
            }
            else {
                switch (badge.icon?.iconType) {
                    case "OWNER":
                        ret.isOwner = true;
                        break;
                    case "VERIFIED":
                        ret.isVerified = true;
                        break;
                    case "MODERATOR":
                        ret.isModerator = true;
                        break;
                }
            }
        }
    }
    if ("sticker" in messageRenderer) {
        ret.superchat = {
            amount: messageRenderer.purchaseAmountText.simpleText,
            color: convertColorToHex6(messageRenderer.backgroundColor),
            sticker: parseThumbnailToImageItem(messageRenderer.sticker.thumbnails, messageRenderer.sticker.accessibility.accessibilityData.label),
            colorList: {}
        };
        try {
            ret.superchat.colorList.moneyChipBackgroundColor
                = convertColorToRGBA(messageRenderer.moneyChipBackgroundColor);
            ret.superchat.colorList.moneyChipTextColor
                = convertColorToRGBA(messageRenderer.moneyChipTextColor);
            ret.superchat.colorList.authorNameTextColor
                = convertColorToRGBA(messageRenderer.authorNameTextColor);
            ret.superchat.colorList.backgroundColor
                = convertColorToRGBA(messageRenderer.backgroundColor);
        }
        catch (err) {
            console.error(err);
        }
    }
    else if ("purchaseAmountText" in messageRenderer) {
        ret.superchat = {
            amount: messageRenderer.purchaseAmountText.simpleText,
            color: convertColorToHex6(messageRenderer.bodyBackgroundColor),
            colorList: {}
        };
        try {
            ret.superchat.colorList.headerBackgroundColor
                = convertColorToRGBA(messageRenderer.headerBackgroundColor);
            ret.superchat.colorList.headerTextColor
                = convertColorToRGBA(messageRenderer.headerTextColor);
            ret.superchat.colorList.bodyBackgroundColor
                = convertColorToRGBA(messageRenderer.bodyBackgroundColor);
            ret.superchat.colorList.bodyTextColor
                = convertColorToRGBA(messageRenderer.bodyTextColor);
            ret.superchat.colorList.authorNameTextColor
                = convertColorToRGBA(messageRenderer.authorNameTextColor);
        }
        catch (err) {
            console.error(err);
        }
    }
    else if ("headerSubtext" in messageRenderer) {
        // メンバー登録など
        let text = [];
        let subText;
        if (messageRenderer.headerSubtext.runs) {
            // 新規メンバーはこっち
            text = parseMessages(messageRenderer.headerSubtext.runs);
        }
        else if (messageRenderer.headerSubtext.simpleText) {
            // 継続メンバーはこっち
            subText = messageRenderer.headerSubtext.simpleText;
        }
        // 継続メンバーの本文
        if (messageRenderer.headerPrimaryText) {
            text = parseMessages(messageRenderer.headerPrimaryText.runs);
        }
        ret.membership = {
            text: text
        };
        if (subText)
            ret.membership.subText = subText;
    }
    else if (data.addChatItemAction?.item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer
        && "primaryText" in messageRenderer
        && messageRenderer.primaryText.runs) {
        ret.membershipGift = {
            message: parseMessages(messageRenderer.primaryText.runs),
        };
        if (messageRenderer.image?.thumbnails?.[0]) {
            ret.membershipGift.image = {
                ...messageRenderer.image.thumbnails[0],
                alt: ""
            };
        }
    }
    return ret;
}
export function parseMetadata(data) {
    let continuation = "";
    if (data.continuation.timedContinuationData) {
        continuation = data.continuation.timedContinuationData.continuation;
    }
    const res = {};
    for (const action of data.actions) {
        // タイトル
        if (action.updateTitleAction) {
            const a = action.updateTitleAction;
            res.title = "";
            for (const run of a.title.runs) {
                if (run.text)
                    res.title += run.text;
            }
        }
        // 概要欄
        if (action.updateDescriptionAction) {
            const a = action.updateDescriptionAction;
            res.description = "";
            for (const run of a.description.runs) {
                if (run.text)
                    res.description += run.text;
            }
        }
        // n分前に配信開始
        if (action.updateDateTextAction) {
            const a = action.updateDateTextAction;
            res.dateText = a.dateText.simpleText;
        }
        // 視聴者数
        if (action.updateViewershipAction) {
            const a = action.updateViewershipAction;
            const rawCount = a.viewCount.videoViewCountRenderer.viewCount.simpleText;
            const count = rawCount.replace(/,/g, "").match(/[0-9]+/);
            if (count && count[0]) {
                res.viewership = parseInt(count[0]);
            }
            else {
                res.viewership = a.viewCount.videoViewCountRenderer.extraShortViewCount.simpleText;
            }
        }
        // いいね数
        if (action.updateToggleButtonTextAction) {
            const a = action.updateToggleButtonTextAction;
            if (a.buttonId === "TOGGLE_BUTTON_ID_TYPE_LIKE") {
                res.like = Number.parseInt(a.defaultText.simpleText);
            }
        }
    }
    return [res, continuation];
}
//# sourceMappingURL=parser.js.map