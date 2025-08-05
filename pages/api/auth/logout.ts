import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Eliminar la cookie de sesión
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.status(200).json({ message: "Logout successful" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}