import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { height: 60 } }}>
      <Tabs.Screen name="index"     options={{ title: "Home",      tabBarLabel: "Home" }} />
      <Tabs.Screen name="orders"    options={{ title: "Orders",    tabBarLabel: "Orders" }} />
      <Tabs.Screen name="chat"      options={{ title: "Chat",      tabBarLabel: "Chat" }} />
      <Tabs.Screen name="inventory" options={{ title: "Inventory", tabBarLabel: "Stock" }} />
    </Tabs>
  );
}
