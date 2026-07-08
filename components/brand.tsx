export function Leaf({ size = 24, light = false }: { size?: number; light?: boolean }) {
  const stemColor = light ? "#F5F0E4" : "#5C4E33";
  const sageColor = light ? "#F5F0E4" : "#6E7F52";
  const sageOpacity = light ? 0.9 : 1;
  const width = Math.round(size * 0.62);

  return (
    <svg width={width} height={size} viewBox="0 0 21 34" fill="none" aria-hidden="true">
      {/* tallo curvo */}
      <path
        d="M10.5 33 C9.3 26.5 8 21 9.6 15 C11 10.2 11.4 7.3 11.4 5.2"
        stroke={stemColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* hoja terracota, arriba a la izquierda */}
      <path d="M11.4 5.2 C9.4 3 6 1.2 2 1 C3.3 4.6 6.6 6.9 11.4 5.2 Z" fill="#B5652E" />
      {/* hoja salvia, arriba a la derecha */}
      <path
        d="M11.4 5.2 C13.2 2.9 16.5 1 20 1.2 C18.9 4.9 15.4 7.1 11.4 5.2 Z"
        fill={sageColor}
        opacity={sageOpacity}
      />
      {/* hoja salvia inferior, a la izquierda del tallo */}
      <path
        d="M9.7 17.5 C7.6 16 4.6 15 1.3 15.4 C2.6 18.5 5.9 20 9.7 17.5 Z"
        fill={sageColor}
        opacity={sageOpacity}
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
