import React, { useEffect } from 'react';
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
import BackToTop from '../components/BackToTop';
import acad from '../public/img/academic.png';

const Home: React.FC = () => {
  // Add animation classes to sections as they enter viewport
  useEffect(() => {
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
      const sections = document.querySelectorAll('section');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.25, // Trigger when 25% of the element is visible
        rootMargin: '0px'
      });
      
      sections.forEach(section => {
        observer.observe(section);
      });
      
      return () => {
        sections.forEach(section => {
          observer.unobserve(section);
        });
      };
    }
  }, []);

  return (
    <>
      <Head>        <title>AIMS - Amit Institute of Math&apos;s and Science</title>
        <meta name="description" content="Amit Institute of Math&apos;s and Science (AIMS) - Join our premier institute for quality education in mathematics and science." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="AIMS, science institute, mathematics, education, Amit Tiwari" />
        <link rel="shortcut icon" href={acad.src} type="image/x-icon" />
      </Head>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <LocationsSection />
        <ClassesSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <ChatbotSection />
      <FooterSection />
      <BackToTop />
    </>
  );
};

export default Home;