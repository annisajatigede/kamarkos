"use client";
import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Star, CheckCircle2, MessageSquare, Send } from "lucide-react";

export default function TenantReviewPage() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/public/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.property?.id) setPropertyId(data.property.id);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim ulasan");

      setSuccess(true);
      setComment("");
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ulasan & Rating Kost</h1>
          <p className="text-xs text-slate-500 mt-1">
            Bagikan pengalaman Anda tinggal di KamarKos untuk membantu kami terus meningkatkan kualitas pelayanan.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Terima Kasih atas Ulasan Anda!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ulasan Anda sangat berarti bagi kemajuan dan kenyamanan tinggal di kost kami.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tulis Ulasan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Beri Bintang Kepuasan Anda:
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-600 block">
                  {rating === 5 && "Luar Biasa, Sangat Nyaman! ⭐⭐⭐⭐⭐"}
                  {rating === 4 && "Bagus & Memuaskan! ⭐⭐⭐⭐"}
                  {rating === 3 && "Cukup Baik ⭐⭐⭐"}
                  {rating === 2 && "Kurang Memuaskan ⭐⭐"}
                  {rating === 1 && "Perlu Banyak Perbaikan ⭐"}
                </span>
              </div>

              {/* Comment text area */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ulasan Lengkap Anda *
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda mengenai fasilitas, kebersihan, kecepatan WiFi, keramahan staf pengelola..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? "Mengirim..." : "Kirim Ulasan"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
