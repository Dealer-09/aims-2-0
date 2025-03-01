import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ClassesSection: React.FC = () => {
  const router=useRouter();
  const handleSignin=()=>{
    router.push("/sign-in");
  }
  return (
    <section className="class container" id="class">
      <h2 className="heading">Class</h2>
      <div className="class-data">
        <h3>Get your class notes</h3>
        {/* <Link href="/sign-in">
          CLASS
          <i className='bx bx-chalkboard'></i>
        </Link> */}
        <button className="btn1" onClick={handleSignin}>CLASS <i className='bx bx-chalkboard'></i></button>
      </div>
    </section>
  );
};

export default ClassesSection;