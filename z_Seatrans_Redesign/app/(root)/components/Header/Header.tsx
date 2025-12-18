"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, Ship, User, LogOut, ChevronRight, AlertTriangle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"

import NavMenu from './NavMenu'
import { menuData } from './menuData'
import { UserNav } from './UserNav'
import { useAuth } from '@/features/auth/context/AuthContext'

export default function Header() {
  const { user, isAuthenticated, logout, profileComplete } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigate = (path: string) => {
    setMobileOpen(false)
    router.push(path)
  }

  // Flatten menu for mobile view
  const flattenMenu = () => {
    const items: any[] = []
    menuData.forEach((item) => {
      if (item.subMenu && item.subMenu.length > 0) {
        items.push({ ...item, isParent: true })
        item.subMenu.forEach((child) => {
          items.push({ ...child, isChild: true })
        })
      } else {
        items.push(item)
      }
    })
    return items
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background h-16 transition-all duration-300",
        isScrolled ? "shadow-md border-border" : "shadow-none border-transparent"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        {/* LEFT: Logo & Desktop Menu */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="bg-primary/10 p-1.5 rounded-lg transition-colors group-hover:bg-primary/20">
              <Ship className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-xl">Seatrans</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavMenu menu={menuData} />
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* User Authentication */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {!profileComplete && (
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700">
                    <AlertTriangle className="w-3 h-3" />
                    Complete profile
                  </Badge>
                )}
                <UserNav user={user} onLogout={logout} />
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex text-sm"
                  onClick={() => handleNavigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="hover-lift text-sm"
                  onClick={() => handleNavigate('/signup')}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Ship className="h-6 w-6 text-primary" />
                  Seatrans
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full">
                {/* Mobile Links */}
                <div className="flex flex-col space-y-1">
                  {flattenMenu().map((item) => {
                    if (item.isParent) {
                      return (
                        <div
                          key={item.id}
                          className="px-2 py-2 text-sm font-semibold text-muted-foreground"
                        >
                          {item.title}
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.path ?? "#"}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-2 py-3 text-sm font-medium rounded-md transition-colors hover:bg-accent",
                          item.isChild && "pl-6",
                          pathname === item.path
                            ? "bg-accent text-primary"
                            : "text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                          {item.title}
                        </span>
                        {!item.isChild && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Footer Actions */}
                {isAuthenticated && user ? (
                  <div className="mt-auto pt-4 border-t pb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user.fullName || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                      {!profileComplete && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-amber-200 text-amber-700"
                          onClick={() => handleNavigate('/dashboard')}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Update profile
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => {
                          logout()
                          setMobileOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t pb-8 grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleNavigate('/login')}>
                      Log in
                    </Button>
                    <Button onClick={() => handleNavigate('/signup')}>
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
