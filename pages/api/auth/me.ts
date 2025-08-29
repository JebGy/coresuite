import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = req.cookies.session;
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log(JSON.parse(session));
    const trabajador = await prisma.trabajador.findFirst({
      where: {
        id: Number(JSON.parse(session)),
      },
      include: {
        rol: true,
      },
      omit: {
        password: true,
      },
    });
    if (!trabajador) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json({ datos: trabajador, message: "Authenticated" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}
