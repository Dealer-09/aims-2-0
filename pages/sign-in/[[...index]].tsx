import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Sign In</h2>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}