import { notFound, redirect } from "next/navigation";
import { rebuildDocuments } from "@/lib/documents";
import { getStay } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PrintStayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let stay = getStay(id);
  if (!stay) notFound();
  if (stay.guest && !stay.files.dossierPdf) {
    stay = await rebuildDocuments(stay);
  }
  if (stay.files.dossierPdf) {
    redirect(`/api/files/${stay.id}/${stay.files.dossierPdf}`);
  }
  redirect(`/dashboard/stays/${stay.id}`);
}
