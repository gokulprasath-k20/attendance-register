import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Use anon key for signin (service_role doesn't support signInWithPassword)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('Attempting signin for:', credentials.email);

        // Get user from Supabase Auth
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

        if (authError) {
          console.error('Supabase auth error:', authError);
          throw new Error(`Invalid credentials: ${authError.message}`);
        }

        if (!authData.user) {
          console.error('No user data returned');
          throw new Error('Invalid credentials');
        }

        console.log('Auth successful for user:', authData.user.id);

        // Get profile data using service role key for RLS bypass
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Profile not found');
        }

        const profileData = profile as {
          user_id: string;
          email: string;
          name: string;
          role: string;
          reg_no: string | null;
          year: number | null;
          semester: number | null;
        };

        return {
          id: profileData.user_id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          regNo: profileData.reg_no,
          year: profileData.year,
          semester: profileData.semester,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.regNo = user.regNo;
        token.year = user.year;
        token.semester = user.semester;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.regNo = token.regNo as string | null;
        session.user.year = token.year as number | null;
        session.user.semester = token.semester as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
