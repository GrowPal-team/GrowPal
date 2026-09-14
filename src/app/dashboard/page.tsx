"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MyPlantExperience } from "@/components/my-plant/my-plant-experience"
import { Droplets, Wind, Thermometer, Leaf, TrendingUp, TrendingDown } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const waterData = [
  { month: "Jan", liters: 120 },
  { month: "Feb", liters: 110 },
  { month: "Mar", liters: 95 },
  { month: "Apr", liters: 85 },
  { month: "May", liters: 78 },
  { month: "Jun", liters: 72 },
]

const co2Data = [
  { month: "Jan", kg: 2.1 },
  { month: "Feb", kg: 2.8 },
  { month: "Mar", kg: 3.5 },
  { month: "Apr", kg: 4.2 },
  { month: "May", kg: 5.0 },
  { month: "Jun", kg: 5.6 },
]

const metrics = [
  {
    title: "Water Consumption",
    value: "72L",
    change: "-12%",
    trend: "down" as const,
    icon: Droplets,
    description: "This month vs. last month",
  },
  {
    title: "CO2 Absorbed",
    value: "5.6kg",
    change: "+18%",
    trend: "up" as const,
    icon: Wind,
    description: "Total this month",
  },
  {
    title: "Heat Reduction",
    value: "3.2°C",
    change: "+0.5°C",
    trend: "up" as const,
    icon: Thermometer,
    description: "Average cooling effect",
  },
  {
    title: "Eco Score",
    value: "87/100",
    change: "+4",
    trend: "up" as const,
    icon: Leaf,
    description: "Overall sustainability score",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user")
      if (!stored) {
        router.push("/login?next=/dashboard")
        return
      }
      try {
        const u = JSON.parse(stored) as { role?: string }
        const r = String(u.role || "").toLowerCase()
        if (r === "expert") {
          router.replace("/expert")
          return
        }
        if (r === "admin") {
          router.replace("/admin")
          return
        }
        setReady(true)
      } catch {
        router.push("/login?next=/dashboard")
      }
    }
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0f6b3c] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f3ecdf]">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Your Green Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your environmental impact and sustainability metrics.
          </p>

          <div className="mt-8">
            <MyPlantExperience compact />
          </div>

          {/* Metric Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.title}
                className="flex flex-col rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${metric.trend === "up" ? "text-primary" : "text-primary"}`}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <span className="mt-3 text-2xl font-bold text-foreground">{metric.value}</span>
                <span className="text-sm font-medium text-foreground">{metric.title}</span>
                <span className="mt-1 text-xs text-muted-foreground">{metric.description}</span>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Water Consumption Trend</h3>
              <p className="mt-1 text-sm text-muted-foreground">Monthly water usage in liters</p>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={waterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 90)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 150)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 150)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f8f1e6",
                        border: "1px solid #e4d5c1",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="liters"
                      stroke="oklch(0.45 0.12 150)"
                      fill="oklch(0.45 0.12 150)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">CO2 Absorption Growth</h3>
              <p className="mt-1 text-sm text-muted-foreground">Monthly CO2 absorbed in kilograms</p>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={co2Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 90)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 150)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 150)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f8f1e6",
                        border: "1px solid #e4d5c1",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="kg"
                      fill="oklch(0.45 0.12 150)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
