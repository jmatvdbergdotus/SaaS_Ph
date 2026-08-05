import { computeStockStatus } from "@sari-saas/core";
import { supabase } from "./supabase";

type DashboardAuthState = "ready" | "unauthenticated" | "needs_onboarding";

export interface DashboardStats {
  authState: DashboardAuthState;
  storeName: string | null;
  todayRevenue: number;
  pendingPaymentCount: number;
  lowStockCount: number;
}

export async function loadDashboardStats(): Promise<DashboardStats> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return emptyStats("unauthenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("store_id")
    .eq("id", userResult.user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.store_id) {
    return emptyStats("needs_onboarding");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [storeResult, paidOrdersResult, pendingOrdersResult, inventoryResult] = await Promise.all([
    supabase
      .from("stores")
      .select("name")
      .eq("id", profile.store_id)
      .single(),
    supabase
      .from("orders")
      .select("status,total_amount,created_at")
      .eq("store_id", profile.store_id)
      .eq("status", "PAID")
      .gte("created_at", todayStart.toISOString())
      .lt("created_at", tomorrowStart.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", profile.store_id)
      .eq("status", "PENDING_PAYMENT"),
    supabase
      .from("inventory")
      .select("current_stock,restock_threshold")
      .eq("store_id", profile.store_id),
  ]);

  if (storeResult.error) throw storeResult.error;
  if (paidOrdersResult.error) throw paidOrdersResult.error;
  if (pendingOrdersResult.error) throw pendingOrdersResult.error;
  if (inventoryResult.error) throw inventoryResult.error;

  const paidOrders = paidOrdersResult.data ?? [];
  const inventory = inventoryResult.data ?? [];

  return {
    authState: "ready",
    storeName: storeResult.data.name,
    todayRevenue: paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    pendingPaymentCount: pendingOrdersResult.count ?? 0,
    lowStockCount: inventory.filter((item) => {
      const status = computeStockStatus(item.current_stock, item.restock_threshold);
      return status === "CRITICAL" || status === "RESTOCK_SOON";
    }).length,
  };
}

function emptyStats(authState: DashboardAuthState): DashboardStats {
  return {
    authState,
    storeName: null,
    todayRevenue: 0,
    pendingPaymentCount: 0,
    lowStockCount: 0,
  };
}
