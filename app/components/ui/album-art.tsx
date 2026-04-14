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

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-xl',
  };

  return (
    <div
      className={`
        ${sizes[size]} 
        ${roundedClasses[rounded]}
        overflow-hidden
        shadow-lg
        ${className}
      `}
    >
      <img
        src="/images/album-art.png"
        alt={title || 'Album art'}
        className="w-full h-full object-cover"
      />
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
