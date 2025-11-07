"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Menu,
  LogOut,
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Megaphone,
  AlertTriangle,
  Bell,
  CheckCircle,
  ClockIcon,
  Upload,
  FileText,
  Zap,
} from "lucide-react"
import { useGetVendorOnboardingTrack } from "@/api/hooks/use-user-query"
import { Navigate } from "react-router-dom"

// Mock data
const revenueData = [
  { date: "Mon", revenue: 2400, orders: 24 },
  { date: "Tue", revenue: 1398, orders: 22 },
  { date: "Wed", revenue: 9800, orders: 29 },
  { date: "Thu", revenue: 3908, orders: 20 },
  { date: "Fri", revenue: 4800, orders: 28 },
  { date: "Sat", revenue: 3800, orders: 25 },
  { date: "Sun", revenue: 4300, orders: 26 },
]

const orderStatusData = [
  { name: "Preparing", value: 12 },
  { name: "Ready", value: 8 },
  { name: "Delivering", value: 15 },
  { name: "Delivered", value: 145 },
]

const menuItems = [
  { id: 1, name: "Biryani", category: "Rice Dishes", price: 350, orders: 284, rating: 4.8 },
  { id: 2, name: "Butter Chicken", category: "Curries", price: 450, orders: 192, rating: 4.9 },
  { id: 3, name: "Samosa", category: "Appetizers", price: 80, orders: 528, rating: 4.7 },
  { id: 4, name: "Naan", category: "Breads", price: 60, orders: 412, rating: 4.8 },
  { id: 5, name: "Paneer Tikka", category: "Appetizers", price: 280, orders: 156, rating: 4.9 },
]

const activeOrders = [
  { id: "ORD-001", customer: "Sanjay Kumar", items: 3, status: "preparing", time: "5 min" },
  { id: "ORD-002", customer: "Priya Sharma", items: 2, status: "ready", time: "Ready" },
  { id: "ORD-003", customer: "Amit Patel", items: 4, status: "delivering", time: "12 min" },
]

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

export default function VendorDashboard() {
 const {data} = useGetVendorOnboardingTrack({enabled:true})

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [verificationStatus] = useState<"pending" | "verified" | "rejected">("pending")

//   const handleLogout = () => {
//     localStorage.removeItem("vendorToken")
//     router.push("/vendor/login")
//   }

 if(!data?.completed){
  return <Navigate to="/vendor-onboarding" replace />;
 }
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 fixed h-screen overflow-y-auto`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-primary">KhajaRide</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-muted rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Overview", id: "overview" },
            { icon: UtensilsCrossed, label: "Menu", id: "menu" },
            { icon: ShoppingBag, label: "Orders", id: "orders" },
            { icon: DollarSign, label: "Financials", id: "financials" },
            { icon: Clock, label: "Availability", id: "availability" },
            { icon: MapPin, label: "Profile", id: "profile" },
            { icon: Star, label: "Reviews", id: "reviews" },
            { icon: Megaphone, label: "Promotions", id: "promotions" },
            { icon: AlertTriangle, label: "Compliance", id: "compliance" },
            { icon: Bell, label: "Notifications", id: "notifications" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300`}>
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your restaurant overview</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Settings
              </Button>
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">SR</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Verification Alert */}
          {verificationStatus !== "verified" && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Your account is pending verification. Upload required documents to activate your restaurant.{" "}
                <button className="underline font-semibold">Upload now</button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Today's Revenue</p>
                      <p className="text-3xl font-bold text-primary">₹24,580</p>
                      <p className="text-xs text-green-600">↑ 12% from yesterday</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-bold text-primary">180</p>
                      <p className="text-xs text-green-600">↑ 8% from yesterday</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-3xl font-bold text-primary">₹340</p>
                      <p className="text-xs text-red-600">↓ 2% from yesterday</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-3xl font-bold text-primary">4.8</p>
                      <p className="text-xs text-muted-foreground">Based on 245 reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>Manage your restaurant's menu and items</CardDescription>
                  </div>
                  <Button>Add Item</Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-semibold">Item Name</th>
                          <th className="text-left p-3 font-semibold">Category</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Orders</th>
                          <th className="text-left p-3 font-semibold">Rating</th>
                          <th className="text-left p-3 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuItems.map((item) => (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-3">{item.name}</td>
                            <td className="p-3">{item.category}</td>
                            <td className="p-3">₹{item.price}</td>
                            <td className="p-3">{item.orders}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {item.rating}
                              </div>
                            </td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Orders</CardTitle>
                  <CardDescription>Real-time order management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.items} items</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${
                          order.status === "preparing"
                            ? "bg-blue-500/20 text-blue-600"
                            : order.status === "ready"
                              ? "bg-green-500/20 text-green-600"
                              : "bg-purple-500/20 text-purple-600"
                        }`}
                      >
                        {order.status === "preparing" && <Zap className="w-3 h-3 mr-1" />}
                        {order.status === "ready" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {order.status === "delivering" && <ClockIcon className="w-3 h-3 mr-1" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="ml-4 text-sm font-medium">{order.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="var(--color-primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                  <CardDescription>Document submission and verification progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div>
                      <p className="font-semibold">Account Status</p>
                      <p className="text-sm text-muted-foreground">Pending Verification</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                      Pending
                    </Badge>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3">
                    <p className="font-semibold">Required Documents</p>
                    {[
                      { name: "Business License", status: "pending", icon: FileText },
                      { name: "Tax Registration", status: "pending", icon: FileText },
                      { name: "Stripe Account", status: "pending", icon: DollarSign },
                    ].map((doc, idx) => {
                      const Icon = doc.icon
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.status}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { type: "order", message: "New order #ORD-245 received", time: "2 min ago" },
                    { type: "system", message: "Your verification documents are under review", time: "1 hour ago" },
                    { type: "payout", message: "Payout of ₹15,240 processed successfully", time: "3 hours ago" },
                  ].map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
