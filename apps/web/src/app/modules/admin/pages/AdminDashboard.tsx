import { useState } from "react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { RecentOrder, AdminUser } from "../types/admin.types";
import { Users, Package, DollarSign, Bike, LayoutGrid, Store, BarChart2, Settings, Menu, Bell, AlertTriangle, UserPlus } from "lucide-react";

// Fallback data for when API is not ready
const fallbackStats = [
  { label: "Total Users", value: "12,482", change: "+8.2%", icon: "users", color: "#6ee7b7" },
  { label: "Active Orders", value: "3,291", change: "+12.5%", icon: "orders", color: "#93c5fd" },
  { label: "Revenue Today", value: "$48,320", change: "+5.1%", icon: "revenue", color: "#fde68a" },
  { label: "Active Riders", value: "284", change: "-2.3%", icon: "riders", color: "#f9a8d4" },
];

const fallbackRecentOrders: RecentOrder[] = [
  { id: "#ORD-8821", customer: "Amara Silva", merchant: "Burger Bliss", status: "Delivered", amount: "$24.50", time: "2 min ago" },
  { id: "#ORD-8820", customer: "Nimal Perera", merchant: "Pizza Palace", status: "In Transit", amount: "$38.00", time: "5 min ago" },
  { id: "#ORD-8819", customer: "Dilani Fernando", merchant: "Sushi Stop", status: "Preparing", amount: "$52.75", time: "8 min ago" },
  { id: "#ORD-8818", customer: "Kasun Jayawardena", merchant: "Spice Route", status: "Cancelled", amount: "$17.20", time: "12 min ago" },
  { id: "#ORD-8817", customer: "Tharushi De Silva", merchant: "Green Bowl", status: "Delivered", amount: "$29.90", time: "18 min ago" },
];

const fallbackUsers: AdminUser[] = [
  { name: "Amara Silva", role: "Customer", joined: "Apr 20", orders: 14, status: "Active" },
  { name: "Ranjith Wijesinghe", role: "Merchant", joined: "Apr 18", orders: 340, status: "Active" },
  { name: "Chamara Bandara", role: "Rider", joined: "Apr 15", orders: 128, status: "Active" },
  { name: "Priya Jayasekara", role: "Customer", joined: "Apr 10", orders: 6, status: "Suspended" },
];

const statusColor: Record<string, string> = {
  Delivered: "#6ee7b7",
  "In Transit": "#93c5fd",
  Preparing: "#fde68a",
  Cancelled: "#fca5a5",
  Active: "#6ee7b7",
  Suspended: "#fca5a5",
};

const navItems = [
  { icon: LayoutGrid, label: "Overview", id: "overview" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Package, label: "Orders", id: "orders" },
  { icon: Store, label: "Merchants", id: "merchants" },
  { icon: Bike, label: "Riders", id: "riders" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export const AdminDashboard: React.FC = () => {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data, loading, error } = useAdminDashboard();

  // Use API data or fallback
  const stats = data?.stats || fallbackStats;
  const recentOrders = data?.recentOrders || fallbackRecentOrders;
  const users = data?.recentUsers || fallbackUsers;

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: "#0d0d0d",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e5e7eb"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, background: "#161616", borderRight: "1px solid #222",
        display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden",
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg,#6ee7b7,#3b82f6)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#0d0d0d", flexShrink: 0
          }}>
            <Package size={20} />
          </div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>DELIVO</span>}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #222" }}>
            <span style={{
              background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
              padding: "4px 10px", fontSize: 11, color: "#6ee7b7", fontWeight: 600, letterSpacing: 1
            }}>ADMIN</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 20px",
              background: active === item.id ? "#1f2937" : "transparent",
              borderLeft: active === item.id ? "3px solid #6ee7b7" : "3px solid transparent",
              border: "none", color: active === item.id ? "#f9fafb" : "#9ca3af",
              cursor: "pointer", fontSize: 14, fontWeight: active === item.id ? 600 : 400,
              textAlign: "left", transition: "all 0.15s"
            }}>
              <item.icon size={18} strokeWidth={active === item.id ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6ee7b7,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0
          }}>AD</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Admin User</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>admin@delivo.com</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Header */}
        <header style={{
          background: "#161616", borderBottom: "1px solid #222",
          padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: "#1f2937", border: "1px solid #374151", borderRadius: 8,
              padding: "8px", cursor: "pointer", color: "#9ca3af", display: "grid", placeItems: "center"
            }}>
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin Dashboard</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Platform overview & management</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {error && (
              <span style={{ color: "#fca5a5", fontSize: 12, marginRight: 8 }}>
                <AlertTriangle size={14} style={{ marginRight: 6 }} /> {error}
              </span>
            )}
            <button style={{
              background: "#1f2937", border: "1px solid #374151", borderRadius: 8,
              padding: "8px 14px", cursor: "pointer", color: "#9ca3af", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8
            }}>
              <Bell size={16} /> Alerts
            </button>
            <button style={{
              background: "linear-gradient(135deg,#6ee7b7,#3b82f6)", border: "none", borderRadius: 8,
              padding: "8px 16px", cursor: "pointer", color: "#0d0d0d", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8
            }}>
              <UserPlus size={16} /> Add User
            </button>
          </div>
        </header>

        <div style={{ padding: "32px", flex: 1, opacity: loading ? 0.6 : 1 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>
            {stats.map(s => (
                <div style={{
                  background: "#161616", border: "1px solid #222", borderRadius: 16, padding: "24px",
                  position: "relative", overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80,
                    background: s.color, borderRadius: "50%", opacity: 0.08
                  }} />
                  <div style={{ color: s.color, marginBottom: 12 }}>
                    {(() => {
                      const Icon = {
                        'users': Users,
                        'orders': Package,
                        'revenue': DollarSign,
                        'riders': Bike
                      }[s.icon] || LayoutGrid;
                      return <Icon size={28} />;
                    })()}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>{s.label}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: s.change.startsWith("+") ? "#6ee7b7" : "#fca5a5"
                  }}>{s.change} this week</div>
                </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
            {/* Recent Orders */}
            <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Orders</h2>
                <button style={{ background: "none", border: "1px solid #374151", borderRadius: 6, padding: "4px 12px", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>View All</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#111" }}>
                    {["Order ID", "Customer", "Merchant", "Status", "Amount", "Time"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#93c5fd" }}>{o.id}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13 }}>{o.customer}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#9ca3af" }}>{o.merchant}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          background: statusColor[o.status] + "22", color: statusColor[o.status]
                        }}>{o.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700 }}>{o.amount}</td>
                      <td style={{ padding: "14px 16px", fontSize: 11, color: "#6b7280" }}>{o.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Management */}
            <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #222" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Users</h2>
              </div>
              <div style={{ padding: "8px 0" }}>
                {users.map(u => (
                  <div key={u.name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 24px", borderBottom: "1px solid #1a1a1a"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `hsl(${u.name.charCodeAt(0) * 5},60%,35%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700
                      }}>{u.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{u.role} · {u.orders} orders</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                      background: statusColor[u.status] + "22", color: statusColor[u.status]
                    }}>{u.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 24px" }}>
                <button style={{
                  width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: 10,
                  padding: "12px", color: "#9ca3af", cursor: "pointer", fontSize: 13, fontWeight: 600
                }}>Manage All Users →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
