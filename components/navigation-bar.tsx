"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="logo-container border-2 border-green-700 rounded-lg p-1">
              <div className="bg-green-700 text-white px-3 py-1 rounded-md inline-block">
                <span className="font-bold">smart</span>
              </div>
              <span className="text-green-700 font-bold text-xl px-1">CHANGE</span>
            </div>
          </Link>

         

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-green-700 font-medium transition-colors py-2"
                  >
                    Home
                  </Link>
                  <Link
                    href="/exchange"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-green-700 font-medium transition-colors py-2"
                  >
                    Exchange
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-green-700 font-medium transition-colors py-2"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-green-700 font-medium transition-colors py-2"
                  >
                    Support
                  </Link>
                  <Button
                    className="bg-lime-400 hover:bg-lime-500 text-green-800 font-medium rounded-full w-full mt-4"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
