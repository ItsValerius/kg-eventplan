# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Visitors looking for the KG Knallköpp Golkrath carnival season schedule; club administrators maintaining event dates.

## Product Purpose
A German-language public overview of the 2026/2027 carnival season, with a private administration area for adding dates.

## Capabilities and Constraints
The user confirmed German content. Confirmed 2026/2027 dates are not available, so initial planning dates stay unpublished until an administrator explicitly publishes them. Administration uses password authentication. Events are persisted in PostgreSQL through Drizzle ORM, with a tagged public overview cache invalidated after admin edits. Production credentials and deployment remain environment-specific.

## Brand Commitments
KG Knallköpp Golkrath e.V.; reference website https://www.knallkoepp-golkrath.de/. The existing website uses green and white.

## Evidence on Hand
The club website identifies the club as founded in 1929 and its hall as Mehrzweckhalle Golkrath, Wiesengrund 20, 41812 Erkelenz-Golkrath. It describes Hoppeditzerwachen, Möhnenhängen, Prinzenbiwak, Kindersitzung, Jeck op Kölsch and Rosenmontag traditions. Its session page lists 2020/2021, not confirmed dates for the requested season.

## UI stack constraint
The user requested shadcn/ui and Tailwind CSS, explicitly excluding Radix. Use the Base UI shadcn implementation. Header navigation items were removed at the user’s request.
