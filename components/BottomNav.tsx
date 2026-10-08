'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const items = [
    {
      label: 'Today',
      href: '/dashboard',
      icon: '⌂',
    },
    {
      label: 'Add',
      href: '/food',
      icon: '+',
    },
    {
      label: 'Progress',
      href: '/progress',
      icon: '◔',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: '⚙',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">

      <div className="mx-auto flex max-w-3xl items-center justify-around">

        {items.map((item) => {
          const active =
            pathname === item.href ||
            (
              item.href !== '/dashboard' &&
              pathname.startsWith(item.href)
            )

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium ${
                active
                  ? 'text-black'
                  : 'text-gray-400'
              }`}
            >

              <span className="text-xl leading-none">
                {item.icon}
              </span>

              <span className="mt-1">
                {item.label}
              </span>

            </Link>
          )
        })}

      </div>

    </nav>
  )
}