export function Leaf({ size = 24, light = false }: { size?: number; light?: boolean }) {
  const stroke = light ? "#F5F0E4" : "#4F5C3B";
  const secondaryFill = light ? "#F5F0E4" : "#6E7F52";
  const secondaryOpacity = light ? 0.9 : 1;

  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path
        d="M15 28 C15 20 15 12 15 4"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M15 14 C15 14 8 12 6 6 C13 6 15 14 15 14 Z" fill="#B5652E" />
      <path
        d="M15 14 C15 14 22 12 24 6 C17 6 15 14 15 14 Z"
        fill={secondaryFill}
        opacity={secondaryOpacity}
      />
    </svg>
  );
}

export function Wordmark({ light = false, size = "text-lg" }: { light?: boolean; size?: string }) {
  return (
    <div className={`font-serif font-semibold ${size}`}>
      <span className={light ? "text-cream" : "text-olive"}>Re</span>
      <span className={light ? "text-cream" : "text-sage-dark"}>Surge</span>
    </div>
  );
}

export function BrandMark({
  light = false,
  size = 22,
  wordmarkSize = "text-lg",
}: {
  light?: boolean;
  size?: number;
  wordmarkSize?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Leaf size={size} light={light} />
      <Wordmark light={light} size={wordmarkSize} />
    </div>
  );
}
