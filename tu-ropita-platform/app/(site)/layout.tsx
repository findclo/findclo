import { privateUsersApiWrapper } from "@/api-wrappers/users";
import Footer from "@/components/Footer";
import Header from "@/components/Header"; // Regular import
import { IUser } from "@/lib/backend/models/interfaces/user.interface";
import ClientUserProvider from "@/providers/ClientUserProvider";
import ToastProvider from "@/providers/ToastProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FindClo",
  description: "Encontrá la indumentaria que buscas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const token = cookieStore.get('Authorization');
  let initialUser: IUser | null = null;
  if(token){
    const user = await privateUsersApiWrapper.getMe(token.value);
    initialUser = user;
  }

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ToastProvider>
          <ClientUserProvider initialUser={initialUser}>
            <Header />
            <main className="container mx-auto mt-4 flex-grow px-4">
              {children}
            </main>
          
            {/* Spacer div to prevent content from being hidden under the mobile header */}
            <div className="h-24 md:hidden"></div>
            
            <Footer />
          </ClientUserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
