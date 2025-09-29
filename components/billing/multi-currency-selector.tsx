"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"

interface Currency {
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_supported: boolean
}

interface MultiCurrencySelectorProps {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
  amount: number
}

export function MultiCurrencySelector({ selectedCurrency, onCurrencyChange, amount }: MultiCurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        // Mock currency data - in production, this would come from your database
        const mockCurrencies: Currency[] = [
          { code: "USD", name: "US Dollar", symbol: "$", exchange_rate: 1.0, is_supported: true },
          { code: "EUR", name: "Euro", symbol: "€", exchange_rate: 0.85, is_supported: true },
          { code: "GBP", name: "British Pound", symbol: "£", exchange_rate: 0.73, is_supported: true },
          { code: "CAD", name: "Canadian Dollar", symbol: "C$", exchange_rate: 1.25, is_supported: true },
          { code: "AUD", name: "Australian Dollar", symbol: "A$", exchange_rate: 1.35, is_supported: true },
          { code: "JPY", name: "Japanese Yen", symbol: "¥", exchange_rate: 110.0, is_supported: true },
          { code: "CHF", name: "Swiss Franc", symbol: "CHF", exchange_rate: 0.92, is_supported: true },
          { code: "SEK", name: "Swedish Krona", symbol: "kr", exchange_rate: 8.5, is_supported: true },
          { code: "NOK", name: "Norwegian Krone", symbol: "kr", exchange_rate: 8.8, is_supported: true },
          { code: "DKK", name: "Danish Krone", symbol: "kr", exchange_rate: 6.3, is_supported: true },
        ]

        setCurrencies(mockCurrencies.filter((c) => c.is_supported))
      } catch (error) {
        console.error("Error fetching currencies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrencies()
  }, [supabase])

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency)
  const convertedAmount = selectedCurrencyData ? amount * selectedCurrencyData.exchange_rate : amount

  if (loading) {
    return <div className="h-10 bg-muted rounded animate-pulse"></div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Currency</label>
        <Badge variant="outline" className="text-xs">
          {currencies.length} supported
        </Badge>
      </div>

      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.code}</span>
                  <span className="text-muted-foreground">- {currency.name}</span>
                </div>
                {currency.code !== "USD" && (
                  <span className="text-xs text-muted-foreground ml-2">{currency.exchange_rate.toFixed(2)}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCurrencyData && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Amount in {selectedCurrencyData.code}:</span>
            <span className="font-medium">
              {selectedCurrencyData.symbol}
              {selectedCurrencyData.code === "JPY"
                ? Math.round(convertedAmount).toLocaleString()
                : convertedAmount.toFixed(2)}
            </span>
          </div>
          {selectedCurrency !== "USD" && (
            <div className="text-xs mt-1">
              Exchange rate: 1 USD = {selectedCurrencyData.exchange_rate} {selectedCurrencyData.code}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
