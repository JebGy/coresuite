import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, password } = req.body;
    const trabajador = await prisma.trabajador.findFirst({
      where: {
        email: email,
      },
    });
    
    const isPasswordValid = await bcrypt.compare(password, trabajador?.password as string);
    
    if (!trabajador || !isPasswordValid) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Establecer cookie de sesión
    res.setHeader('Set-Cookie', `session=${trabajador.id}; Path=/; HttpOnly; SameSite=Lax`);
    
    res.status(200).json({datos:trabajador, message: "Login successful" });
    res.redirect("/application");
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}
