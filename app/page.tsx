import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  Users,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCounter } from "@/components/landing/StatCounter";
import { HeroPreview } from "@/components/landing/HeroPreview";

export const metadata = {
  title: "Virtual Health Platform",
  description: "Modern virtual healthcare infrastructure for providers, patients, and healthcare organizations."
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Providers", href: "#providers" },
  { label: "Patients", href: "#patients" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" }
];

const features = [
  {
    title: "Telehealth Video Consultations",
    description: "Secure, high-quality visits with integrated clinical context.",
    icon: Video
  },
  {
    title: "Electronic Health Records",
    description: "Unified longitudinal records with structured workflows.",
    icon: FileText
  },
  {
    title: "Appointment Scheduling",
    description: "Real-time scheduling with automated reminders.",
    icon: CalendarCheck
  },
  {
    title: "Prescription Management",
    description: "Streamlined medication workflows and refills.",
    icon: ClipboardList
  },
  {
    title: "Patient Portal",
    description: "Personalized access to visits, records, and messages.",
    icon: Users
  },
  {
    title: "Provider Dashboard",
    description: "Operational command center for care teams.",
    icon: Stethoscope
  },
  {
    title: "Secure Messaging",
    description: "HIPAA-ready conversations with role-based routing.",
    icon: MessageSquareText
  },
  {
    title: "Billing & Claims",
    description: "Integrated claims workflows and payment capture.",
    icon: CreditCard
  }
];

const providerBenefits = [
  "Manage patients and schedules in one workspace.",
  "Document clinical notes in seconds with smart templates.",
  "Deliver telehealth visits with built-in context."
];

const patientBenefits = [
  "Book appointments in minutes across providers.",
  "View visit history, labs, and prescriptions securely.",
  "Message care teams with confidence and privacy."
];

const orgBenefits = [
  "Unified analytics across service lines.",
  "Compliance-ready access controls and auditing.",
  "Operational automation to reduce overhead."
];

const securityItems = [
  "HIPAA compliant infrastructure",
  "End-to-end data encryption",
  "Audit logging for every workflow",
  "Role-based access controls"
];

const stats = [
  { label: "Active Providers", value: 1240, suffix: "+" },
  { label: "Patients Served", value: 320000, suffix: "+" },
  { label: "Appointments Completed", value: 4800000, suffix: "+" },
  { label: "Countries Supported", value: 18, suffix: "+" }
];

const testimonials = [
  {
    quote:
      "Virtual Health Platform gave us a modern stack overnight. Our providers finally feel in control.",
    name: "Dr. Amara Collins",
    role: "Chief Medical Officer"
  },
  {
    quote:
      "The patient experience is stunning. Bookings, messaging, and follow-ups are seamless.",
    name: "Liam Park",
    role: "Director of Care Operations"
  },
  {
    quote:
      "Security reviews passed in weeks, not months. The audit trails are flawless.",
    name: "Sofia Reyes",
    role: "VP, Compliance"
  }
];

const pricing = [
  {
    name: "Clinic",
    price: "$349",
    caption: "Per provider / month",
    highlights: ["Telehealth suite", "Scheduling + reminders", "Secure messaging"]
  },
  {
    name: "Growth",
    price: "$699",
    caption: "Per provider / month",
    highlights: ["EHR + prescriptions", "Advanced analytics", "Priority onboarding"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    caption: "Tailored for networks",
    highlights: ["Custom workflows", "Dedicated security", "SLA + support"]
  }
];

const footerLinks = [
  "Platform",
  "Features",
  "Security",
  "API",
  "Pricing",
  "Documentation",
  "Support",
  "Contact"
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-32 right-[-10%] h-80 w-80 rounded-full bg-accent/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[20%] h-96 w-96 rounded-full bg-primary/10 blur-[160px]" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card/60 text-sm font-semibold">
              VH
            </span>
            <span className="text-sm font-semibold tracking-[0.2em] text-foreground/70">
              Virtual Health Platform
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.25em] text-foreground/50 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/50">
              Modern SaaS for virtual care
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Modern Virtual Healthcare Infrastructure
            </h1>
            <p className="max-w-xl text-base text-foreground/70">
              Bring telehealth, EHR, billing, and messaging into a single, secure operating system for
              healthcare teams and patients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Provider Login</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.3em] text-foreground/40">
              <span>HIPAA Compliant</span>
              <span>Encrypted Data</span>
              <span>Audit Ready</span>
            </div>
          </div>
          <div className="relative">
            <HeroPreview />
            <div className="absolute -bottom-10 left-1/2 hidden h-16 w-56 -translate-x-1/2 rounded-full bg-card/70 blur-2xl lg:block" />
          </div>
        </section>

        <section id="features" className="space-y-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Platform features</p>
            <h2 className="text-3xl font-semibold">Everything you need to run virtual care</h2>
            <p className="max-w-2xl text-sm text-foreground/60">
              A unified suite for clinical teams, operations, and patients built for compliance and
              scale.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass group rounded-[28px] p-5 transition duration-500 hover:-translate-y-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card/70">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-foreground/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div id="providers" className="glass rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">For Providers</p>
            <h3 className="mt-3 text-xl font-semibold">Clinical control with zero friction</h3>
            <div className="mt-4 space-y-3 text-sm text-foreground/70">
              {providerBenefits.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
          <div id="patients" className="glass rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">For Patients</p>
            <h3 className="mt-3 text-xl font-semibold">Care that feels personal</h3>
            <div className="mt-4 space-y-3 text-sm text-foreground/70">
              {patientBenefits.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
          <div className="glass rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">For Organizations</p>
            <h3 className="mt-3 text-xl font-semibold">Operational excellence at scale</h3>
            <div className="mt-4 space-y-3 text-sm text-foreground/70">
              {orgBenefits.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Security & Compliance</p>
            <h2 className="text-3xl font-semibold">Security you can hand to your compliance team</h2>
            <p className="text-sm text-foreground/70">
              Built for regulated healthcare environments with auditability and encryption at every
              layer.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {securityItems.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-foreground/70">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/70">
                <HeartPulse className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Compliance</p>
                <p className="text-base font-semibold">HIPAA-ready infrastructure</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground/60">
              Multi-tenant isolation, role-based access controls, and continuous monitoring ensure
              every data point is secure.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 text-xs text-foreground/60">
                Encryption: AES-256 at rest, TLS 1.3 in transit
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 text-xs text-foreground/60">
                Audit logs: Immutable tracking across all workflows
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-[32px] p-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-foreground/40">{stat.label}</p>
                <p className="text-3xl font-semibold">
                  <StatCounter value={stat.value} suffix={stat.suffix} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Pricing</p>
            <h2 className="text-3xl font-semibold">Transparent pricing that scales with care</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className="glass rounded-[28px] p-6 transition duration-500 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">{plan.name}</p>
                <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
                <p className="text-xs text-foreground/50">{plan.caption}</p>
                <div className="mt-4 space-y-2 text-sm text-foreground/70">
                  {plan.highlights.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Testimonials</p>
            <h2 className="text-3xl font-semibold">Trusted by modern care teams</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="glass rounded-[28px] p-6">
                <p className="text-sm text-foreground/70">“{testimonial.quote}”</p>
                <p className="mt-6 text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-foreground/50">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-r from-primary/20 via-background/30 to-accent/20 p-10 text-center">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute bottom-6 right-16 h-28 w-28 rounded-full bg-accent/40 blur-3xl" />
          </div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Launch care at scale</p>
            <h2 className="text-3xl font-semibold">Ready to transform your virtual health stack?</h2>
            <p className="text-sm text-foreground/70">
              Join leading organizations delivering fast, secure, and human-first care experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">Create an account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold">Virtual Health Platform</p>
            <p className="text-xs text-foreground/60">
              HIPAA compliant virtual care infrastructure for teams that move fast.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-foreground/60">
              <ShieldCheck className="h-3 w-3" />
              HIPAA compliant
            </div>
          </div>
          <div className="grid gap-2 text-xs text-foreground/60 sm:grid-cols-2 lg:grid-cols-4">
            {footerLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl items-center justify-between text-xs text-foreground/40">
          <span>© 2026 Virtual Health Platform. All rights reserved.</span>
          <span>Security-first infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
