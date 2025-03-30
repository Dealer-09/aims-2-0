import React from "react";
import { useRouter } from "next/router";

const ClassesSection: React.FC = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };
  return (
    <section className="class container" id="class">
      <h2 className="heading">Class</h2>
      <div className="class-data">
        <h3>Get your class notes</h3>
        
        {/* Sign In Button */}
        <button className="btn1" onClick={handleSignIn}>
          Sign In <i className="bx bx-log-in"></i>
        </button>

        {/* Sign Up Button */}
        <button className="btn1" onClick={handleSignUp}>
          Sign Up <i className="bx bx-user-plus"></i>
        </button>
      </div>
    </section>
  );
};

export default ClassesSection;
