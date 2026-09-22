// Everything tied to the current carnival session. Update these values once per
// season; changing firstDay/lastDay also needs `pnpm db:generate` for the check constraint.
export const season = {
  label: "2026/2027",
  slug: "2026-2027",
  // Dates an administrator may enter.
  firstDay: "2026-09-01",
  lastDay: "2027-08-31",
  // Month tiles always offered on the overview.
  coreMonths: ["2026-11", "2026-12", "2027-01", "2027-02"],
  // Aschermittwoch ends the session (Rosenmontag is 8 February 2027).
  end: "2027-02-10",
} as const;
