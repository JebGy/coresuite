import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Extender los tipos de NextAuth para incluir campos personalizados
import { DefaultSession, DefaultUser } from 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      rol: string;
      permisos: any;
      nombre: string;
    } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    id: string;
    rol: string;
    permisos: any;
    nombre: string;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    rol: string;
    permisos: any;
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos');
        }
        // Buscar usuario por email
        const user = await prisma.trabajador.findUnique({
          where: { email: credentials.email },
          include: { rol: true },
        });
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        // Validar contraseña
        if (!user.password) {
          // Permitir acceso solo al root inicial (sin contraseña)
          if (user.email === 'root@admin.com') {
            return {
              id: user.id.toString(),
              email: user.email,
              nombre: user.nombres,
              rol: user.rol.nombre,
              permisos: user.rol.permisos,
            };
          }
          throw new Error('Contraseña no configurada');
        }
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error('Contraseña incorrecta');
        }
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
}); 