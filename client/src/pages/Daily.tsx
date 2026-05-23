import { useMemo } from "react";
import { BookOpen, Calendar, Heart, Sparkles } from "lucide-react";

const devotionalImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663625299718/hPVuwR9yLCeuF9Akyv3K5i/faithflow-open-journal-hero-VrSvjFyg2VMjcfmfYxEdNe.webp";

export default function Daily() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const devotional = useMemo(() => ({
    title: "Walking in Faith",
    scripture: "Hebrews 11:1",
    verse: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
    content: `Faith is not just a feeling; it is a firm foundation. In seasons of uncertainty, we are called to lean not on our own understanding, but on the unwavering promises of God. Today, take a moment to reflect on the areas where you are being called to trust Him more deeply. Remember that He who promised is faithful.`,
    reflection: "What is one step of faith you can take today, even if you can't see the whole path?"
  }), []);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12 text-center reveal-up">
          <p className="eyebrow flex items-center justify-center gap-2 mb-4">
            <Calendar size={16} /> {today}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Daily Devotional</h1>
          <div className="h-1 w-24 bg-[var(--ink)] opacity-20 mx-auto"></div>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <section className="reveal-up">
            <div className="relative mb-8">
              <img 
                src={devotionalImage} 
                alt="Daily Devotional" 
                className="rounded-lg shadow-xl w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-[var(--paper)] p-6 shadow-lg border border-[var(--ink)] border-opacity-10 max-w-[200px]">
                <p className="text-sm italic font-serif">"Notice grace. Record faithfulness."</p>
              </div>
            </div>
          </section>

          <section className="space-y-8 reveal-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-4">
              <p className="eyebrow flex items-center gap-2">
                <BookOpen size={16} /> Scripture
              </p>
              <h2 className="text-2xl font-serif font-bold">{devotional.scripture}</h2>
              <blockquote className="text-xl italic border-l-4 border-[var(--ink)] border-opacity-20 pl-6 py-2">
                "{devotional.verse}"
              </blockquote>
            </div>

            <div className="space-y-4">
              <p className="eyebrow flex items-center gap-2">
                <Sparkles size={16} /> Reflection
              </p>
              <h3 className="text-2xl font-serif font-bold">{devotional.title}</h3>
              <p className="leading-relaxed text-lg opacity-90">
                {devotional.content}
              </p>
            </div>

            <div className="bg-[var(--ink)] bg-opacity-5 p-8 rounded-lg space-y-4">
              <p className="eyebrow flex items-center gap-2">
                <Heart size={16} /> Today's Question
              </p>
              <p className="text-lg font-serif italic">
                {devotional.reflection}
              </p>
            </div>

            <div className="pt-8">
              <a 
                href="/#gratitude" 
                className="primary-link inline-block w-full text-center py-4 rounded-full transition-all hover:scale-[1.02]"
              >
                Record your response in your journal
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
