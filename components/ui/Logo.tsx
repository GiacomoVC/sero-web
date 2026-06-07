import Image from 'next/image';

// sero logo nu.png is 1280×720
const RATIO = 1280 / 720;

export function Logo({
  width = 220,
  className = '',
  priority = false,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/sero logo nu.png"
      alt="Sero"
      width={width}
      height={Math.round(width / RATIO)}
      className={`block mx-auto ${className}`}
      priority={priority}
    />
  );
}
