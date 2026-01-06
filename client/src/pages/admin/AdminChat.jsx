import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChats,
  fetchChatByUser,
  sendAdminMessage,
  deleteUserChat, // ✅ ADD
} from "@/store/chat-slice";
import { Trash2 } from "lucide-react"; // ✅ ADD

export default function AdminChat() {
  const dispatch = useDispatch();
  const { chats = [], messages = [] } = useSelector((state) => state.chat);

  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  /* 🔄 Poll chats list */
  useEffect(() => {
    dispatch(fetchChats());
    const interval = setInterval(() => {
      dispatch(fetchChats());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  /* 🔽 Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100">

      {/* LEFT: USER LIST */}
      <div className="w-72 bg-white border-r overflow-y-auto">
        <div className="p-4 font-semibold border-b">Chats</div>

        {chats.map((c) => {
          const unreadCount = c.messages?.filter(
            (m) => m.senderRole === "user"
          ).length;

          return (
            <div
              key={c.userId._id}
              onClick={() => {
                setSelectedUser(c.userId);
                dispatch(fetchChatByUser(c.userId._id));
              }}
              className={`p-3 cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                selectedUser?._id === c.userId._id ? "bg-gray-100" : ""
              }`}
            >
              <span className="font-medium">{c.userId.userName}</span>

              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-white">

        {/* HEADER */}
        <div className="px-4 py-3 border-b font-semibold bg-[#1877f2] text-white flex justify-between items-center">
          <span>{selectedUser ? selectedUser.userName : "Select a chat"}</span>

          {/* ✅ DELETE CHAT BUTTON (OPTION A) */}
          {selectedUser && (
            <button
              onClick={() => {
                if (!window.confirm("Delete this chat permanently?")) return;

                dispatch(deleteUserChat(selectedUser._id)).then(() => {
                  setSelectedUser(null);
                  dispatch(fetchChats());
                });
              }}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              <Trash2 size={14} />
              Delete Chat
            </button>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.senderRole === "admin" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                  m.senderRole === "admin"
                    ? "bg-[#1877f2] text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {m.message}
                <div className="text-[10px] mt-1 opacity-70 text-right">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="text-sm text-gray-500 italic">
              Admin is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div className="border-t p-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTyping(true);
                setTimeout(() => setTyping(false), 1000);
              }}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
            />
            <button
              onClick={() => {
                if (!text.trim()) return;

                dispatch(
                  sendAdminMessage({
                    userId: selectedUser._id,
                    message: text,
                  })
                ).then(() => {
                  dispatch(fetchChatByUser(selectedUser._id));
                });

                setText("");
              }}
              className="bg-[#1877f2] text-white px-5 py-2 rounded-full hover:bg-[#166fe5]"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
