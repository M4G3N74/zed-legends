interface AlbumArtProps {
  title?: string;
  artist?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function AlbumArt({
  title,
  artist,
  size = 'md',
  className = '',
  rounded = 'md',
}: AlbumArtProps) {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 28,
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-xl',
  };

  const colors = [
    'from-rose-500/30 to-pink-500/20',
    'from-violet-500/30 to-purple-500/20',
    'from-blue-500/30 to-cyan-500/20',
    'from-emerald-500/30 to-teal-500/20',
    'from-amber-500/30 to-orange-500/20',
    'from-red-500/30 to-rose-500/20',
  ];

  const colorIndex = title
    ? title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length
    : 0;

  return (
    <div
      className={`
        ${sizes[size]} 
        ${roundedClasses[rounded]}
        bg-gradient-to-br ${colors[colorIndex]}
        flex items-center justify-center 
        overflow-hidden
        shadow-lg
        ${className}
      `}
    >
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white/60"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  );
}

export function AlbumArtPlaceholder({
  size = 'md',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return <AlbumArt size={size} className={className} />;
}
