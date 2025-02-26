// Step 2: Convert Static HTML to Next.js Components
// - Migrating Navbar, Hero Section, About Section, Locations Section, Classes Section, Reviews Section, Contact Section, Chatbot Section, and Footer Section to Next.js

import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import LocationsSection from '../components/LocationsSection';
import ClassesSection from '../components/ClassesSection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import ChatbotSection from "../components/ChatbotSection";
import FooterSection from '../components/FooterSection';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>AIMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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