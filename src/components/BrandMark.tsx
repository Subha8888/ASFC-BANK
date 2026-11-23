interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="6" fill="#DC2626" />
        <path
          d="M9 22L16 8L23 22H19.4L16 14.8L12.6 22H9Z"
          fill="#FFFFFF"
        />
        <rect x="13.5" y="18.5" width="5" height="2.2" fill="#09090B" />
      </svg>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          ASFC Bank
        </span>
      )}
    </span>
  );
}
