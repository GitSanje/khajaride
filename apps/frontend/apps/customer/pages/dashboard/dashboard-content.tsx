import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Store,
  Truck,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Activity,
  Search,
} from "lucide-react"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-balance">Dashboard Overview</h2>
          <p className="text-muted-foreground">Monitor your food delivery platform performance and operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Production</Badge>
          <Badge variant="secondary">Last 24 hours</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary mr-1" />
              +12.5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,924</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary mr-1" />
              +8.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,45,678</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary mr-1" />
              +15.3% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 min</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-primary mr-1" />
              -2.1 min from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Restaurant Management */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Restaurant Management</CardTitle>
            </div>
            <CardDescription>Manage restaurant partners, menus, and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Restaurants</span>
              <Badge variant="secondary">1,234</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Approvals</span>
              <Badge variant="outline">23</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Rating</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  4.6
                </span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              Manage Restaurants
            </Button>
          </CardContent>
        </Card>

        {/* Order Processing */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <CardTitle>Order Processing</CardTitle>
            </div>
            <CardDescription>Real-time order management and tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Orders Today</span>
              <Badge variant="secondary">2,847</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">In Progress</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">89</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span>98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              View Orders
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Network */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Delivery Network</CardTitle>
            </div>
            <CardDescription>Manage delivery partners and optimize routes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Drivers</span>
              <Badge variant="secondary">456</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Online Now</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">234</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Rating</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  4.8
                </span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              Manage Drivers
            </Button>
          </CardContent>
        </Card>

        {/* Search & Discovery */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>Search & Discovery</CardTitle>
            </div>
            <CardDescription>AI-powered search with semantic understanding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Search Queries</span>
              <Badge variant="secondary">45.2K</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversion Rate</span>
              <Badge variant="outline">34.5%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Semantic Match</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Real-time Tracking */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Real-time Tracking</CardTitle>
            </div>
            <CardDescription>Live order and delivery tracking system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Deliveries</span>
              <Badge variant="secondary">127</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ETA Accuracy</span>
              <Badge variant="outline">94%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>GPS Coverage</span>
                <span>99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              Live Map
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>Customer accounts, loyalty points, and engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Users</span>
              <Badge variant="secondary">125.4K</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Loyalty Members</span>
              <Badge variant="outline">89.2K</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Retention Rate</span>
                <span>76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <Button className="w-full bg-transparent" variant="outline">
              User Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>Latest platform activities and system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "2 min ago", action: 'New restaurant "Spice Garden" approved', type: "restaurant" },
              { time: "5 min ago", action: "Order #12847 delivered successfully", type: "order" },
              { time: "8 min ago", action: 'Delivery partner "Raj Kumar" came online', type: "driver" },
              { time: "12 min ago", action: "Payment of ₹1,245 processed", type: "payment" },
              { time: "15 min ago", action: 'User "priya.sharma" earned 50 loyalty points', type: "user" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
