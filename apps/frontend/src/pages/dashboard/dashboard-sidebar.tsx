import {
  Home,
  Store,
  ShoppingBag,
  Users,
  Truck,
  BarChart3,
  MapPin,
  Star,
  CreditCard,
  Settings,
  Search,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sidebarItems = [
  { icon: Home, label: "Overview", active: true },
  { icon: Store, label: "Restaurants", badge: "1,234" },
  { icon: ShoppingBag, label: "Orders", badge: "89" },
  { icon: Users, label: "Users", badge: "12.5K" },
  { icon: Truck, label: "Delivery Partners", badge: "456" },
  { icon: Search, label: "Search & Discovery" },
  { icon: MapPin, label: "Real-time Tracking" },
  { icon: Star, label: "Reviews & Ratings" },
  { icon: CreditCard, label: "Payments" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Clock, label: "Order History" },
  { icon: Settings, label: "Settings" },
]

export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-4">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-10"
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="outline" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
