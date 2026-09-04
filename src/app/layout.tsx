import "./globals.css";

import Sidebar from "@/components/Sidebar";

import { EventProvider } from "@/context/EventContext";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (

    <html lang="pt-BR">


      <body suppressHydrationWarning>


        <EventProvider>


          <div className="
            flex
            flex-col
            md:flex-row
            min-h-screen
            bg-[#F7EFE7]
          ">


            <Sidebar />



            <main className="
              flex-1
              p-4
              md:p-8
            ">


              {children}


            </main>



          </div>


        </EventProvider>


      </body>


    </html>

  );

}