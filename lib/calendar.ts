import { ClubEvent } from "./events";
function escape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
// Fold by UTF-8 bytes, as required by RFC 5545 (including non-ASCII German text).
function fold(line: string) {
  let out = "",
    bytes = 0;
  for (const char of line) {
    const length = new TextEncoder().encode(char).length;
    if (bytes + length > 74) {
      out += "\r\n ";
      bytes = 1;
    }
    out += char;
    bytes += length;
  }
  return out;
}
export function downloadCalendar(events: ClubEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Knallkoepp Golkrath//Sessionsplan//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];
  for (const event of events)
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@knallkoepp-sessionsplan`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      event.time
        ? `DTSTART;TZID=Europe/Berlin:${event.date.replaceAll("-", "")}T${event.time.replace(":", "")}00`
        : `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`,
      `SUMMARY:${escape(event.title)}`,
      ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
      `DESCRIPTION:${escape(event.description)}`,
      "END:VEVENT",
    );
  lines.push("END:VCALENDAR");
  const url = URL.createObjectURL(
    new Blob([lines.map(fold).join("\r\n") + "\r\n"], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "knallkoepp-session-2026-2027.ics";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
