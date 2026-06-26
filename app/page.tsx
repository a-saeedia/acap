'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { AboutSection } from '@/components/about-section'
import { QuizSection } from '@/components/quiz-section'
import { ServicesSection } from '@/components/services-section'
import { AmbassadorSection } from '@/components/ambassador-section'
import { FoundersSection } from '@/components/founders-section'
import { FaqSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'

export default function Page() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <Hero onOpenAuth={() => setAuthOpen(true)} />
      <AboutSection />
      <QuizSection onOpenAuth={() => setAuthOpen(true)} />
      <ServicesSection />
      <AmbassadorSection />
      <FoundersSection />
      <FaqSection />
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  )
}
