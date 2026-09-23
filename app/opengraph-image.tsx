export { alt, size, contentType } from "@/lib/seo/social-image";
import { renderSocialImage } from "@/lib/seo/social-image";

export default function Image() {
  return renderSocialImage();
}
