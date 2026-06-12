// Tiny inline icon set — no icon library needed for half a dozen glyphs.

type IconProps = {
  className?: string;
  filled?: boolean;
};

export const StarIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
  </svg>
);

export const ForkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
  </svg>
);

export const BookmarkIcon = ({ className, filled }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3.5 2.75A1.25 1.25 0 0 1 4.75 1.5h6.5a1.25 1.25 0 0 1 1.25 1.25v11.5l-4.5-3-4.5 3V2.75Z" />
  </svg>
);

export const CompareIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 2v12M4 2 1.5 4.5M4 2l2.5 2.5M12 14V2m0 12 2.5-2.5M12 14l-2.5-2.5" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M3.5 3.5l9 9m0-9-9 9" />
  </svg>
);

export const PencilIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m11.5 2 2.5 2.5L5.5 13l-3.25.75L3 10.5 11.5 2Z" />
  </svg>
);

export const GitHubIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
  </svg>
);
