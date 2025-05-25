import React from "react";
import { useRouter } from "next/router";

const ClassesSection: React.FC = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/request-access");
  };  return (
    <section className="class" id="class">
      <h2 className="heading">Class Resources</h2>
      <div className="class-data">
        <h3>Access Learning Materials</h3>
        
        <div className="class-buttons">
          {/* Sign In Button */}
          <button className="btn1" onClick={handleSignIn}>
            <i className="bx bx-log-in"></i> Sign In
          </button>

          {/* Sign Up Button */}
          <button className="btn1" onClick={handleSignUp}>
            <i className="bx bx-user-plus"></i> Sign Up
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
