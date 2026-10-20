import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { names } from "@/lib/config";
import { Mark } from "@/components/Mark";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  const n = names();
  return (
    <main className="login">
      <div className="login-card glass">
      <div className="mark">
        <Mark size={40} inline />
      </div>
      <h1>us</h1>
      <p className="lead">One little thing a day, just for us.</p>
      <LoginForm names={n} />
      </div>
    </main>
  );
}
