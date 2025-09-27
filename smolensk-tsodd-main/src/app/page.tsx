'use client';

import React from 'react';
import {
  HeroSection,
  ServicesSection,
  ProjectsSection,
  AboutSection,
  CTASection
} from '@/shared/components/layout';
import { NewsSection } from '@/features/news';

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <NewsSection />
      <CTASection />
    </>
  );
}