import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";
import isValidUrl from "@/lib/shared/isValidUrl";
import { UsersAndCollections } from "@linkwarden/prisma/client";
import getPermission from "@/lib/api/getPermission";
import { removeFiles } from "@linkwarden/filesystem";

export default async function links(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  const link = await prisma.link.findUnique({
    where: {
      id: Number(req.query.id),
    },
    include: { collection: { include: { owner: true } } },
  });

  if (!link)
    return res.status(404).json({
      response: "Link not found.",
    });

  const collectionIsAccessible = await getPermission({
    userId: user.id,
    collectionId: link.collectionId,
  });

  const memberHasAccess = collectionIsAccessible?.members.some(
    (e: UsersAndCollections) => e.userId === user.id && e.canUpdate
  );

  if (!(collectionIsAccessible?.ownerId === user.id || memberHasAccess))
    return res.status(401).json({
      response: "Permission denied.",
    });

  if (req.method === "PUT") {
    if (process.env.NEXT_PUBLIC_DEMO === "true")
      return res.status(400).json({
        response:
          "This action is disabled because this is a read-only demo of Linkwarden.",
      });

    if (!link.url || !isValidUrl(link.url))
      return res.status(200).json({
        response: "Invalid URL.",
      });

    await prisma.link.update({
      where: {
        id: link.id,
      },
      data: {
        image: null,
        pdf: null,
        readable: null,
        monolith: null,
        preview: null,
        lastPreserved: null,
        indexVersion: null,
      },
    });

    await removeFiles(link.id, link.collection.id);

    return res.status(200).json({
      response: "Link is being archived.",
    });
  }
}

const getTimezoneDifferenceInMinutes = (future: Date, past: Date) => {
  const date1 = new Date(future);
  const date2 = new Date(past);

  const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());

  const diffInMinutes = diffInMilliseconds / (1000 * 60);

  return diffInMinutes;
};
