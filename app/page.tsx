import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"

export default function Home() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-green-700 mb-6">Начнём!</h1>
            <p className="text-xl mb-8">
              Вход в кошелек для новых
              и зарегистрированных
              пользователей
            </p>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                id="email"
                className="w-full border-gray-300 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 px-0"
                placeholder="Enter your email to learn more"
              />
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>
                Я принимаю{" "}
                <Link href="#" className="text-green-700 font-medium">
                  Пользовательсое соглашение
                </Link>
              </span>
            </div>

            <div className="flex gap-4">
              <Link href="/exchange">
                <Button className="bg-lime-400 hover:bg-lime-500 text-green-800 font-medium rounded-full px-8 py-6 text-lg">
                  Перейти к оплате
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Rabbit Image */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Floating Money */}
            <div className="absolute top-10 right-20 animate-float z-10">
              <Image src="/money.jpg" alt="Dollar bill" width={80} height={40} className="object-contain" />
            </div>
            <div className="absolute top-40 right-10 animate-float-delayed z-10">
              <Image src="/money.jpg" alt="Dollar bill" width={80} height={40} className="object-contain" />
            </div>
            

            {/* Rabbit Character - Main Focus */}
            <div className="relative z-20 transform scale-125">
              <Image
                src="/rabbit.png"
                alt="Green rabbit character"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>

            {/* Background Landscape */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] z-0 bg-gradient-to-t from-green-50">
              <Image
                src="/land.png"
                alt="Landscape with palm trees and pagodas"
                width={1200}
                height={600}
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <Link href="#" className="hover:text-green-700">
            Terms and Conditions
          </Link>
          <Link href="#" className="hover:text-green-700">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-green-700">
            Help
          </Link>
          <Link href="#" className="hover:text-green-700">
            English
          </Link>
        </div>
      </footer>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-green-800 rounded-full flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </main>
  )
}
