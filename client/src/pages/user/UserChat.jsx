import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMessages, sendUserMessage } from "@/store/chat-slice";
import { Check, CheckCheck } from "lucide-react";

export default function UserChat() {
  const dispatch = useDispatch();
  const { messages = [] } = useSelector((state) => state.chat);

  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUserMessages());

    const interval = setInterval(() => {
      dispatch(fetchUserMessages());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  /* 🔽 Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🧠 Last admin reply index (for seen tick) */
  const lastAdminIndex = [...messages]
    .reverse()
    .findIndex((m) => m.senderRole === "admin");

  return (
    <div className="flex justify-center items-center w-full h-[calc(100vh-80px)] bg-gray-100">
      <div className="w-full max-w-4xl h-full bg-white shadow-lg rounded-lg flex flex-col">

        {/* HEADER */}
        <div className="px-4 py-3 border-b bg-[#1877f2] text-white font-semibold flex justify-between">
          <span>Chat with Admin</span>
          {typing && (
            <span className="text-sm italic opacity-80">
              typing…
            </span>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              Start a conversation with admin
            </p>
          )}

          {messages.map((m, i) => {
            const isUser = m.senderRole === "user";
            const isSeen =
              isUser && lastAdminIndex !== -1 && i < messages.length - lastAdminIndex;

            return (
              <div
                key={i}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg text-sm relative ${
                    isUser
                      ? "bg-[#1877f2] text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {m.message}

                  {/* TIMESTAMP */}
                  <div className="text-[10px] mt-1 opacity-70 text-right">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>

                  {/* SENT / SEEN TICK */}
                  {isUser && (
                    <div className="absolute -bottom-4 right-1 text-blue-600">
                      {isSeen ? (
                        <CheckCheck size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t p-3 flex gap-2 bg-white">
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

              dispatch(sendUserMessage(text)).then(() => {
                dispatch(fetchUserMessages());
              });

              setText("");
            }}
            className="bg-[#1877f2] text-white px-5 py-2 rounded-full hover:bg-[#166fe5] transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
