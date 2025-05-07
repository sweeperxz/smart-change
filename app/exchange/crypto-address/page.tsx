"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import { Wallet } from "lucide-react"

export default function CryptoAddressPage() {
  const router = useRouter()
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cryptoAddress) {
      setError("Пожалуйста, укажите адрес кошелька")
      return
    }
    // Store the address in sessionStorage for the receipt page
    sessionStorage.setItem("cryptoAddress", cryptoAddress)
    router.push("/exchange/card-details")
  }

  return (
    <main className="min-h-screen bg-white">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-6">Адрес получения</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-gray-500" />
                  <label className="block text-sm text-gray-600">
                    Укажите адрес криптовалютного кошелька для получения средств
                  </label>
                </div>
                <Input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => {
                    setCryptoAddress(e.target.value)
                    setError("")
                  }}
                  placeholder="Например: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  className="w-full font-mono"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-amber-800">
                  ⚠️ Внимательно проверьте адрес кошелька. Транзакции в блокчейне необратимы.
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Продолжить
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}