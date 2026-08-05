import { createContext, useContext, type ReactNode } from "react";
import { ANNOUNCEMENT_MESSAGES } from "@/config/nav";

type Props = { messages?: readonly string[] };

const AnnouncementMessagesContext = createContext<readonly string[] | undefined>(undefined);

export function AnnouncementMessagesProvider({
  messages,
  children,
}: {
  messages?: readonly string[];
  children: ReactNode;
}) {
  return (
    <AnnouncementMessagesContext.Provider value={messages}>
      {children}
    </AnnouncementMessagesContext.Provider>
  );
}

function Sequence({ messages, duplicate }: { messages: readonly string[]; duplicate?: boolean }) {
  return (
    <ul aria-hidden={duplicate || undefined} className="flex shrink-0 items-center gap-8">
      {messages.map((message) => (
        <li
          key={(duplicate ? "dup-" : "") + message}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          <span>{message}</span>
          <span aria-hidden className="text-[color:var(--color-gold)]">
            •
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementBar({ messages }: Props) {
  const contextMessages = useContext(AnnouncementMessagesContext);
  const list = messages ?? contextMessages ?? ANNOUNCEMENT_MESSAGES;
  if (list.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Annonces"
      className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
    >
      <div className="announce-mask relative flex min-h-8 items-center py-1.5 text-[11px] font-medium tracking-[0.08em] md:hidden">
        <div className="announce-track flex w-max gap-8 pl-4">
          <Sequence messages={list} />
          <Sequence messages={list} duplicate />
        </div>
      </div>
      <div className="container-page hidden min-h-8 items-center justify-center py-1.5 md:flex">
        <div className="announce-fader relative h-4 w-full max-w-2xl overflow-hidden text-center text-xs font-medium tracking-[0.08em]">
          {list.map((message, index) => (
            <span
              key={message}
              className="announce-slide absolute inset-0 flex items-center justify-center"
              style={{
                animationDuration: list.length * 4 + "s",
                animationDelay: index * 4 + "s",
              }}
            >
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
