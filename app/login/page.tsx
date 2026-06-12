import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./sign-in-button";

export default async function LoginPage() {
  // Already signed in → straight to discovery
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl">
          <span className="font-display font-normal text-text-primary">Repo</span>
          <span className="font-display font-semibold text-accent-violet">Radar</span>
        </h1>
        <p className="mt-3 max-w-sm text-sm text-text-secondary">
          A smarter GitHub Trending. Search and filter open source repos, check
          their health at a glance, and compare them side by side.
        </p>
      </div>
      <SignInButton />
    </div>
  );
}
