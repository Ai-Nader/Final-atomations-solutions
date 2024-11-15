"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter, useSearchParams } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      router.push("/success")
    }
  }, [sessionId, router])

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const stripe = await stripePromise

      if (!stripe) throw new Error("Stripe failed to load")

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            templateId: `${item.template.id}-${item.tier}`,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      const { sessionId } = await response.json()
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error("Error:", error)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container max-w-6xl py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            {items.map((item) => (
              <div
                key={`${item.template.id}-${item.tier}`}
                className="flex gap-4 py-4 border-b last:border-0"
              >
                <div className="relative aspect-square h-20 overflow-hidden rounded-lg flex-shrink-0">
                  <Image
                    src={item.template.image}
                    alt={item.template.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.template.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {item.tier} Version
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm">Qty: {item.quantity}</p>
                    <p className="font-medium">${item.price}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-4">
              <div className="flex justify-between text-base">
                <p>Subtotal</p>
                <p>${total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <p>Tax</p>
                <p>Calculated at checkout</p>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-4 border-t">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Payment</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You will be redirected to Stripe to complete your purchase securely.
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </Button>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p>By completing this purchase you agree to our terms of service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}</content>
<boltAction type="file" filePath="app/checkout/layout.tsx">import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout - AI Template Hub",
  description: "Complete your purchase of premium automation templates.",
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}