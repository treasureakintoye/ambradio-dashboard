"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Globe, MapPin } from "lucide-react"

const generateGeographicData = () => {
  return [
    { country: "United States", listeners: 1247, percentage: 42.3, flag: "🇺🇸" },
    { country: "United Kingdom", listeners: 687, percentage: 23.4, flag: "🇬🇧" },
    { country: "Canada", listeners: 423, percentage: 14.4, flag: "🇨🇦" },
    { country: "Australia", listeners: 298, percentage: 10.1, flag: "🇦🇺" },
    { country: "Germany", listeners: 156, percentage: 5.3, flag: "🇩🇪" },
    { country: "France", listeners: 89, percentage: 3.0, flag: "🇫🇷" },
    { country: "Netherlands", listeners: 45, percentage: 1.5, flag: "🇳🇱" },
  ]
}

const generateCityData = () => {
  return [
    { city: "New York", country: "US", listeners: 234 },
    { city: "London", country: "UK", listeners: 198 },
    { city: "Los Angeles", country: "US", listeners: 167 },
    { city: "Toronto", country: "CA", listeners: 143 },
    { city: "Sydney", country: "AU", listeners: 121 },
    { city: "Chicago", country: "US", listeners: 98 },
    { city: "Berlin", country: "DE", listeners: 87 },
    { city: "Paris", country: "FR", listeners: 76 },
  ]
}

export function GeographicStats() {
  const countryData = generateGeographicData()
  const cityData = generateCityData()
  const totalListeners = countryData.reduce((sum, country) => sum + country.listeners, 0)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Listeners by Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryData.map((country, index) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-medium text-sm">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{country.listeners.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                  </div>
                </div>
                <Progress value={country.percentage} className="h-2" />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Listeners</span>
              <span className="font-medium">{totalListeners.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cityData.map((city, index) => (
              <div key={`${city.city}-${city.country}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{city.city}</div>
                    <div className="text-xs text-muted-foreground">{city.country}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">{city.listeners}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{cityData.length}</div>
              <div className="text-sm text-muted-foreground">Cities Represented</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
