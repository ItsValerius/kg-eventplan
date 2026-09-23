import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { season } from "@/lib/season";

export function PdfDownload() {
  return (
    <Button
      className="mb-4 w-full justify-center gap-2.5"
      variant="outline"
      size="default"
      nativeButton={false}
      render={
        <a href="/sessionsplan.pdf" download={`knallkoepp-sessionsplan-${season.slug}.pdf`} />
      }
    >
      <Download size={18} /> Sessionsplan als PDF
    </Button>
  );
}
