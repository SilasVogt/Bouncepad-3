import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Providers } from "../lib/providers";

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0a0a0a",
          },
          headerTintColor: "#ededed",
          contentStyle: {
            backgroundColor: "#0a0a0a",
          },
        }}
      />
    </Providers>
  );
}
