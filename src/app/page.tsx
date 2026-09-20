import { Banner } from "@/components/Banner";
import { LoginForm } from "@/components/client-only";

export default function LoginPage() {
  return (
    <>
      <Banner />
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <LoginForm />
      </main>
    </>
  );
}
