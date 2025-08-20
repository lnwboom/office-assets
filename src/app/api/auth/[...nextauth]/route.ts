import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User, { type IUser } from '@/models/User';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { Types, HydratedDocument } from 'mongoose';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "ชื่อผู้ใช้" },
        password: { label: "Password", type: "password", placeholder: "รหัสผ่าน" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
          }

          console.log('Connecting to database...');
          await dbConnect();
          console.log('Database connected');

          console.log('Finding user:', credentials.username.toLowerCase());
          const userDoc = await User.findOne({ 
            username: credentials.username.toLowerCase() 
          }).select('+password').exec() as HydratedDocument<IUser>;

          if (!userDoc) {
            console.log('User not found');
            throw new Error('ไม่พบชื่อผู้ใช้นี้ในระบบ');
          }

          console.log('Verifying password...');
          const isValidPassword = await userDoc.verifyPassword(credentials.password);

          if (!isValidPassword) {
            console.log('Invalid password');
            throw new Error('รหัสผ่านไม่ถูกต้อง');
          }

          // Check user status
          if (userDoc.status === 'INACTIVE') {
            throw new Error('บัญชีผู้ใช้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
          }

          if (userDoc.status === 'PENDING') {
            throw new Error('บัญชีผู้ใช้อยู่ระหว่างรอการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ');
          }

          // Update last login
          userDoc.lastLogin = new Date();
          await userDoc.save();

          const user = userDoc.toObject() as IUser & { _id: Types.ObjectId };
          
          // Transform for return
          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
