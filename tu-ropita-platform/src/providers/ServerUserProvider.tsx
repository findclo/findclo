import { privateUsersApiWrapper } from '@/api-wrappers/users';
import { IUser } from '@/lib/backend/models/interfaces/user.interface';
import { cookies } from 'next/headers';
import ClientUserProvider from './ClientUserProvider';

async function getServerSideUser(): Promise<IUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('Authorization')?.value;

  if (token) {
    try {
      const user = await privateUsersApiWrapper.getMe(token);
      return user || null;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  return null;
}

export default async function ServerUserProvider({ children }: { children: React.ReactNode }) {
  const initialUser = await getServerSideUser();

  return (
    <ClientUserProvider initialUser={initialUser}>
      {children}
    </ClientUserProvider>
  );
}