"use client";

import { cn } from "@/lib/utils";
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

const COPIED_RESET_MS = 1600;
const ACTION_STAGGER_MS = 30;


export type AIMessageAuthor = "user" | "assistant";

export type AIMessageProps = {
  /** Rendered to the side of the bubble — an avatar or an orb. */
  avatar?: ReactNode;
  /**
   * Draw the tinted bubble. Turn it off for assistant turns that carry their own
   * surfaces — reasoning traces, tool calls, diffs — where a bubble around a
   * stack of cards reads as a box inside a box.
   */
  bubble?: boolean;
  bubbleClassName?: string;
  children: ReactNode;
  className?: string;
  /** Plain text handed to the clipboard. Omit to hide the copy action. */
  copyText?: string;
  /**
   * Who wrote it. Named `from` rather than `role` on purpose: `role` is an ARIA
   * attribute, and a component prop of that name misleads both readers and
   * accessibility linters.
   */
  from?: AIMessageAuthor;
  onRetry?: () => void;
  onVote?: (vote: "up" | "down") => void;
  /** Preformatted timestamp, e.g. "14:32". */
  timestamp?: string;
};

/**
 * A chat message with actions that stay out of the way.
 *
 * The action row slides out of the bubble's own edge rather than fading in from
 * nowhere, so it reads as belonging to that message. It is revealed on hover and
 * on focus-within, because a hover-only control row is unreachable by keyboard.
 */
export const AIMessage = ({
  avatar,
  bubble = true,
  bubbleClassName,
  children,
  className,
  copyText,
  onRetry,
  onVote,
  from = "assistant",
  timestamp,
}: AIMessageProps) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const isUser = from === "user";

  useEffect(() => {
    if (!hasCopied) {
      return;
    }
    const timeout = setTimeout(() => setHasCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timeout);
  }, [hasCopied]);

  const copy = async () => {
    if (!copyText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      setHasCopied(true);
    } catch {
      // A blocked clipboard is not worth interrupting the conversation over.
    }
  };

  const actions = [
    copyText
      ? {
          active: hasCopied,
          icon: hasCopied ? Check : Copy,
          key: "copy",
          label: hasCopied ? "Copied" : "Copy",
          onClick: copy,
        }
      : null,
    onRetry
      ? {
          active: false,
          icon: RotateCcw,
          key: "retry",
          label: "Retry",
          onClick: onRetry,
        }
      : null,
    // Voting on your own message makes no sense, so the feedback pair is
    // assistant-only even when the consumer passes `onVote` for the thread.
    onVote && !isUser
      ? {
          active: vote === "up",
          icon: ThumbsUp,
          key: "up",
          label: "Good response",
          onClick: () => {
            const next = vote === "up" ? null : "up";
            setVote(next);
            if (next) onVote("up");
          },
        }
      : null,
    onVote && !isUser
      ? {
          active: vote === "down",
          icon: ThumbsDown,
          key: "down",
          label: "Bad response",
          onClick: () => {
            const next = vote === "down" ? null : "down";
            setVote(next);
            if (next) onVote("down");
          },
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <div
      className={cn(
        // The reveal is scoped to this class rather than Tailwind's `group`, so a
        // `group` ancestor elsewhere on the page cannot reveal every row at once.
        "ai-message-root flex w-full gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {avatar ? <div className="mt-0.5 shrink-0 select-none">{avatar}</div> : null}

      <div className={cn("flex min-w-0 max-w-[85%] flex-col gap-0.5", isUser && "items-end")}>
        <div
          className={cn(
            "w-fit text-xs md:text-sm leading-relaxed",
            bubble && "rounded-2xl px-3 py-2",
            bubble &&
              isUser &&
              "rounded-br-sm bg-neutral-900 text-white shadow-xs",
            bubble &&
              !isUser &&
              "rounded-bl-sm bg-neutral-100/90 border border-neutral-200/80 text-neutral-800 shadow-xs",
            !bubble && "text-foreground",
            bubbleClassName
          )}
        >
          {children}
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5 px-0.5 min-h-[22px]",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* The timestamp comes first so it stays pinned to the edge the
              bubble is anchored to — left for the assistant, right for the
              user. */}
          {timestamp ? (
            <span className="text-neutral-400 text-[10px] tabular-nums font-mono px-0.5">
              {timestamp}
            </span>
          ) : null}

          {/* Always mounted, only faded */}
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                aria-label={action.label}
                aria-pressed={action.active}
                className={cn(
                  "ai-message-action cursor-pointer rounded-md p-1 transition-colors",
                  isUser ? "ai-message-action-user" : "ai-message-action-agent",
                  action.active
                    ? "text-[#3A8293] bg-[#3A8293]/10"
                    : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                )}
                key={action.key}
                onClick={action.onClick}
                style={{ transitionDelay: `${index * ACTION_STAGGER_MS}ms` }}
                type="button"
              >
                <Icon
                  aria-hidden="true"
                  className={
                    action.key === "copy" && hasCopied
                      ? "ai-message-pop"
                      : undefined
                  }
                  key={action.key === "copy" && hasCopied ? "copied" : "idle"}
                  size={12}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
