import Image from 'next/image';

const RATIO = 2; // logo.png is 1440x720

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
      src="/logo.png"
      alt="Sero"
      width={width}
      height={Math.round(width / RATIO)}
      className={`block mx-auto ${className}`}
      priority={priority}
    />
  );
}
