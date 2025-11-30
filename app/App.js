import React from "react";
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from "@tanstack/react-query";

const API_BASE = "http://localhost:5174"; // Change to LAN IP for physical device

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000, gcTime: 5*60_000, refetchOnWindowFocus: false } }
});

async function fetchPage({ pageParam = 0 }){
  const r = await fetch(`${API_BASE}/api/sections?page=${pageParam}`);
  if (!r.ok) throw new Error("Failed to load page");
  return r.json();
}
async function fetchSection({ kind, index }){
  const r = await fetch(`${API_BASE}/api/section?kind=${encodeURIComponent(kind)}&index=${index}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

function Hero({ data, index }){
  return (
    <View style={styles.section}>
      <Image source={{ uri: data?.image }} style={{ width: "100%", height: 200 }} />
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection:"row", alignItems:"center" }}>
          <Text style={styles.badge}>#{index}</Text>
          <Text style={{ color:"#9aa4b2", marginLeft: 8 }}>HERO</Text>
        </View>
        <Text style={styles.h2}>{data?.title || "Loading…"}</Text>
        <Text style={styles.muted}>{data?.text || "Fetching…"}</Text>
      </View>
    </View>
  );
}
function Quote({ data, index }){
  return (
    <View style={[styles.section, { padding: 16, borderLeftWidth: 4, borderLeftColor: "#22d3ee" }]}>
      <Text style={{ fontStyle: "italic", fontSize: 18 }}>“{data?.text || "Loading…"}”</Text>
      <Text style={[styles.muted, { marginTop: 8 }]}>— QUOTE · #{index}</Text>
    </View>
  );
}
function Card({ data, index }){
  return (
    <View style={[styles.section, { padding: 12, flexDirection: "row" }]}>
      <Image source={{ uri: data?.image }} style={{ width: 120, height: 120, borderRadius: 12, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection:"row", alignItems:"center" }}>
          <Text style={styles.badge}>#{index}</Text>
          <Text style={{ color:"#9aa4b2", marginLeft: 8 }}>CARD</Text>
        </View>
        <Text style={styles.h3}>{data?.title || "Loading…"}</Text>
        <Text style={styles.muted}>{data?.text || "Fetching…"}</Text>
      </View>
    </View>
  );
}

function Row({ item }){
  const { kind, index } = item;
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["section", kind, index],
    queryFn: () => fetchSection({ kind, index }),
    staleTime: 60_000
  });
  if (error) return <View style={styles.section}><Text style={{ color: "#ffb4b4" }}>Error: {String(error.message || error)}</Text></View>;
  const loading = (isLoading || isFetching) && !data;
  const wrap = loading ? { opacity: 0.6 } : null;
  if (kind === "hero")   return <View style={wrap}><Hero data={data} index={index} /></View>;
  if (kind === "quote")  return <View style={wrap}><Quote data={data} index={index} /></View>;
  return <View style={wrap}><Card data={data} index={index} /></View>;
}

function Feed(){
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["sections"],
    queryFn: fetchPage,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 30_000
  });
  const flat = (data?.pages ?? []).flatMap(p => p.items);
  return (
    <FlatList
      data={flat}
      keyExtractor={(it) => `${it.kind}:${it.index}`}
      renderItem={({ item }) => <Row item={item} />}
      onEndReachedThreshold={0.4}
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
      contentContainerStyle={{ padding: 12 }}
      ListFooterComponent={<View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ color: "#9aa4b2" }}>{isFetchingNextPage ? "Loading more…" : hasNextPage ? "Scroll for more" : "— end —"}</Text>
      </View>}
    />
  );
}

export default function App(){
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.h1}>Infinite • TanStack Query • RN</Text>
          <Text style={styles.muted}>FlatList + useInfiniteQuery</Text>
        </View>
        <Feed />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1f2937" },
  h1: { color: "#e2e8f0", fontSize: 18, fontWeight: "600" },
  h2: { color: "#e2e8f0", fontSize: 20, fontWeight: "700", marginTop: 8 },
  h3: { color: "#e2e8f0", fontSize: 16, fontWeight: "700", marginTop: 6 },
  muted: { color: "#94a3b8" },
  section: { backgroundColor: "#111827", borderRadius: 16, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "#1f2937", marginBottom: 16 },
  badge: { backgroundColor: "#0ea5e9", color: "black", fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
});