import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Target, Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | CMS 3.0",
  description:
    "Learn more about our mission, vision, and the team behind CMS 3.0.",
};

const STATS = [
  { label: "Active Users", value: "50K+" },
  { label: "Articles Published", value: "10,000+" },
  { label: "Countries Global Reach", value: "120+" },
  { label: "Team Members", value: "25+" },
];

const FAQS = [
  {
    question: "What is CMS 3.0?",
    answer:
      "CMS 3.0 is a modern, blazing-fast content management system and blogging platform engineered to deliver the best reading and writing experience. We leverage cutting-edge technologies like Next.js, React, and MongoDB to ensure unmatched performance and aesthetic appeal.",
  },
  {
    question: "Who is this platform for?",
    answer:
      "Our platform is designed for passionate writers, developers, readers, and creators who want a seamless, distraction-free environment to share their thoughts, tutorials, and stories with a global audience.",
  },
  {
    question: "How do you ensure content quality?",
    answer:
      "We have a dedicated team of editors and advanced automated moderation tools. Furthermore, our community-driven upvote and reporting systems help cultivate an ecosystem of high-quality, valuable content.",
  },
  {
    question: "Are there premium features?",
    answer:
      "While our core blogging and reading features are completely free, we do offer premium features for advanced creators, such as deeper analytics, custom domain mapping, and exclusive themes. Please check our pricing page for more details.",
  },
];

const VALUES = [
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "Mission-Driven",
    description:
      "We focus on solving real problems for writers and readers, ensuring every feature adds tangible value.",
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Unmatched Speed",
    description:
      "Performance is a feature. We engineer every component to be lightning-fast, respecting your time.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Privacy First",
    description:
      "Your data is yours. We implement industry-leading security practices to protect your information and content.",
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Community Centric",
    description:
      "Everything we build is designed to foster a healthy, engaging, and supportive community.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full flex justify-center pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
            Empowering <span className="text-primary">Creators</span>,{" "}
            <br className="hidden md:block" />
            Inspiring Readers.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            We are building the next generation of content distribution. A place
            where aesthetic design meets blazing-fast performance.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-4xl border-t border-b py-8 border-border/50 bg-background/50 backdrop-blur-sm rounded-2xl shadow-sm">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 relative">
                <span className="text-3xl md:text-4xl font-black text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                {i < STATS.length - 1 && (
                  <div className="hidden md:block absolute right-[-1.5rem] top-1/2 -translate-y-1/2 w-[1px] h-12 bg-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our product development and community
              guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUES.map((value, idx) => (
              <div
                key={idx}
                className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Details / FAQ Section with Shadcn Accordion */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              More Details & FAQs
            </h2>
            <p className="text-muted-foreground">
              Everything else you might want to know about our platform.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-muted/30 border border-border/50 rounded-lg px-6 data-[state=open]:bg-background data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
