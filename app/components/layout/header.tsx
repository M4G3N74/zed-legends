'use client';

import Link from 'next/link';
import { SearchIcon } from '../icons';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({
  title,
  showSearch = false,
  onSearchClick,
  rightContent,
  children,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 glass-subtle border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {title ? (
            <h1 className="text-lg font-semibold gradient-text truncate">
              {title}
            </h1>
          ) : (
            <Link href="/" className="text-xl font-bold gradient-text">
              Zed Legends
            </Link>
          )}
          {children}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="w-10 h-10 flex items-center justify-center rounded-full text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <SearchIcon size={20} />
            </button>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  );
}
