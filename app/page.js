import { PROJECTS } from "@/lib/projects";
import Field from "@/components/field/Field";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import ProjectRail from "@/components/site/ProjectRail";
import CommandPalette from "@/components/site/CommandPalette";
import { About, Contact, Footer, Path, WorkGroup, WorkIntro } from "@/components/site/Sections";
import Skills3D from "@/components/site/Skills3D";
import PhoneScrub from "@/components/showcase/PhoneScrub";
import PhoneDeck from "@/components/showcase/PhoneDeck";
import BrowserScrub from "@/components/showcase/BrowserScrub";
import BrowserFlatten from "@/components/showcase/BrowserFlatten";
import StackPeel from "@/components/showcase/StackPeel";
import WipeReveal from "@/components/showcase/WipeReveal";
import ParticleBoard from "@/components/showcase/ParticleBoard";
import Shutters from "@/components/showcase/Shutters";

const project = (slug) => PROJECTS.find((p) => p.slug === slug);

export default function Home() {
  return (
    <>
      {/* particle field: fixed behind everything, never over the work */}
      <Field />
      <div className="relative z-10">
        <Header />
        <ProjectRail />
        <main id="main">
          <Hero />
          <WorkIntro />
          {/* grouped by type, newest first within each group; each project has
              its own way of being shown */}
          <WorkGroup
            first
            label="Mobile apps"
            title="Native-feel apps, from the first screen to release."
            blurb="Real-time data, maps, payments and push, on iOS and Android."
          />
          <PhoneScrub project={project("karighar")} />
          <PhoneDeck project={project("ifund")} />

          <WorkGroup
            label="Web and SaaS"
            title="Multi-tenant products with billing, admin and AI."
            blurb="Onboarding, subscriptions and analytics, with AI woven into the everyday workflow."
          />
          <BrowserFlatten project={project("atomic-muscles")} />
          <BrowserScrub project={project("obyect")} />
          <StackPeel project={project("subyect")} />
          <WipeReveal project={project("zestlead")} />

          <WorkGroup
            label="Custom software"
            title="Bespoke systems for how a business actually runs."
            blurb="Fleets, facilities and operations: role-based access, real-time dashboards and reporting that replaces the spreadsheets."
          />
          <ParticleBoard project={project("fleet")} />
          <Shutters project={project("facility")} />
          <About />
          <Skills3D />
          <Path />
          <Contact />
        </main>
        <Footer />
      </div>
      <CommandPalette />
    </>
  );
}
