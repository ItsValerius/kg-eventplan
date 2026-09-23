import { todayInBerlin } from "@/lib/format";

export function toLocalDate(value: string) {
  const [year, month, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function toDateValue(date: Date) {
  return `${toMonthValue(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

// Development only: preview another day with ?heute=2027-01-20.
export function currentDay() {
  if (process.env.NODE_ENV !== "production") {
    const preview = new URLSearchParams(location.search).get("heute");
    if (preview && /^\d{4}-\d{2}-\d{2}$/.test(preview)) return preview;
  }
  return todayInBerlin();
}
