// ============================================================
// useNotifications.js — React Native Socket.io Notification Hook
// Usage: const { notifications, unreadCount, markRead } = useNotifications();
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

const NOTIFY_SERVER = process.env.EXPO_PUBLIC_NOTIFY_URL || "http://localhost:4001";

export function useNotifications(authToken) {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  // ── Animation triggers by type ──────────────────────────────
  const triggerFeedback = useCallback((type) => {
    const heavy = ["badge_earned", "trophy_granted", "auction_won", "tribute_received"];
    const medium = ["marketplace_sold", "nft_minted", "sub_form_submitted"];
    if (heavy.includes(type)) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (medium.includes(type)) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ── Toast renderer by type ──────────────────────────────────
  const showToast = useCallback((payload) => {
    const toastMap = {
      badge_earned:       { type: "success", text1: "🥇 Badge Unlocked!", text2: payload.data?.badgeName },
      trophy_granted:     { type: "success", text1: "🎖 Trophy Awarded!", text2: payload.data?.trophyName },
      auction_won:        { type: "success", text1: "🏆 Auction Won!", text2: `Token #${payload.data?.tokenId}` },
      tribute_received:   { type: "success", text1: "💰 Tribute Received!", text2: `$${payload.data?.amount} from ${payload.data?.fromUsername}` },
      marketplace_sold:   { type: "info",    text1: "🛒 NFT Sold!", text2: `${payload.data?.price} MATIC` },
      auction_outbid:     { type: "error",   text1: "⚠️ You've Been Outbid", text2: `New bid: ${payload.data?.newAmount} MATIC` },
      new_message:        { type: "info",    text1: "💬 New Message", text2: payload.data?.fromUsername },
      chat_unlocked:      { type: "info",    text1: "🔓 Chat Unlocked", text2: payload.data?.mistressName },
      login_streak:       { type: "success", text1: "🔥 Streak!", text2: `${payload.data?.days} day streak maintained` },
      sub_form_submitted: { type: "info",    text1: "📋 New Sub Form", text2: payload.data?.subUsername },
    };
    const t = toastMap[payload.type] || { type: "info", text1: "Notification", text2: "" };
    Toast.show({ ...t, visibilityTime: 4000, position: "top" });
  }, []);

  // ── Connect & wire events ───────────────────────────────────
  useEffect(() => {
    if (!authToken) return;

    const socket = io(NOTIFY_SERVER, {
      auth: { token: authToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("[Notify] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Single notification
    socket.on("notification", (payload) => {
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((c) => c + 1);
      showToast(payload);
      triggerFeedback(payload.type);
    });

    // Batch (queued offline notifications)
    socket.on("notification_batch", (batch) => {
      setNotifications((prev) => [...batch.reverse(), ...prev]);
      setUnreadCount((c) => c + batch.length);
      if (batch.length > 0) {
        Toast.show({
          type: "info",
          text1: `📬 ${batch.length} notifications while you were away`,
          visibilityTime: 3000,
        });
      }
    });

    // Admin broadcast
    socket.on("broadcast", (payload) => {
      Toast.show({
        type: "info",
        text1: "📢 " + payload.title,
        text2: payload.message,
        visibilityTime: 6000,
      });
      setNotifications((prev) => [{ ...payload, type: "broadcast" }, ...prev]);
    });

    return () => socket.disconnect();
  }, [authToken, showToast, triggerFeedback]);

  // ── Actions ─────────────────────────────────────────────────
  const markRead = useCallback((notificationId) => {
    socketRef.current?.emit("mark_read", { notificationId });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(() => {
    socketRef.current?.emit("mark_all_read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, connected, markRead, markAllRead };
}
