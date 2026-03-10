// import { Navbar } from "@/components/navbar"; // From previous step
// import { Hero } from "@/components/hero";
// import { ScienceSection } from "@/components/science";
// import { Benefits } from "@/components/benefits";
// import { ContactForm } from "@/components/contact-form";

import { SpearHeadMedical } from "./(sections)/SpearheadMedical";
import { Product } from "./(sections)/Product";
import { Hero } from "./(sections)/Hero";
import { Navbar } from "./(sections)/Navbar";
import { Footer } from "./(sections)/Footer";

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Navbar />
      <Hero />
      <Product />
      {/* <SpearHeadMedical /> */}
      {/* <ContactForm /> */}
     <Footer/>
    </main>
  );
}