"use client";

import { useMemo, useState } from "react";

type AvailabilityItem =
  | { mode?: "single"; date: string; status: "available" | "booked" }
  | { mode: "range"; startDate: string; endDate: string; status: "available" | "booked" };

type Props = {
  initialPrices: Array<{ label: string; amount: number }>;
  initialPhotos: string[];
  initialVideos: string[];
  initialAvailability: AvailabilityItem[];
};

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function AdminProductRichFields({ initialPrices, initialPhotos, initialVideos, initialAvailability }: Props) {
  const [prices, setPrices] = useState<Array<{ label: string; amount: number }>>(initialPrices);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [videos, setVideos] = useState<string[]>(initialVideos);
  const [availability, setAvailability] = useState<AvailabilityItem[]>(
    initialAvailability.map((item) => {
      if ("startDate" in item && "endDate" in item) {
        return { mode: "range", startDate: item.startDate, endDate: item.endDate, status: item.status };
      }
      return { mode: "single", date: "date" in item ? item.date : "", status: item.status };
    }),
  );

  const pricesJson = useMemo(() => JSON.stringify(prices), [prices]);
  const photosJson = useMemo(() => JSON.stringify(photos), [photos]);
  const videosJson = useMemo(() => JSON.stringify(videos), [videos]);
  const availabilityJson = useMemo(() => JSON.stringify(availability), [availability]);

  return (
    <div className="space-y-5">
      <input type="hidden" name="photosJson" value={photosJson} />
      <input type="hidden" name="videosJson" value={videosJson} />
      <input type="hidden" name="availabilityCalendarJson" value={availabilityJson} />
      <input type="hidden" name="pricesJson" value={pricesJson} />

      <section className="rounded border border-[var(--brand-soft)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Price Categories</h3>
          <button type="button" className="rounded border border-[var(--brand-soft)] px-3 py-1 text-xs" onClick={() => setPrices((prev) => [...prev, { label: "", amount: 0 }])}>
            Add
          </button>
        </div>
        <div className="space-y-2">
          {prices.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_180px_auto_auto_auto]">
              <input
                value={item.label}
                onChange={(event) =>
                  setPrices((prev) => prev.map((row, i) => (i === index ? { ...row, label: event.target.value } : row)))
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. Weekly / 3 Days / Weekend"
              />
              <input
                type="number"
                value={item.amount}
                onChange={(event) =>
                  setPrices((prev) => prev.map((row, i) => (i === index ? { ...row, amount: Number(event.target.value || 0) } : row)))
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Amount"
              />
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setPrices((prev) => moveItem(prev, index, index - 1))}>
                Up
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setPrices((prev) => moveItem(prev, index, index + 1))}>
                Down
              </button>
              <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={() => setPrices((prev) => prev.filter((_, i) => i !== index))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-[var(--brand-soft)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Photos</h3>
          <button type="button" className="rounded border border-[var(--brand-soft)] px-3 py-1 text-xs" onClick={() => setPhotos((prev) => [...prev, ""])}>
            Add
          </button>
        </div>
        <div className="mb-3">
          <input type="file" name="photoFiles" accept="image/*" multiple className="w-full rounded border px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-[var(--muted)]">Selected files will be uploaded when you save the product.</p>
        </div>
        <div className="space-y-2">
          {photos.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
              <input
                value={item}
                onChange={(event) => setPhotos((prev) => prev.map((row, i) => (i === index ? event.target.value : row)))}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="https://..."
              />
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setPhotos((prev) => moveItem(prev, index, index - 1))}>
                Up
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setPhotos((prev) => moveItem(prev, index, index + 1))}>
                Down
              </button>
              <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-[var(--brand-soft)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Videos</h3>
          <button type="button" className="rounded border border-[var(--brand-soft)] px-3 py-1 text-xs" onClick={() => setVideos((prev) => [...prev, ""])}>
            Add
          </button>
        </div>
        <div className="space-y-2">
          {videos.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
              <input
                value={item}
                onChange={(event) => setVideos((prev) => prev.map((row, i) => (i === index ? event.target.value : row)))}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="https://youtube.com/..."
              />
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setVideos((prev) => moveItem(prev, index, index - 1))}>
                Up
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setVideos((prev) => moveItem(prev, index, index + 1))}>
                Down
              </button>
              <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={() => setVideos((prev) => prev.filter((_, i) => i !== index))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-[var(--brand-soft)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Availability</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-[var(--brand-soft)] px-3 py-1 text-xs"
              onClick={() => setAvailability((prev) => [...prev, { mode: "single", date: new Date().toISOString().slice(0, 10), status: "available" }])}
            >
              Add Single Date
            </button>
            <button
              type="button"
              className="rounded border border-[var(--brand-soft)] px-3 py-1 text-xs"
              onClick={() =>
                setAvailability((prev) => [
                  ...prev,
                  { mode: "range", startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), status: "booked" },
                ])
              }
            >
              Add Range
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {availability.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_1fr_180px_auto_auto_auto]">
              <select
                value={item.mode ?? "single"}
                onChange={(event) =>
                  setAvailability((prev) =>
                    prev.map((row, i) => {
                      if (i !== index) return row;
                      if (event.target.value === "range") {
                        const date = "date" in row ? row.date : new Date().toISOString().slice(0, 10);
                        return { mode: "range", startDate: date, endDate: date, status: row.status };
                      }
                      const date = "startDate" in row ? row.startDate : "date" in row ? row.date : new Date().toISOString().slice(0, 10);
                      return { mode: "single", date, status: row.status };
                    }),
                  )
                }
                className="rounded border px-3 py-2 text-sm"
              >
                <option value="single">Single</option>
                <option value="range">Range</option>
              </select>
              {(item.mode ?? "single") === "single" ? (
                <input
                  type="date"
                  value={"date" in item ? item.date : item.startDate}
                  onChange={(event) =>
                    setAvailability((prev) =>
                      prev.map((row, i) => (i === index ? { mode: "single", date: event.target.value, status: row.status } : row)),
                    )
                  }
                  className="rounded border px-3 py-2 text-sm"
                />
              ) : (
                <>
                  <input
                    type="date"
                    value={"startDate" in item ? item.startDate : item.date}
                    onChange={(event) =>
                      setAvailability((prev) =>
                        prev.map((row, i) =>
                          i === index && "startDate" in row ? { ...row, startDate: event.target.value } : row,
                        ),
                      )
                    }
                    className="rounded border px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={"endDate" in item ? item.endDate : item.date}
                    onChange={(event) =>
                      setAvailability((prev) =>
                        prev.map((row, i) =>
                          i === index && "endDate" in row ? { ...row, endDate: event.target.value } : row,
                        ),
                      )
                    }
                    className="rounded border px-3 py-2 text-sm"
                  />
                </>
              )}
              {(item.mode ?? "single") === "single" ? <div /> : null}
              <select
                value={item.status}
                onChange={(event) =>
                  setAvailability((prev) =>
                    prev.map((row, i) => (i === index ? { ...row, status: event.target.value as "available" | "booked" } : row)),
                  )
                }
                className="rounded border px-3 py-2 text-sm"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setAvailability((prev) => moveItem(prev, index, index - 1))}>
                Up
              </button>
              <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setAvailability((prev) => moveItem(prev, index, index + 1))}>
                Down
              </button>
              <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={() => setAvailability((prev) => prev.filter((_, i) => i !== index))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
