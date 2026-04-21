import prisma from "@/lib/prisma";
import TagsClient from "./tags-client";

export default async function TagsPage() {
  // Fetch all addresses that have at least one tag
  const addresses = await prisma.address.findMany({
    where: { tags: { some: {} } },
    select: {
      address: true,
      status: true,
      tags: {
        select: { id: true, tag: true, taggedBy: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return <TagsClient initialData={addresses} />;
}
