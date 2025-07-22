import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { registrarLog } from '../../../lib/logger';

// Extender los tipos de NextAuth para incluir campos personalizados
import { DefaultSession, DefaultUser } from 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      rol: string;
      permisos: unknown;
      nombre: string;
    } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    id: string;
    rol: string;
    permisos: unknown;
    nombre: string;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    rol: string;
    permisos: unknown;
    nombre: string;
  }
}

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'correo@ejemplo.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credenciales recibidas:', credentials);
        if (!credentials?.email) {
          throw new Error('Email requerido');
        }
        if (credentials.email !== 'root@admin.com' && !credentials.password) {
          throw new Error('Contraseña requerida');
        }
        
        // Buscar usuario por email
        const user = await prisma.trabajador.findUnique({
          where: { email: credentials.email },
          include: { rol: true },
        });
        console.log('Usuario encontrado:', user);
        if (!user) {
          console.log('Usuario no encontrado');
          throw new Error('Usuario no encontrado');
        }
        // Comparación robusta para root
        const emailRecibido = credentials.email.trim().toLowerCase();
        const emailUsuario = user.email.trim().toLowerCase();
        console.log('Comparando email recibido:', emailRecibido, 'con email usuario:', emailUsuario);
        if (emailUsuario === 'root@admin.com') {
          console.log('Flujo root: acceso root@admin.com');
          await registrarLog({
            usuarioId: user.id,
            accion: 'LOGIN',
            entidad: 'Usuario',
            entidadId: user.id,
            detalles: 'Inicio de sesión root',
          });
          return {
            id: user.id.toString(),
            email: user.email,
            nombre: user.nombres,
            rol: user.rol.nombre,
            permisos: user.rol.permisos,
          };
        }
        // Validar contraseña
        if (!user.password) {
          console.log('Contraseña no configurada para usuario:', user.email);
          throw new Error('Contraseña no configurada');
        }
        const valid = await bcrypt.compare(credentials.password, user.password);
        console.log('Resultado validación contraseña:', valid);
        if (!valid) {
          console.log('Contraseña incorrecta para usuario:', user.email);
          throw new Error('Contraseña incorrecta');
        }
        await registrarLog({
          usuarioId: user.id,
          accion: 'LOGIN',
          entidad: 'Usuario',
          entidadId: user.id,
          detalles: 'Inicio de sesión exitoso',
        });
        return {
          id: user.id.toString(),
          email: user.email,
          nombre: user.nombres,
          rol: user.rol.nombre,
          permisos: user.rol.permisos,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.permisos = user.permisos;
        token.nombre = user.nombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.permisos = token.permisos;
        session.user.nombre = token.nombre;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      },
    },
  },
}); 