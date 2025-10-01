import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    regNo?: string | null;
    year?: number | null;
    semester?: number | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      regNo?: string | null;
      year?: number | null;
      semester?: number | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    regNo?: string | null;
    year?: number | null;
    semester?: number | null;
  }
}
