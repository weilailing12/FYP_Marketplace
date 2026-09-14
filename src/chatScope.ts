export interface ChatScopedMessage {
  chat_type?: string | null;
  item_id?: string | null;
}

export function isMarketplaceMessage(message: ChatScopedMessage) {
  return message.chat_type !== "lostfound";
}

export function isLostFoundMessage(message: ChatScopedMessage, itemId?: string | null) {
  return message.chat_type === "lostfound" && (!itemId || message.item_id === itemId);
}
