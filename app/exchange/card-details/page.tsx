"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import { CreditCard, Plus, Check } from "lucide-react"

interface Card {
  id: string
  number: string
  expiry: string
  cvv: string
  type: "visa" | "mastercard"
}

export default function CardDetailsPage() {
  const router = useRouter()
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [error, setError] = useState("")
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    type: "visa" as const
  })
  const [cardErrors, setCardErrors] = useState({
    number: "",
    expiry: "",
    cvv: ""
  })

  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "")
    if (cleaned.length !== 16) {
      return "Номер карты должен содержать 16 цифр"
    }
    // Луна алгоритм для проверки номера карты
    let sum = 0
    let isEven = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0 ? "" : "Неверный номер карты"
  }

  const validateExpiry = (expiry: string) => {
    if (!expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      return "Укажите дату в формате ММ/ГГ"
    }
    const [month, year] = expiry.split("/")
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
    const now = new Date()
    if (expDate < now) {
      return "Карта просрочена"
    }
    return ""
  }

  const validateCVV = (cvv: string) => {
    if (!cvv.match(/^[0-9]{3,4}$/)) {
      return "CVV должен содержать 3 или 4 цифры"
    }
    return ""
  }

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "")
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(" ") : cleaned
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleAddCard = () => {
    // Валидация всех полей
    const numberError = validateCardNumber(newCard.number)
    const expiryError = validateExpiry(newCard.expiry)
    const cvvError = validateCVV(newCard.cvv)

    setCardErrors({
      number: numberError,
      expiry: expiryError,
      cvv: cvvError
    })

    if (!numberError && !expiryError && !cvvError) {
      const cardType = newCard.number.startsWith("4") ? "visa" : "mastercard"
      const newCardData: Card = {
        id: Date.now().toString(),
        ...newCard,
        type: cardType,
        number: newCard.number.slice(-4).padStart(16, "*")
      }
      setCards([...cards, newCardData])
      setSelectedCardId(newCardData.id)
      setShowAddCard(false)
      setNewCard({ number: "", expiry: "", cvv: "", type: "visa" })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cryptoAddress) {
      setError("Пожалуйста, укажите адрес кошелька")
      return
    }
    if (!selectedCardId) {
      setError("Пожалуйста, выберите или добавьте карту")
      return
    }
    router.push("/exchange/receipt")
  }

  return (
    <main className="min-h-screen bg-white">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-6">Детали платежа</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-2">
                  Адрес криптовалютного кошелька
                </label>
                <Input
                  type="text"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Введите адрес кошелька"
                  className="w-full"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700">Выберите карту для оплаты</h3>
                
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCardId === card.id ? "border-green-500 bg-green-50" : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-6 ${card.type === "visa" ? "bg-blue-600" : "bg-red-500"} rounded flex items-center justify-center text-white text-xs`}>
                        {card.type === "visa" ? "VISA" : "MC"}
                      </div>
                      <span className="text-sm">**** {card.number.slice(-4)}</span>
                    </div>
                    {selectedCardId === card.id && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}

                {!showAddCard ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setShowAddCard(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Добавить новую карту
                  </Button>
                ) : (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Новая карта
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Номер карты
                        </label>
                        <Input
                          type="text"
                          value={formatCardNumber(newCard.number)}
                          onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, "") })}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                        {cardErrors.number && (
                          <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Срок действия
                          </label>
                          <Input
                            type="text"
                            value={newCard.expiry}
                            onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                            placeholder="ММ/ГГ"
                            maxLength={5}
                          />
                          {cardErrors.expiry && (
                            <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            CVV
                          </label>
                          <Input
                            type="password"
                            value={newCard.cvv}
                            onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "") })}
                            placeholder="***"
                            maxLength={4}
                          />
                          {cardErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowAddCard(false)
                            setNewCard({ number: "", expiry: "", cvv: "", type: "visa" })
                            setCardErrors({ number: "", expiry: "", cvv: "" })
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={handleAddCard}
                        >
                          Добавить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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