import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, country, state } = await request.json()

    if (!amount || !country) {
      return NextResponse.json({ error: "Amount and country are required" }, { status: 400 })
    }

    // Mock tax rates - in production, this would integrate with a tax service like TaxJar or Avalara
    const taxRates: Record<string, { rate: number; type: string }> = {
      "US-CA": { rate: 0.0875, type: "sales_tax" },
      "US-NY": { rate: 0.08, type: "sales_tax" },
      "US-TX": { rate: 0.0625, type: "sales_tax" },
      "US-FL": { rate: 0.06, type: "sales_tax" },
      GB: { rate: 0.2, type: "vat" },
      DE: { rate: 0.19, type: "vat" },
      FR: { rate: 0.2, type: "vat" },
      CA: { rate: 0.13, type: "gst" },
      AU: { rate: 0.1, type: "gst" },
      JP: { rate: 0.1, type: "sales_tax" },
    }

    const taxKey = state ? `${country}-${state}` : country
    const taxInfo = taxRates[taxKey]

    if (!taxInfo) {
      return NextResponse.json({
        subtotal: amount,
        tax_amount: 0,
        tax_rate: 0,
        tax_type: "none",
        total: amount,
      })
    }

    const taxAmount = amount * taxInfo.rate
    const total = amount + taxAmount

    return NextResponse.json({
      subtotal: amount,
      tax_amount: taxAmount,
      tax_rate: taxInfo.rate,
      tax_type: taxInfo.type,
      total: total,
    })
  } catch (error) {
    console.error("Error calculating tax:", error)
    return NextResponse.json({ error: "Failed to calculate tax" }, { status: 500 })
  }
}
