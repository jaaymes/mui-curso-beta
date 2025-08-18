import { verifyAuthentication } from "@/lib/auth-server";
import { Box, Container } from "@mui/material";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyAuthentication();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">{children}</Container>
    </Box>
  );
}
