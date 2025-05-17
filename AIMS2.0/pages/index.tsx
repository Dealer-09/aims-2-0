import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import LocationsSection from '../components/LocationsSection';
import ClassesSection from '../components/ClassesSection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import ChatbotSection from '../components/ChatbotSection';
import FooterSection from '../components/FooterSection';
import acad from '../public/img/academic.png';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>AIMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href={acad.src} type="image/x-icon" />
      </Head>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <LocationsSection />
      <ClassesSection />
      <ReviewsSection />
      <ContactSection />
      <ChatbotSection />
      <FooterSection />
    </>
  );
};

export default Home;