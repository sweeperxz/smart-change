"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation-bar"
import { ArrowRight, Check, CreditCard, Upload, Wallet } from "lucide-react"

interface ExchangeDetails {
  fromAmount: string
  toAmount: string
  fromCurrency: string
  toCurrency: string
  email: string
  rate: number
}

export default function ReceiptPage() {
  const router = useRouter()
  const [comment, setComment] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails | null>(null)
  const [cryptoAddress, setCryptoAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Get exchange details from sessionStorage
    const details = sessionStorage.getItem("exchangeDetails")
    const address = sessionStorage.getItem("cryptoAddress")
    
    if (!details || !address) {
      router.push("/exchange")
      return
    }

    setExchangeDetails(JSON.parse(details))
    setCryptoAddress(address)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Пожалуйста, прикрепите чек")
      return
    }

    setLoading(true)
    try {
      // Here would be the API call to send the receipt
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      setSuccess(true)
      // Clear session storage after successful submission
      sessionStorage.removeItem("exchangeDetails")
      sessionStorage.removeItem("cryptoAddress")
    } catch (err) {
      setError("Ошибка при отправке чека. Пожалуйста, попробуйте снова.")
    } finally {
      setLoading(false)
    }
  }

  if (!exchangeDetails) {
    return null // Will redirect in useEffect
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white">
        <NavigationBar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Чек успешно отправлен!</h2>
            <p className="text-gray-600 mb-8">
              Наш оператор проверит платеж и выполнит обмен в течение нескольких минут.
              Результат будет отправлен на ваш email.
            </p>
            <Button
              onClick={() => router.push("/exchange")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Вернуться на главную
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-6">Подтверждение платежа</h2>
            
            {/* Transaction Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Детали обмена</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Сумма отправления:</span>
                  <span className="font-medium">{exchangeDetails.fromAmount} {exchangeDetails.fromCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Сумма получения:</span>
                  <span className="font-medium">{exchangeDetails.toAmount} {exchangeDetails.toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Курс обмена:</span>
                  <span className="font-medium">
                    1 {exchangeDetails.fromCurrency} = {exchangeDetails.rate.toFixed(8)} {exchangeDetails.toCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{exchangeDetails.email}</span>
                </div>
              </div>
            </div>

            {/* Crypto Address */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Адрес получения</h3>
              </div>
              <div className="font-mono text-sm bg-white p-2 rounded border border-blue-100 break-all">
                {cryptoAddress}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Комментарий (необязательно)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Дополнительная информация..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Прикрепить чек оплаты
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null)
                      setError("")
                    }}
                    accept="image/*,.pdf"
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label 
                    htmlFor="receipt-upload" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="text-gray-500 text-center">
                      {file ? (
                        <>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs">Нажмите чтобы заменить</div>
                        </>
                      ) : (
                        <>
                          <div>Перетащите файл сюда или нажмите для загрузки</div>
                          <div className="text-xs">PNG, JPG или PDF до 10MB</div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Отправка..." : "Отправить оператору"}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                После отправки чека оператор проверит платеж и выполнит обмен
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}