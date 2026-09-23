// The club's legal details, shown in the Impressum and the Datenschutzerklärung.
// Keep in sync with the main club website and the Vereinsregister entry.
export const club = {
  name: "KG Knallköpp Golkrath e.V. von 1929",
  // Name as entered in the Vereinsregister, which the Impressum has to state.
  legalName: "Karnevalsgesellschaft „Knall Köpp“ e. V.",
  shortName: "KG Knallköpp Golkrath e.V.",
  street: "Hochstraße 3",
  city: "41812 Erkelenz",
  email: "vorstand@knallkoepp-golkrath.de",
  register: { court: "Amtsgericht Mönchengladbach", number: "VR 3860" },
  board: [
    { role: "1. Vorsitzende", name: "Johanna Heinen" },
    { role: "1. Geschäftsführer", name: "Pascal Oster" },
    { role: "1. Schatzmeisterin", name: "Julie Hohensee" },
  ],
  contentResponsible: "Johanna Heinen",
  website: "https://www.knallkoepp-golkrath.de",
} as const;
