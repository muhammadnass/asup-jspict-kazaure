import ContentList from "@/components/ContentList";

export const revalidate = 60;

export default function PublicationsPage() {
  return <ContentList category="publications" />;
}
