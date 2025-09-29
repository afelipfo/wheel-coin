"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, MapPin } from "lucide-react"

interface TaxRate {
  country_code: string
  country_name: string
  state_code?: string
  state_name?: string
  tax_rate: number
  tax_type: "vat" | "gst" | "sales_tax" | "none"
}

interface TaxCalculatorProps {
  subtotal: number
  onTaxCalculated: (taxAmount: number, total: number) => void
}

export function TaxCalculator({ subtotal, onTaxCalculated }: TaxCalculatorProps) {
  const [selectedCountry, setSelectedCountry] = useState("US")
  const [selectedState, setSelectedState] = useState("")
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTaxRates() {
      try {
        // Mock tax rates - in production, this would come from a tax service API
        const mockTaxRates: TaxRate[] = [
          {
            country_code: "US",
            country_name: "United States",
            state_code: "CA",
            state_name: "California",
            tax_rate: 0.0875,
            tax_type: "sales_tax",
          },
          {
            country_code: "US",
            country_name: "United States",
            state_code: "NY",
            state_name: "New York",
            tax_rate: 0.08,
            tax_type: "sales_tax",
          },
          {
            country_code: "US",
            country_name: "United States",
            state_code: "TX",
            state_name: "Texas",
            tax_rate: 0.0625,
            tax_type: "sales_tax",
          },
          {
            country_code: "US",
            country_name: "United States",
            state_code: "FL",
            state_name: "Florida",
            tax_rate: 0.06,
            tax_type: "sales_tax",
          },
          { country_code: "GB", country_name: "United Kingdom", tax_rate: 0.2, tax_type: "vat" },
          { country_code: "DE", country_name: "Germany", tax_rate: 0.19, tax_type: "vat" },
          { country_code: "FR", country_name: "France", tax_rate: 0.2, tax_type: "vat" },
          { country_code: "CA", country_name: "Canada", tax_rate: 0.13, tax_type: "gst" },
          { country_code: "AU", country_name: "Australia", tax_rate: 0.1, tax_type: "gst" },
          { country_code: "JP", country_name: "Japan", tax_rate: 0.1, tax_type: "sales_tax" },
        ]

        setTaxRates(mockTaxRates)
      } catch (error) {
        console.error("Error fetching tax rates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxRates()
  }, [])

  useEffect(() => {
    // Calculate tax when country/state changes
    const applicableTaxRate = taxRates.find((rate) => {
      if (selectedCountry === "US") {
        return rate.country_code === selectedCountry && rate.state_code === selectedState
      }
      return rate.country_code === selectedCountry
    })

    const taxAmount = applicableTaxRate ? subtotal * applicableTaxRate.tax_rate : 0
    const total = subtotal + taxAmount

    onTaxCalculated(taxAmount, total)
  }, [selectedCountry, selectedState, subtotal, taxRates, onTaxCalculated])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  const countries = Array.from(new Set(taxRates.map((rate) => rate.country_code))).map(
    (code) => taxRates.find((rate) => rate.country_code === code)!,
  )

  const states = taxRates.filter((rate) => rate.country_code === selectedCountry && rate.state_code)

  const applicableTaxRate = taxRates.find((rate) => {
    if (selectedCountry === "US") {
      return rate.country_code === selectedCountry && rate.state_code === selectedState
    }
    return rate.country_code === selectedCountry
  })

  const taxAmount = applicableTaxRate ? subtotal * applicableTaxRate.tax_rate : 0
  const total = subtotal + taxAmount

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case "vat":
        return "VAT"
      case "gst":
        return "GST"
      case "sales_tax":
        return "Sales Tax"
      default:
        return "Tax"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Tax Calculation
        </CardTitle>
        <CardDescription>Automatic tax calculation based on your location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.country_code} value={country.country_code}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {country.country_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCountry === "US" && states.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.state_code} value={state.state_code!}>
                      {state.state_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {applicableTaxRate && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getTaxTypeLabel(applicableTaxRate.tax_type)}</span>
                <Badge variant="outline" className="text-xs">
                  {(applicableTaxRate.tax_rate * 100).toFixed(2)}%
                </Badge>
              </div>
              <span className="font-medium">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {!applicableTaxRate && selectedCountry && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No tax applicable for selected location</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
