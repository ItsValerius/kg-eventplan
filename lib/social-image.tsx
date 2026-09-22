import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { season } from "./season";

export const alt = `Sessionsplan ${season.label} – KG Knallköpp Golkrath`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function renderSocialImage() {
  const [logoData, fontData] = await Promise.all([
    readFile(path.join(process.cwd(), "public/images/club-logo.png")),
    readFile(path.join(process.cwd(), "public/fonts/barlow-condensed-bold.ttf")),
  ]);
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#176717",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image isn't usable inside next/og's Satori renderer */}
        <img
          src={logoSrc}
          alt=""
          width={190}
          height={190}
          style={{ marginBottom: 36 }}
        />
        <div
          style={{
            display: "flex",
            fontFamily: "Barlow Condensed Bold",
            fontSize: 86,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          Sessionsplan {season.label}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Barlow Condensed Bold",
            fontSize: 38,
            color: "#e2f9c5",
            marginTop: 22,
            textAlign: "center",
          }}
        >
          KG Knallköpp Golkrath
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Barlow Condensed Bold",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
