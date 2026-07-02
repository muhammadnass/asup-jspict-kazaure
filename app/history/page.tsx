import ContentList from "@/components/ContentList";

export const revalidate = 60;

export default function HistoryPage() {
  return <ContentList category="history" />;
}
