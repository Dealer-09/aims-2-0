import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import AnnouncementBanner from '../components/AnnouncementBanner';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';
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
      <Head>        <title>AIMS - Amit Institute of Math&apos;s and Science | Excellence in Education</title>
        <meta name="description" content="Join AIMS - Amit Institute of Math's and Science for exceptional mathematics and science education. Expert faculty, proven results, and comprehensive learning programs across multiple locations." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="AIMS, mathematics education, science institute, competitive exams, tutoring, Amit Institute, CBSE, ICSE, board exams, physics, chemistry, biology, math coaching" />
        <meta name="author" content="Amit Institute of Math's and Science" />
        <meta property="og:title" content="AIMS - Excellence in Mathematics & Science Education" />
        <meta property="og:description" content="Join AIMS for comprehensive mathematics and science education with expert faculty and proven results." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://aims-education.com" />
        <link rel="shortcut icon" href={acad.src} type="image/x-icon" />      </Head>
      <AnnouncementBanner />
      <Navbar />      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
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