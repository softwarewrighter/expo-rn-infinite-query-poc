import React, { useCallback, useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { registerRootComponent } from "expo";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from "react-native-reanimated";

const API_BASE = "http://192.168.1.152:5174";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// Animated wrapper that triggers when item comes into view
function AnimatedCard({ children, index, isVisible }) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const [hasAnimated, setHasAnimated] = useState(false);

  React.useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    }
  }, [isVisible, hasAnimated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

// Pulsing glow effect for heroes
function PulsingBorder({ children, isVisible }) {
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isVisible]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 15,
    elevation: interpolate(glowOpacity.value, [0.3, 0.8], [5, 15]),
  }));

  return (
    <Animated.View style={glowStyle}>
      {children}
    </Animated.View>
  );
}

// Typewriter effect for quotes
function TypewriterText({ text, isVisible, style }) {
  const [displayText, setDisplayText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  React.useEffect(() => {
    if (isVisible && !hasStarted && text) {
      setHasStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isVisible, text, hasStarted]);

  return <Text style={style}>"{displayText || text}"</Text>;
}

// Sliding image reveal
function SlideRevealImage({ uri, style, isVisible }) {
  const translateX = useSharedValue(-SCREEN_WIDTH);
  const clipWidth = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: 600 });
      clipWidth.value = withTiming(1, { duration: 600 });
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    overflow: "hidden",
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(clipWidth.value, [0, 0.3, 1], [0, 1, 1]),
  }));

  return (
    <Animated.View style={[style, containerStyle]}>
      <Animated.Image source={{ uri }} style={[style, imageStyle]} />
    </Animated.View>
  );
}

// Counter animation for badge
function AnimatedBadge({ index, isVisible }) {
  const [count, setCount] = useState(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      let current = 0;
      const target = index;
      const duration = 500;
      const steps = 20;
      const increment = target / steps;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [isVisible, index]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.badge, badgeStyle]}>
      <Text style={styles.badgeText}>#{count}</Text>
    </Animated.View>
  );
}

function Hero({ data, index, isVisible }){
  return (
    <PulsingBorder isVisible={isVisible}>
      <View style={styles.section}>
        <SlideRevealImage
          uri={data?.image}
          style={{ width: "100%", height: 200 }}
          isVisible={isVisible}
        />
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection:"row", alignItems:"center" }}>
            <AnimatedBadge index={index} isVisible={isVisible} />
            <Text style={{ color:"#9aa4b2", marginLeft: 8 }}>HERO</Text>
          </View>
          <Text style={styles.h2}>{data?.title || "Loading…"}</Text>
          <Text style={styles.muted}>{data?.text || "Fetching…"}</Text>
        </View>
      </View>
    </PulsingBorder>
  );
}

function Quote({ data, index, isVisible }){
  return (
    <View style={[styles.section, { padding: 16, borderLeftWidth: 4, borderLeftColor: "#22d3ee" }]}>
      <TypewriterText
        text={data?.text || "Loading…"}
        isVisible={isVisible}
        style={{ fontStyle: "italic", fontSize: 18, color: "#e2e8f0" }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <Text style={styles.muted}>— QUOTE · </Text>
        <AnimatedBadge index={index} isVisible={isVisible} />
      </View>
    </View>
  );
}

function Card({ data, index, isVisible }){
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      rotation.value = withSequence(
        withTiming(-2, { duration: 100 }),
        withSpring(0, { damping: 8, stiffness: 200 })
      );
    }
  }, [isVisible]);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={tiltStyle}>
      <View style={[styles.section, { padding: 12, flexDirection: "row" }]}>
        <SlideRevealImage
          uri={data?.image}
          style={{ width: 120, height: 120, borderRadius: 12, marginRight: 12 }}
          isVisible={isVisible}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection:"row", alignItems:"center" }}>
            <AnimatedBadge index={index} isVisible={isVisible} />
            <Text style={{ color:"#9aa4b2", marginLeft: 8 }}>CARD</Text>
          </View>
          <Text style={styles.h3}>{data?.title || "Loading…"}</Text>
          <Text style={styles.muted}>{data?.text || "Fetching…"}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function Row({ item, isVisible }){
  const { kind, index } = item;
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["section", kind, index],
    queryFn: () => fetchSection({ kind, index }),
    staleTime: 60_000
  });

  if (error) return (
    <View style={styles.section}>
      <Text style={{ color: "#ffb4b4", padding: 16 }}>Error: {String(error.message || error)}</Text>
    </View>
  );

  const loading = (isLoading || isFetching) && !data;

  return (
    <AnimatedCard index={index} isVisible={isVisible}>
      <View style={loading ? { opacity: 0.6 } : null}>
        {kind === "hero" && <Hero data={data} index={index} isVisible={isVisible} />}
        {kind === "quote" && <Quote data={data} index={index} isVisible={isVisible} />}
        {kind === "card" && <Card data={data} index={index} isVisible={isVisible} />}
      </View>
    </AnimatedCard>
  );
}

function Feed(){
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["sections"],
    queryFn: fetchPage,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 30_000
  });

  const [visibleItems, setVisibleItems] = useState(new Set());

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    setVisibleItems(new Set(viewableItems.map(v => v.key)));
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 30,
    minimumViewTime: 100,
  };

  const flat = (data?.pages ?? []).flatMap(p => p.items);

  return (
    <FlatList
      data={flat}
      keyExtractor={(it) => `${it.kind}:${it.index}`}
      renderItem={({ item }) => (
        <Row
          item={item}
          isVisible={visibleItems.has(`${item.kind}:${item.index}`)}
        />
      )}
      onEndReachedThreshold={0.4}
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
      contentContainerStyle={{ padding: 12 }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListFooterComponent={
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "#9aa4b2" }}>
            {isFetchingNextPage ? "Loading more…" : hasNextPage ? "Scroll for more" : "— end —"}
          </Text>
        </View>
      }
    />
  );
}

function App(){
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.h1}>Infinite • TanStack Query • RN</Text>
          <Text style={styles.muted}>FlatList + useInfiniteQuery + Animations</Text>
        </View>
        <Feed />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

export default registerRootComponent(App);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1f2937" },
  h1: { color: "#e2e8f0", fontSize: 18, fontWeight: "600" },
  h2: { color: "#e2e8f0", fontSize: 20, fontWeight: "700", marginTop: 8 },
  h3: { color: "#e2e8f0", fontSize: 16, fontWeight: "700", marginTop: 6 },
  muted: { color: "#94a3b8" },
  section: { backgroundColor: "#111827", borderRadius: 16, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: "#1f2937", marginBottom: 16 },
  badge: { backgroundColor: "#0ea5e9", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: "black", fontWeight: "700", fontSize: 12 },
});
