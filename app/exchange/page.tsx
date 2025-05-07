"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDownUp, ChevronDown, CreditCard, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavigationBar from "@/components/navigation-bar"

// Типы для данных курсов валют
interface ExchangeRates {
  [key: string]: {
    [key: string]: number
  }
}

// Маппинг ID криптовалют для API CoinGecko
const COIN_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin", // Исправлено с "binance-coin" на "binancecoin"
  XRP: "ripple",
}

export default function ExchangePage() {
  const [fromAmount, setFromAmount] = useState("1000.00")
  const [toAmount, setToAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BTC")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rates, setRates] = useState<ExchangeRates>({})

  // Список поддерживаемых криптовалют
  const cryptoCurrencies = [
    { value: "BTC", label: "Bitcoin" },
    { value: "ETH", label: "Ethereum" },
    { value: "USDT", label: "Tether" },
    { value: "BNB", label: "Binance Coin" },
    { value: "XRP", label: "Ripple" },
  ]

  // Список поддерживаемых фиатных валют
  const fiatCurrencies = [
    { value: "USD", label: "US Dollar" },
    { value: "EUR", label: "Euro" },
    { value: "RUB", label: "Russian Ruble" },
  ]

  // Получение курсов валют при загрузке страницы
  useEffect(() => {
    fetchExchangeRates()
  }, [])

  // Обновление суммы при изменении входных данных
  useEffect(() => {
    if (!loading && Object.keys(rates).length > 0) {
      calculateExchange(fromAmount, fromCurrency, toCurrency)
    }
  }, [fromCurrency, toCurrency, rates, loading])

  // Функция для получения курсов валют
  const fetchExchangeRates = async () => {
    setLoading(true)
    setError(null)

    try {
      // Формируем список ID криптовалют для запроса
      const coinIds = Object.values(COIN_IDS).join(",")

      // Получаем курсы криптовалют в USD, EUR и RUB
      const cryptoResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd,eur,rub`,
      )

      if (!cryptoResponse.ok) {
        throw new Error(`Ошибка API: ${cryptoResponse.status} ${cryptoResponse.statusText}`)
      }

      const cryptoData = await cryptoResponse.json()
      console.log("API Response:", cryptoData)

      // Проверяем, что получили данные для всех валют
      const missingCoins = Object.values(COIN_IDS).filter((id) => !cryptoData[id])
      if (missingCoins.length > 0) {
        console.warn(`Отсутствуют данные для следующих монет: ${missingCoins.join(", ")}`)
      }

      // Создаем объект с курсами обмена с проверкой наличия данных
      const exchangeRates: ExchangeRates = {
        USD: {},
        EUR: {},
        RUB: {},
      }

      // Заполняем курсы для фиатных валют
      fiatCurrencies.forEach((fiat) => {
        const fiatCode = fiat.value.toLowerCase()

        // Для каждой криптовалюты
        cryptoCurrencies.forEach((crypto) => {
          const coinId = COIN_IDS[crypto.value as keyof typeof COIN_IDS]

          // Проверяем, есть ли данные для этой монеты и валюты
          if (cryptoData[coinId] && cryptoData[coinId][fiatCode] && cryptoData[coinId][fiatCode] > 0) {
            exchangeRates[fiat.value][crypto.value] = 1 / cryptoData[coinId][fiatCode]
          } else {
            // Используем фиксированные значения в случае отсутствия данных
            console.warn(`Нет данных для ${coinId}/${fiatCode}, используем резервные значения`)

            // Резервные значения (приблизительные)
            const fallbackRates: Record<string, Record<string, number>> = {
              USD: { BTC: 0.000033, ETH: 0.00045, USDT: 1, BNB: 0.0033, XRP: 1.5 },
              EUR: { BTC: 0.000031, ETH: 0.00042, USDT: 0.93, BNB: 0.0031, XRP: 1.4 },
              RUB: { BTC: 0.0000003, ETH: 0.000004, USDT: 0.009, BNB: 0.00003, XRP: 0.014 },
            }

            exchangeRates[fiat.value][crypto.value] = fallbackRates[fiat.value][crypto.value] || 0
          }
        })
      })

      // Добавляем обратные курсы (крипто -> фиат)
      cryptoCurrencies.forEach((crypto) => {
        exchangeRates[crypto.value] = {}

        fiatCurrencies.forEach((fiat) => {
          if (
            exchangeRates[fiat.value] &&
            exchangeRates[fiat.value][crypto.value] &&
            exchangeRates[fiat.value][crypto.value] > 0
          ) {
            exchangeRates[crypto.value][fiat.value] = 1 / exchangeRates[fiat.value][crypto.value]
          } else {
            // Резервные значения для обратных курсов
            const fallbackReverseRates: Record<string, Record<string, number>> = {
              BTC: { USD: 30000, EUR: 28000, RUB: 2800000 },
              ETH: { USD: 2200, EUR: 2050, RUB: 205000 },
              USDT: { USD: 1, EUR: 0.93, RUB: 93 },
              BNB: { USD: 300, EUR: 280, RUB: 28000 },
              XRP: { USD: 0.65, EUR: 0.61, RUB: 61 },
            }

            exchangeRates[crypto.value][fiat.value] = fallbackReverseRates[crypto.value][fiat.value] || 0
          }
        })
      })

      console.log("Processed Exchange Rates:", exchangeRates)
      setRates(exchangeRates)

      // Рассчитываем начальную сумму обмена
      calculateExchange(fromAmount, fromCurrency, toCurrency, exchangeRates)
    } catch (err) {
      console.error("Ошибка при получении курсов валют:", err)
      setError("Не удалось загрузить актуальные курсы валют. Используются приблизительные значения.")

      // Создаем резервные курсы обмена
      const fallbackRates: ExchangeRates = {
        USD: { BTC: 0.000033, ETH: 0.00045, USDT: 1, BNB: 0.0033, XRP: 1.5 },
        EUR: { BTC: 0.000031, ETH: 0.00042, USDT: 0.93, BNB: 0.0031, XRP: 1.4 },
        RUB: { BTC: 0.0000003, ETH: 0.000004, USDT: 0.009, BNB: 0.00003, XRP: 0.014 },
        BTC: { USD: 30000, EUR: 28000, RUB: 2800000 },
        ETH: { USD: 2200, EUR: 2050, RUB: 205000 },
        USDT: { USD: 1, EUR: 0.93, RUB: 93 },
        BNB: { USD: 300, EUR: 280, RUB: 28000 },
        XRP: { USD: 0.65, EUR: 0.61, RUB: 61 },
      }

      setRates(fallbackRates)
      calculateExchange(fromAmount, fromCurrency, toCurrency, fallbackRates)
    } finally {
      setLoading(false)
    }
  }

  // Функция для расчета обмена
  const calculateExchange = (amount: string, from: string, to: string, currentRates = rates) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToAmount("")
      return
    }

    try {
      if (currentRates[from] && currentRates[from][to]) {
        const rate = currentRates[from][to]
        const result = Number(amount) * rate

        // Форматируем результат в зависимости от валюты
        if (to === "BTC") {
          setToAmount(result.toFixed(8))
        } else if (to === "ETH" || to === "BNB") {
          setToAmount(result.toFixed(6))
        } else if (to === "XRP" || to === "USDT") {
          setToAmount(result.toFixed(4))
        } else {
          setToAmount(result.toFixed(2))
        }
      } else {
        setToAmount("Курс недоступен")
      }
    } catch (err) {
      console.error("Ошибка при расчете обмена:", err)
      setToAmount("Ошибка расчета")
    }
  }

  // Обработчик изменения суммы
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromAmount(value)
    calculateExchange(value, fromCurrency, toCurrency)
  }

  // Обработчик изменения валюты отправления
  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value)
    calculateExchange(fromAmount, value, toCurrency)
  }

  // Обработчик изменения валюты получения
  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value)
    calculateExchange(fromAmount, fromCurrency, value)
  }

  // Функция для обмена валют местами
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    // Пересчитываем сумму в обратном направлении
    if (rates[toCurrency] && rates[toCurrency][fromCurrency]) {
      const newFromAmount = toAmount
      setFromAmount(newFromAmount)
      calculateExchange(newFromAmount, toCurrency, fromCurrency)
    }
  }

  // Функция для обновления курсов
  const handleRefreshRates = () => {
    fetchExchangeRates()
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <NavigationBar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Palm Tree */}
          <Image src="/palm.jpg" alt="Palm tree" width={400} height={1600} className="object-contain" />

          {/* Center - Exchange Widget */}
          <div className="w-full md:w-2/4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              {/* Заголовок с кнопкой обновления */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-700">Обмен валют</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshRates}
                  disabled={loading}
                  className="text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Обновить курсы"}
                </Button>
              </div>

              {/* Сообщение об ошибке */}
              {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

              {/* Tabs */}
              <Tabs defaultValue="buy" className="mb-6">
                <div className="flex items-center justify-between border-b mb-6">
                  <TabsList className="bg-transparent p-0">
                    <TabsTrigger
                      value="buy"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-black data-[state=inactive]:text-gray-500 rounded-none bg-transparent px-4 py-2"
                    >
                      Купить Крипто
                    </TabsTrigger>
                    <TabsTrigger
                      value="sell"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-black data-[state=inactive]:text-gray-500 rounded-none bg-transparent px-4 py-2"
                    >
                      Продать
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div className="text-gray-400">•</div>
                    <div className="text-gray-400">=</div>
                  </div>
                </div>

                <TabsContent value="buy" className="mt-0">
                  {/* You Pay */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">Вы платите</div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <Input
                        type="text"
                        value={fromAmount}
                        onChange={handleFromAmountChange}
                        className="border-0 text-right flex-1"
                        disabled={loading}
                      />
                      <Select value={fromCurrency} onValueChange={handleFromCurrencyChange} disabled={loading}>
                        <SelectTrigger className="w-24 border-0 border-l border-gray-200 rounded-none">
                          <SelectValue placeholder="USD" />
                        </SelectTrigger>
                        <SelectContent>
                          {fiatCurrencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* You Receive */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">Вы получите</div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <Input
                        type="text"
                        value={loading ? "Загрузка..." : toAmount}
                        readOnly
                        className="border-0 text-right flex-1"
                      />
                      <Select value={toCurrency} onValueChange={handleToCurrencyChange} disabled={loading}>
                        <SelectTrigger className="w-24 border-0 border-l border-gray-200 rounded-none">
                          <SelectValue placeholder="BTC" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoCurrencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center -mt-3 mb-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-8 w-8 border-gray-300"
                      onClick={handleSwapCurrencies}
                      disabled={loading}
                    >
                      <ArrowDownUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Transaction Summary */}
                  <div className="bg-gray-50 p-3 rounded-md mb-6">
                    <div className="flex justify-between text-sm">
                      <div>Ваша покупка</div>
                      <div className="font-medium">
                        {loading ? "Загрузка..." : `${toAmount} ${toCurrency} за ${fromAmount} ${fromCurrency}`}{" "}
                        <ChevronDown className="h-4 w-4 inline" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Комиссия сервиса: 3% ({(Number(fromAmount) * 0.03).toFixed(2)} {fromCurrency}) • Время обработки: ~5 мин
                    </div>
                  </div>

                  {/* Buy Button */}
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6"
                    disabled={loading || !!error || !toAmount}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Купить сейчас
                  </Button>

                  {/* Payment Methods */}
                  <div className="mt-4">
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                        VISA
                      </div>
                      <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs">
                        MC
                      </div>
                      <div className="w-10 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs">
                        UP
                      </div>
                      <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs">
                        MIR
                      </div>
                      <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
                        BTC
                      </div>
                    </div>
                    <div className="text-xs text-center text-gray-500">Powered by SmartChange</div>
                  </div>
                </TabsContent>

                <TabsContent value="sell" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">Продажа криптовалюты</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Конвертируйте ваши криптоактивы в фиатные деньги быстро и безопасно.
                    </p>
                    <Button className="bg-lime-400 hover:bg-lime-500 text-green-800">Скоро будет доступно</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Информация о курсах */}
            {!loading && (
              <div className="mt-6 max-w-md mx-auto bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Текущие курсы обмена:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {cryptoCurrencies.slice(0, 4).map((crypto) => (
                    <div key={crypto.value} className="flex justify-between">
                      <span>1 {crypto.value} =</span>
                      <span className="font-medium">
                        {rates[crypto.value] && rates[crypto.value][fromCurrency]
                          ? rates[crypto.value][fromCurrency].toFixed(2)
                          : "N/A"}{" "}
                        {fromCurrency}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Курсы обновлены: {new Date().toLocaleTimeString()}
                  {error ? " (приблизительные значения)" : ""}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Floating Money */}
          <div className="hidden md:block md:w-1/4">
            <div className="relative h-[400px]">
              <div className="absolute top-20 right-20 animate-float">
                <Image src="/money.jpg" alt="Dollar bill" width={120} height={60} className="object-contain" />
              </div>
              <div className="absolute top-60 right-40 animate-float-delayed">
                <Image src="/money.jpg" alt="Dollar bill" width={120} height={60} className="object-contain" />
              </div>
              <div className="absolute top-100 right-10 animate-float-more-delayed">
                <Image src="/money.jpg" alt="Dollar bill" width={120} height={60} className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <Link href="#" className="hover:text-green-700">
            Пользовательское соглашение
          </Link>
          <Link href="#" className="hover:text-green-700">
            Политика конфиденциальности
          </Link>
          <Link href="#" className="hover:text-green-700">
            Помощь
          </Link>
          <Link href="#" className="hover:text-green-700">
            Русский
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
