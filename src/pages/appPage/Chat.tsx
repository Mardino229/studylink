import { useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import { Image as ImageIcon, Send, Bot, User as UserIcon } from "lucide-react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", role: "assistant", content: "Salut ! Je suis ton copain d'étude IA. Pose ta question ou envoie une image d'un exercice." }
  ]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [typing, setTyping] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() && !imageFile) return;
    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
    scrollToBottom();

    // Mock step-by-step answer
    setTyping(true);
    const steps = [
      "Je réfléchis à ta question…",
      "Étape 1: Clarifions l'énoncé.",
      "Étape 2: Identifions les formules/approches.",
      "Étape 3: Application et résultat (exemple).",
    ];
    let acc = "";
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      acc += (i > 0 ? "\n" : "") + steps[i];
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.id.startsWith("a-temp")) {
          // update temporary assistant message
          const updated = prev.slice(0, -1).concat([{ ...last, content: acc }]);
          return updated;
        }
        return [...prev, { id: `a-temp-${Date.now()}`, role: "assistant", content: acc }];
      });
      scrollToBottom();
    }
    setTyping(false);
  }

  return (
    <>
      <PageMeta title="Copain d'étude IA" description="Discutez avec l'assistant et envoyez des images d'exercices" />
      <PageBreadcrumb pageTitle="Copain d'étude IA" />

      <div className="grid grid-rows-[1fr_auto] h-[calc(100dvh-180px)] p-4 rounded-xl border border-border bg-card">
        {/* messages */}
        <div className="overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-sm text-foreground/70">
                <div className="mx-auto mb-3 size-10 rounded-full bg-foreground/10 flex items-center justify-center"><Bot className="size-5"/></div>
                Posez une question ou téléversez une image d'exercice pour commencer.
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="mt-1 shrink-0 size-7 rounded-full bg-foreground/10 flex items-center justify-center">
                    <Bot className="size-4" />
                  </div>
                )}
                <div className={`${m.role === "user" ? "bg-foreground text-background" : "bg-background text-foreground"} max-w-[78%] rounded-2xl px-4 py-3 border border-border shadow-xs whitespace-pre-wrap`}> 
                  {m.imageUrl && (
                    <div className="mb-2">
                      <img src={m.imageUrl} alt="uploaded" className="max-h-64 rounded-md border border-border" />
                    </div>
                  )}
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 shrink-0 size-7 rounded-full bg-foreground/10 flex items-center justify-center">
                    <UserIcon className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex justify-start items-center gap-2">
                <div className="mt-1 shrink-0 size-7 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Bot className="size-4" />
                </div>
                <div className="bg-background text-foreground border border-border rounded-2xl px-4 py-3 shadow-xs">
                  <span className="inline-flex gap-1 items-center">
                    <span className="size-2 rounded-full bg-foreground/70 animate-bounce [animation-delay:0ms]"></span>
                    <span className="size-2 rounded-full bg-foreground/70 animate-bounce [animation-delay:150ms]"></span>
                    <span className="size-2 rounded-full bg-foreground/70 animate-bounce [animation-delay:300ms]"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* composer sticky */}
        <form onSubmit={handleSend} className="mt-4 sticky bottom-0 left-0 right-0">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-sm">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 hover:bg-card/80"
              title="Téléverser une image"
            >
              <ImageIcon className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              className="flex-1 rounded-md border border-transparent bg-transparent px-3 py-2 focus:outline-none"
            />
            <button type="submit" className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90">
              <Send className="size-4" />
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
