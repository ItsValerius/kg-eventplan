import path from "node:path";
import { put } from "@vercel/blob";
import {
  Document,
  Font,
  Image as PdfImage,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { sortEvents, type ClubEvent } from "../events";
import { eventName, formatDate, groupByMonth, todayInBerlin } from "../format";
import { SESSION_PLAN_BLOB_PATHNAME } from "./path";
import { season } from "../season";
import { siteUrl } from "../seo/structured-data";

Font.register({
  family: "Barlow Condensed Bold",
  src: path.join(process.cwd(), "public/fonts/barlow-condensed-bold.ttf"),
});

const siteLabel = new URL(siteUrl).host;

const GREEN = "#176717";
const INK = "#17251c";
const MUTED = "#5b685e";
const LINE = "#dce3d9";

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Helvetica" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  logo: { width: 40, height: 40 },
  wordmark: { fontFamily: "Barlow Condensed Bold", fontSize: 14, color: GREEN, lineHeight: 1.3 },
  headline: { fontFamily: "Barlow Condensed Bold", fontSize: 26, color: INK, marginBottom: 4 },
  stand: { fontSize: 9, color: MUTED, marginBottom: 24 },
  link: { color: GREEN, textDecoration: "none" },
  monthHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: INK,
    marginBottom: 6,
    marginTop: 18,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  dateColumn: { width: 46, alignItems: "center" },
  dateNumber: { fontFamily: "Barlow Condensed Bold", fontSize: 26, color: GREEN, lineHeight: 1 },
  weekday: { fontSize: 8, color: MUTED, textTransform: "uppercase", marginTop: 2 },
  content: { flex: 1 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 12, color: INK, marginBottom: 3 },
  meta: { fontSize: 9, color: MUTED, marginBottom: 3 },
  description: { fontSize: 9, color: INK, lineHeight: 1.5 },
  emptyState: { alignItems: "center", marginTop: 80 },
  emptyTitle: { fontFamily: "Barlow Condensed Bold", fontSize: 18, color: INK, marginBottom: 8 },
  emptyText: { fontSize: 10, color: MUTED },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
});

function SeasonPlanDocument({ events: unsortedEvents }: { events: ClubEvent[] }) {
  const events = sortEvents(unsortedEvents);
  const generatedAt = formatDate(todayInBerlin(), {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <Document title={`Sessionsplan ${season.label} – KG Knallköpp Golkrath`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <PdfImage style={styles.logo} src={path.join(process.cwd(), "public/images/club-logo.png")} />
          <View>
            <Text style={styles.wordmark}>JOLKERE</Text>
            <Text style={styles.wordmark}>KNALL MÖTT!</Text>
          </View>
        </View>
        <Text style={styles.headline}>
          Alle Termine der Knallköpp für die Session {season.label}.
        </Text>
        <Text style={styles.stand}>
          Stand: {generatedAt} · Aktuelle Termine und Änderungen findest du immer unter{" "}
          <Link style={styles.link} src={siteUrl}>{siteLabel}</Link>
        </Text>

        {!events.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Die Session nimmt Gestalt an.</Text>
            <Text style={styles.emptyText}>
              Sobald die ersten Termine feststehen, findest du sie hier.
            </Text>
          </View>
        )}

        {groupByMonth(events).map(([month, monthEvents]) => (
          <View key={month}>
            <Text style={styles.monthHeading}>
              {formatDate(`${month}-01`, { month: "long", year: "numeric" })}
            </Text>
            {monthEvents.map((event) => (
              <View key={event.id} style={styles.row} wrap={false}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateNumber}>{event.date.slice(8)}</Text>
                  <Text style={styles.weekday}>
                    {formatDate(event.date, { weekday: "short" }).replace(".", "")}
                  </Text>
                </View>
                <View style={styles.content}>
                  <Text style={styles.title}>{eventName(event)}</Text>
                  <Text style={styles.meta}>
                    {event.time ? `${event.time} Uhr` : "Uhrzeit steht noch nicht fest"}
                    {" · "}
                    {event.location || "Ort steht noch nicht fest"}
                  </Text>
                  {event.description && (
                    <Text style={styles.description}>{event.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>
            Änderungen vorbehalten. Immer aktuell:{" "}
            <Link style={styles.link} src={siteUrl}>{siteLabel}</Link>
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function renderSeasonPlanPdf(events: ClubEvent[]) {
  return renderToBuffer(<SeasonPlanDocument events={events} />);
}

export async function regenerateSeasonPlanPdf(events: ClubEvent[]): Promise<void> {
  const buffer = await renderSeasonPlanPdf(events);
  await put(SESSION_PLAN_BLOB_PATHNAME, buffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 300,
  });
}
