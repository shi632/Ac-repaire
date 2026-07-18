import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
import TrackingPortal from "./components/TrackingPortal";
import Justdial from "./components/Justdial";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import AIChatbot from "./components/AIChatbot";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <Gallery />
      <Faq />
      <Contact />
      <TrackingPortal />
      <Justdial />
      <Footer />
      <FloatingButtons />
      <AIChatbot />
    </main>
  );
}