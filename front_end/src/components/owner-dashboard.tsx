"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import { OrderDTO, OrderStatus } from "@/modules/orders/types";
import { UserDTO } from "@/modules/users/types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function OwnerDashboard() {
  const [owner, setOwner] = useState<UserDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [toast, setToast] = useState("");
  const headers = useMemo(() => ({ "content-type": "application/json" }), []);

  async function loadOrders() {
    const res = await fetch(apiUrl("/api/orders"), { cache: "no-store" });
    const payload = (await res.json()) as ApiResponse<OrderDTO[]>;
    setOrders(payload.data ?? []);
  }

  useEffect(() => {
    async function boot() {
      const userRes = await fetch(apiUrl("/api/users/demo?role=owner"), { cache: "no-store" });
      const userPayload = (await userRes.json()) as ApiResponse<UserDTO>;
      setOwner(userPayload.data);
      await loadOrders();
    }

    boot().catch(() => setToast("Failed to load owner dashboard"));
    const polling = setInterval(() => {
      loadOrders().catch(() => null);
    }, 6000);

    return () => clearInterval(polling);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const res = await fetch(apiUrl(`/api/orders/${orderId}/status`), {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    const payload = (await res.json()) as ApiResponse<OrderDTO>;
    if (!payload.success) {
      setToast(payload.message ?? "Failed to update status");
      return;
    }
    setToast("Queue updated");
    await loadOrders();
  }

  async function removeOrder(orderId: string) {
    const res = await fetch(apiUrl(`/api/orders/${orderId}`), {
      method: "DELETE",
      headers,
    });
    const payload = (await res.json()) as ApiResponse<{ deleted: boolean }>;
    if (!payload.success) {
      setToast(payload.message ?? "Failed to delete order");
      return;
    }
    setToast("Order deleted");
    await loadOrders();
  }

  async function move(orderId: string, direction: "up" | "down") {
    const queuedOrders = orders.filter((order) => order.status === "queued");
    const idx = queuedOrders.findIndex((item) => item._id === orderId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === queuedOrders.length - 1) return;

    const target = direction === "up" ? idx - 1 : idx + 1;
    const clone = [...queuedOrders];
    const [item] = clone.splice(idx, 1);
    if (!item) return;
    clone.splice(target, 0, item);

    const orderedIds = clone.map((queuedOrder) => queuedOrder._id);
    const res = await fetch(apiUrl("/api/orders/reorder"), {
      method: "POST",
      headers,
      body: JSON.stringify({ orderedIds }),
    });
    const payload = (await res.json()) as ApiResponse<{ reordered: boolean }>;
    if (!payload.success) {
      setToast(payload.message ?? "Failed to reorder queue");
      return;
    }
    setToast("Queue reordered");
    await loadOrders();
  }

  const queued = orders.filter((order) => order.status === "queued");
  const playing = orders.filter((order) => order.status === "playing");
  const completed = orders.filter((order) => order.status === "completed");

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-3 py-4 sm:px-4 sm:py-5">
      <header className="glass mb-2 rounded-xl border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <h1 className="m-0 text-xl font-bold sm:text-2xl">Owner Dashboard</h1>
        <p className="mb-0 mt-1 text-sm text-white/60">
          {owner ? `Signed in as ${owner.name}` : "Loading owner..."}
        </p>
        <div className="mt-2">
          <a
            href="/"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 sm:text-sm"
          >
            Back to Customer App
          </a>
        </div>
      </header>

      <div className="queue-columns">
        <section className="glass rounded-xl border border-white/10 p-2.5 sm:p-3">
          <h3 className="px-1 text-base font-semibold sm:text-lg">Queued</h3>
          {queued.map((order) => (
            <article
              key={order._id}
              className="mt-2 grid grid-cols-[48px_1fr_auto] items-center gap-2 rounded-lg bg-[rgba(17,16,33,0.6)] px-2 py-1.5 sm:grid-cols-[52px_1fr_auto] sm:gap-2.5"
            >
              <img
                src={order.song.coverImage}
                alt={order.song.title}
                className="h-12 w-12 rounded-md object-cover sm:h-[52px] sm:w-[52px]"
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm sm:text-[15px]">{order.song.title}</strong>
                <div className="truncate text-xs text-white/60 sm:text-sm">{order.song.artist}</div>
                <small className="text-xs text-white/50">#{order.queuePosition}</small>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[rgba(255,91,91,0.15)] text-white/80 transition hover:bg-[rgba(255,91,91,0.24)] hover:text-white"
                  onClick={() => removeOrder(order._id)}
                  aria-label={`Delete ${order.song.title}`}
                  title="Delete order"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 3h6m-9 4h12m-1 0-.62 10.11A2 2 0 0 1 14.38 19H9.62a2 2 0 0 1-1.99-1.89L7 7m3 4v4m4-4v4"
                    />
                  </svg>
                </button>
                <div className="grid gap-1">
                  <button
                    type="button"
                    className="rounded-md bg-white/10 px-2 py-1 text-[11px] hover:bg-white/15 sm:text-xs"
                    onClick={() => move(order._id, "up")}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-white/10 px-2 py-1 text-[11px] hover:bg-white/15 sm:text-xs"
                    onClick={() => move(order._id, "down")}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-[#6b5cff] px-2 py-1 text-[11px] text-white hover:opacity-90 sm:text-xs"
                    onClick={() => updateStatus(order._id, "playing")}
                  >
                    Play
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="glass rounded-xl border border-white/10 p-2.5 sm:p-3">
          <h3 className="px-1 text-base font-semibold sm:text-lg">Playing</h3>
          {playing.map((order) => (
            <article
              key={order._id}
              className="mt-2 grid grid-cols-[48px_1fr_auto] items-center gap-2 rounded-lg bg-[rgba(17,16,33,0.6)] px-2 py-1.5 sm:grid-cols-[52px_1fr_auto] sm:gap-2.5"
            >
              <img
                src={order.song.coverImage}
                alt={order.song.title}
                className="h-12 w-12 rounded-md object-cover sm:h-[52px] sm:w-[52px]"
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm sm:text-[15px]">{order.song.title}</strong>
                <div className="truncate text-xs text-white/60 sm:text-sm">{order.song.artist}</div>
              </div>
              <button
                type="button"
                className="rounded-md bg-[#6b5cff] px-2.5 py-1.5 text-[11px] text-white hover:opacity-90 sm:px-3 sm:text-xs"
                onClick={() => updateStatus(order._id, "completed")}
              >
                Complete
              </button>
            </article>
          ))}
        </section>

        <section className="glass rounded-xl border border-white/10 p-2.5 sm:p-3">
          <h3 className="px-1 text-base font-semibold sm:text-lg">Completed</h3>
          {completed.map((order) => (
            <article
              key={order._id}
              className="mt-2 grid grid-cols-[48px_1fr_auto] items-center gap-2 rounded-lg bg-[rgba(17,16,33,0.6)] px-2 py-1.5 sm:grid-cols-[52px_1fr_auto] sm:gap-2.5"
            >
              <img
                src={order.song.coverImage}
                alt={order.song.title}
                className="h-12 w-12 rounded-md object-cover sm:h-[52px] sm:w-[52px]"
              />
              <div className="min-w-0">
                <strong className="block truncate text-sm sm:text-[15px]">{order.song.title}</strong>
                <div className="truncate text-xs text-white/60 sm:text-sm">{order.song.artist}</div>
              </div>
              <button
                type="button"
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] hover:bg-white/15 sm:px-3 sm:text-xs"
                onClick={() => updateStatus(order._id, "queued")}
              >
                Re-queue
              </button>
            </article>
          ))}
        </section>
      </div>

      {toast ? (
        <div className="mt-3 rounded-lg bg-[#6b5cff]/30 px-3 py-2 text-sm text-violet-200 backdrop-blur">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
