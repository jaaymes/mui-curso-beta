import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { verifyAuthentication } from "@/lib/auth-server";
import { Box } from "@mui/material";
import { redirect } from "next/navigation";

const SIDEBAR_WIDTH = 280;

/**
 * Layout do dashboard com autenticação SSR
 * A autenticação é verificada no servidor antes de renderizar o componente
 * Se o usuário não estiver autenticado, será redirecionado para /login
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificação de autenticação no servidor - redireciona se não autenticado
  const user = await verifyAuthentication();
  if (!user) {
    return redirect("/login");
  }
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar width={SIDEBAR_WIDTH} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: "background.default",
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
