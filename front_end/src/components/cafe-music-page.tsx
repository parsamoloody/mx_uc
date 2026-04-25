"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import { OrderDTO } from "@/modules/orders/types";
import { SongDTO } from "@/modules/songs/types";
import { CustomerBottomNav } from "./customer-bottom-nav";
import { SearchBar } from "./customer-app";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function MusicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l10-2v13" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-[28px] border border-white/10 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8">
        <MusicIcon className="h-7 w-7 text-white/80" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">Nothing is playing yet</h3>
      <p className="mt-2 text-sm text-white/60">
        As soon as the owner starts a track, this page will show the live music inside the cafe.
      </p>
    </div>
  );
}

export function CafeMusicPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [recommended, setRecommended] = useState<SongDTO[]>([]);
  const [toast, setToast] = useState("");
  const [searchValue, setSearchValue] = useState(""); // 添加搜索状态

  useEffect(() => {
    async function load() {
      const [ordersRes, recommendedRes] = await Promise.all([
        fetch(apiUrl("/api/orders"), { cache: "no-store" }),
        fetch(apiUrl("/api/songs/recommended?limit=6"), { cache: "no-store" }),
      ]);

      const ordersJson = (await ordersRes.json()) as ApiResponse<OrderDTO[]>;
      const recommendedJson = (await recommendedRes.json()) as ApiResponse<SongDTO[]>;

      setOrders(ordersJson.data ?? []);
      setRecommended(recommendedJson.data ?? []);
    }

    void load().catch(() => setToast("Failed to load cafe music"));
    const polling = setInterval(() => {
      void load().catch(() => null);
    }, 5000);

    return () => clearInterval(polling);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // 添加搜索处理函数
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearch = () => {
    // 暂时留空，可以根据需求实现搜索功能
  };

  const playing = useMemo(
    () => orders.filter((order) => order.status === "playing"),
    [orders],
  );
  const queued = useMemo(
    () => orders.filter((order) => order.status === "queued").sort((a, b) => a.queuePosition - b.queuePosition),
    [orders],
  );

  const liveSong = playing[0] ?? null;
  const nextSongs = queued.slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0a12] pb-28">
      {/* 修复SearchBar组件属性缺失问题，添加value、onChange和onSearch属性 */}
      <SearchBar value={searchValue} onChange={handleSearchChange} onSearch={handleSearch} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,126,95,0.22),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(255,214,102,0.15),_transparent_18%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_36%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#ffb77c]">Cafe Live Music</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              What is playing right now
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              A live view of the soundtrack inside the cafe, with the current track on stage and the next songs lining up.
            </p>
          </div>
          <Link
            href="/"
            className="glass hidden rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:text-white sm:inline-flex"
          >
            Back Home
          </Link>
        </div>
        

        {liveSong ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass overflow-hidden rounded-[32px] border border-white/10"
          >
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative p-5 sm:p-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff8f5a]/15 px-3 py-1 text-xs font-medium text-[#ffd5bf]">
                  <span className="h-2 w-2 rounded-full bg-[#ff8f5a] shadow-[0_0_18px_rgba(255,143,90,0.9)]" />
                  Now Playing
                </div>
                <h2 className="max-w-xl text-3xl font-semibold text-white sm:text-5xl">
                  {liveSong.song.title}
                </h2>
                <p className="mt-3 text-base text-white/70 sm:text-lg">{liveSong.song.artist}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/65 sm:text-sm">
                  <span className="rounded-full border border-white/10 px-3 py-1.5">
                    Requested by {liveSong.user.name}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5">
                    Queue spot #{liveSong.queuePosition}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5">
                    Live in cafe
                  </span>
                </div>
              </div>
              <div className="relative min-h-[280px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
                <img
                  src={liveSong.song.coverImage}
                  alt={liveSong.song.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a12] via-[#0b0a12]/15 to-transparent" />
              </div>
            </div>
          </motion.section>
        ) : (
          <EmptyState />
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="glass rounded-[28px] border border-white/10 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Up Next</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Queue inside the cafe</h3>
              </div>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
                {queued.length} tracks
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {nextSongs.length > 0 ? (
                nextSongs.map((order, index) => (
                  <div
                    key={order._id}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff8f5a]/15 text-sm font-semibold text-[#ffd5bf]">
                      {index + 1}
                    </div>
                    <img
                      src={order.song.coverImage}
                      alt={order.song.title}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{order.song.title}</p>
                      <p className="truncate text-xs text-white/55">{order.song.artist}</p>
                      <p className="mt-1 text-[11px] text-white/35">Requested by {order.user.name}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55">
                      #{order.queuePosition}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">
                  The queue is empty right now.
                </p>
              )}
            </div>
          </section>

          <section className="glass rounded-[28px] border border-white/10 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Discover</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Cafe vibe picks</h3>
            <div className="mt-4 space-y-3">
              {recommended.map((song) => (
                <div
                  key={song._id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                >
                  <img src={song.coverImage} alt={song.title} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{song.title}</p>
                    <p className="truncate text-xs text-white/55">{song.artist}</p>
                    <p className="mt-1 text-[11px] text-white/35">
                      {Intl.NumberFormat().format(song.playCount || 0)} plays
                    </p>
                  </div>
                  <MusicIcon className="h-5 w-5 shrink-0 text-[#ffb77c]" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <CustomerBottomNav />
      {toast ? (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#ff8f5a]/20 px-4 py-2 text-sm text-[#ffe0d0] backdrop-blur"
        >
          {toast}
        </motion.div>
      ) : null}
    </div>
  );
}
