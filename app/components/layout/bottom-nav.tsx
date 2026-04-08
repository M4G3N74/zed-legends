'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  UserIcon,
  HelpCircleIcon,
} from '../icons';
import { cn } from '../ui';

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/search', icon: SearchIcon, label: 'Search' },
  { href: '/library', icon: LibraryIcon, label: 'Library' },
  { href: '/support', icon: HelpCircleIcon, label: 'Support' },
  { href: '/profile', icon: UserIcon, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || (href === '/' && pathname === '/');

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors',
                isActive ? 'text-accent' : 'text-muted hover:text-text'
              )}
            >
              <Icon size={24} />
              <span className="text-2xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
