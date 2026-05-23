/*
Sacred Editorial Modernism direction for this page:
Warm parchment surfaces, olive shadows, antique-gold accents, editorial asymmetry, scripture-card layering, and calm devotional interactions.
When editing this file, ask: Does this choice reinforce or dilute the reverent journal-library feeling?
*/

import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  CheckCircle2,
  Feather,
  Heart,
  Library,
  LogIn,
  PenLine,
  Plus,
  ScrollText,
  Sparkles,
  UserPlus,
} from "lucide-react";

const heroImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663625299718/hPVuwR9yLCeuF9Akyv3K5i/faithflow-open-journal-hero-VrSvjFyg2VMjcfmfYxEdNe.webp";
const scriptureImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663625299718/hPVuwR9yLCeuF9Akyv3K5i/scripture-library-cards-Fo8vBYt5TYgpDt9USgXoM6.webp";
const prayerImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663625299718/hPVuwR9yLCeuF9Akyv3K5i/prayer-answered-cards-ScRGybaGnc69kv8f4As8vy.webp";
const momentsImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663625299718/hPVuwR9yLCeuF9Akyv3K5i/god-moments-window-btm5maNum9hvJJgoPvBUEr.webp";

const scriptureCategories = [
  "Love",
  "Hope",
  "Faith",
  "Healing",
  "Signs and Wonders",
  "Salvation",
  "My Identity in Christ",
  "Dreams",
  "Unusual Depths of God",
  "Spiritual Warfare",
  "Prayer",
  "Wisdom",
  "Success",
  "Prosperity",
  "Vision",
  "Authority",
  "Supernatural",
  "Relationships",
  "Consecration",
  "Praise",
];

type PrayerKind = "Prayer Request" | "Question for the Holy Spirit";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function goToAuth() {
  window.location.href = getLoginUrl();
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const journalQuery = trpc.journal.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createEntry = trpc.journal.create.useMutation({
    onSuccess: async () => {
      await utils.journal.list.invalidate();
    },
  });
  const setPrayerAnswered = trpc.journal.setPrayerAnswered.useMutation({
    onSuccess: async () => {
      await utils.journal.list.invalidate();
    },
  });

  const [gratitudeText, setGratitudeText] = useState("");
  const [scriptureForm, setScriptureForm] = useState({
    category: "Love",
    reference: "",
    verse: "",
    note: "",
  });
  const [prayerForm, setPrayerForm] = useState({
    kind: "Prayer Request" as PrayerKind,
    title: "",
    details: "",
  });
  const [momentForm, setMomentForm] = useState({
    title: "",
    details: "",
  });
  const [journalNotice, setJournalNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const journalEntries = journalQuery.data ?? [];
  const gratitudeEntries = journalEntries.filter((entry) => entry.entryType === "gratitude");
  const scriptureEntries = journalEntries.filter((entry) => entry.entryType === "scripture");
  const prayerEntries = journalEntries.filter((entry) => entry.entryType === "prayer");
  const godMoments = journalEntries.filter((entry) => entry.entryType === "moment");
  const formsDisabled = !isAuthenticated || createEntry.isPending || setPrayerAnswered.isPending;

  const stats = useMemo(
    () => [
      { label: "gratitude entries", value: gratitudeEntries.length },
      { label: "scriptures saved", value: scriptureEntries.length },
      { label: "answered prayers", value: prayerEntries.filter((entry) => entry.answered).length },
      { label: "God moments", value: godMoments.length },
    ],
    [godMoments.length, gratitudeEntries.length, prayerEntries, scriptureEntries.length],
  );

  const categoryCounts = useMemo(() => {
    return scriptureCategories.map((category) => ({
      category,
      count: scriptureEntries.filter((entry) => entry.category === category).length,
    }));
  }, [scriptureEntries]);

  async function addGratitude() {
    const text = gratitudeText.trim();
    if (!text || !isAuthenticated) return;

    try {
      setJournalNotice(null);
      await createEntry.mutateAsync({
        entryType: "gratitude",
        entryDate: today(),
        text,
      });
      setGratitudeText("");
      setJournalNotice({ kind: "success", text: "Your gratitude entry was saved to your private journal." });
    } catch {
      setJournalNotice({ kind: "error", text: "Your gratitude entry could not be saved. Please try again." });
    }
  }

  async function addScripture() {
    const reference = scriptureForm.reference.trim();
    const verse = scriptureForm.verse.trim();
    if (!reference || !verse || !isAuthenticated) return;

    try {
      setJournalNotice(null);
      await createEntry.mutateAsync({
        entryType: "scripture",
        entryDate: today(),
        category: scriptureForm.category,
        reference,
        verse,
        note: scriptureForm.note.trim(),
      });
      setScriptureForm({ category: scriptureForm.category, reference: "", verse: "", note: "" });
      setJournalNotice({ kind: "success", text: "Your scripture was added to your private library." });
    } catch {
      setJournalNotice({ kind: "error", text: "Your scripture could not be saved. Please try again." });
    }
  }

  async function addPrayer() {
    const title = prayerForm.title.trim();
    if (!title || !isAuthenticated) return;

    try {
      setJournalNotice(null);
      await createEntry.mutateAsync({
        entryType: "prayer",
        entryDate: today(),
        prayerKind: prayerForm.kind,
        title,
        details: prayerForm.details.trim(),
      });
      setPrayerForm({ kind: prayerForm.kind, title: "", details: "" });
      setJournalNotice({ kind: "success", text: "Your prayer entry was saved." });
    } catch {
      setJournalNotice({ kind: "error", text: "Your prayer entry could not be saved. Please try again." });
    }
  }

  async function addMoment() {
    const title = momentForm.title.trim();
    const details = momentForm.details.trim();
    if (!title || !details || !isAuthenticated) return;

    try {
      setJournalNotice(null);
      await createEntry.mutateAsync({
        entryType: "moment",
        entryDate: today(),
        title,
        details,
      });
      setMomentForm({ title: "", details: "" });
      setJournalNotice({ kind: "success", text: "Your God moment was saved." });
    } catch {
      setJournalNotice({ kind: "error", text: "Your God moment could not be saved. Please try again." });
    }
  }

  async function toggleAnswered(id: number, answered: boolean) {
    if (!isAuthenticated) return;

    try {
      setJournalNotice(null);
      await setPrayerAnswered.mutateAsync({ id, answered: !answered });
      setJournalNotice({ kind: "success", text: answered ? "Prayer moved back to waiting." : "Prayer marked as answered." });
    } catch {
      setJournalNotice({ kind: "error", text: "The prayer status could not be updated. Please try again." });
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="FaithFlow Journal home">
          <span>FF</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#gratitude">Gratitude</a>
          <a href="#scriptures">Scriptures</a>
          <a href="#prayer">Prayer</a>
          <a href="#moments">God Moments</a>
          <a href="/daily">Daily Devotional</a>
        </nav>
        <div className="auth-actions" aria-label="Account actions">
          {loading ? (
            <span className="user-pill">Checking account...</span>
          ) : isAuthenticated ? (
            <>
              <span className="user-pill">Signed in as {user?.name ?? "Friend"}</span>
              <button className="auth-link" type="button" onClick={() => void logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="auth-link primary-auth" type="button" onClick={goToAuth}>
                <UserPlus size={15} /> Sign up
              </button>
              <button className="auth-link" type="button" onClick={goToAuth}>
                <LogIn size={15} /> Log in
              </button>
            </>
          )}
        </div>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy reveal-up">
            <p className="eyebrow"><Sparkles size={16} /> FaithFlow Journal</p>
            <h1 id="hero-title">Build a living archive of gratitude, scripture, prayer, and God’s faithfulness.</h1>
            <p className="hero-lede">
              Create an account to keep your gratitude, scripture library, prayer requests, questions, and God moments private to you.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <a className="primary-link" href="#gratitude">Begin today’s entry</a>
              ) : (
                <button className="primary-link button-reset" type="button" onClick={goToAuth}>Create your account</button>
              )}
              <a className="secondary-link" href="#scriptures">Open scripture library</a>
            </div>
          </div>

          <aside className="hero-image-card reveal-up" aria-label="Open devotional journal image">
            <img src={heroImage} alt="Open journal and Bible in warm morning light" />
            <div className="floating-note">
              <span>{isAuthenticated ? "Private journal" : "Account ready"}</span>
              <strong>{isAuthenticated ? "Your entries are connected to your account." : "Sign up or log in to save your entries."}</strong>
            </div>
          </aside>
        </section>

        {!isAuthenticated && !loading && (
          <section className="auth-banner" aria-label="Account reminder">
            <div>
              <p className="eyebrow">Private devotional space</p>
              <h2>Sign up or log in before you start journaling.</h2>
              <p>
                Your account lets the site keep each person’s gratitude entries, scriptures, prayers, and God moments separate.
              </p>
            </div>
            <button className="ink-button" type="button" onClick={goToAuth}>Create account or log in</button>
          </section>
        )}

        {isAuthenticated && (journalQuery.isLoading || setPrayerAnswered.isPending || journalQuery.error || journalNotice) && (
          <section
            className={journalNotice?.kind === "error" || journalQuery.error ? "journal-status error" : "journal-status"}
            aria-live="polite"
          >
            {journalQuery.isLoading
              ? "Loading your private FaithFlow entries..."
              : setPrayerAnswered.isPending
                ? "Updating your prayer status..."
                : journalQuery.error
                  ? "Your journal entries could not be loaded. Please refresh or try again."
                  : journalNotice?.text}
          </section>
        )}

        <section className="stats-strip" aria-label="Journal summary">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className="section-shell gratitude-layout" id="gratitude" aria-labelledby="gratitude-title">
          <div className="section-intro">
            <p className="eyebrow"><Heart size={15} /> Daily gratitude</p>
            <h2 id="gratitude-title">Start with thanksgiving.</h2>
            <p>
              Use this space to build the daily habit of recognizing God’s kindness, provision, protection, correction, and grace.
              Signed-in entries are saved to your private account.
            </p>
          </div>
          <div className="journal-panel">
            <label htmlFor="gratitude-entry">What are you grateful for today?</label>
            <textarea
              id="gratitude-entry"
              value={gratitudeText}
              onChange={(event) => setGratitudeText(event.target.value)}
              placeholder={isAuthenticated ? "Lord, thank You for..." : "Sign up or log in to save gratitude entries."}
              disabled={formsDisabled}
            />
            <button className="ink-button" type="button" onClick={addGratitude} disabled={formsDisabled}>
              <Plus size={17} /> {createEntry.isPending ? "Saving..." : "Save gratitude"}
            </button>
          </div>
          <div className="entry-stack">
            {gratitudeEntries.slice(0, 3).map((entry) => (
              <article className="lined-card" key={entry.id}>
                <time>{entry.entryDate}</time>
                <p>{entry.text}</p>
              </article>
            ))}
            {isAuthenticated && !journalQuery.isLoading && gratitudeEntries.length === 0 && (
              <article className="empty-card">Your first gratitude entry will appear here.</article>
            )}
          </div>
        </section>

        <section className="image-feature" aria-label="Scripture library feature image">
          <img src={scriptureImage} alt="Layered scripture library cards and study Bible" />
          <div>
            <p className="eyebrow"><Library size={15} /> Personal word library</p>
            <h2>Collect the scriptures that speak to you as you study.</h2>
            <p>The goal is not just storage. It is a searchable personal testimony of how the Word has met you in real seasons.</p>
          </div>
        </section>

        <section className="section-shell scripture-layout" id="scriptures" aria-labelledby="scriptures-title">
          <div className="section-intro wide">
            <p className="eyebrow"><BookOpen size={15} /> Scripture archive</p>
            <h2 id="scriptures-title">Record verses by spiritual theme.</h2>
            <p>Save verses into categories such as love, hope, faith, healing, identity in Christ, spiritual warfare, wisdom, authority, consecration, praise, and more.</p>
          </div>

          <div className="scripture-form journal-panel">
            <label htmlFor="category">Category</label>
            <select id="category" value={scriptureForm.category} onChange={(event) => setScriptureForm({ ...scriptureForm, category: event.target.value })} disabled={formsDisabled}>
              {scriptureCategories.map((category) => (<option key={category} value={category}>{category}</option>))}
            </select>
            <label htmlFor="reference">Scripture reference</label>
            <input id="reference" value={scriptureForm.reference} onChange={(event) => setScriptureForm({ ...scriptureForm, reference: event.target.value })} placeholder="Romans 8:37" disabled={formsDisabled} />
            <label htmlFor="verse">Verse text</label>
            <textarea id="verse" value={scriptureForm.verse} onChange={(event) => setScriptureForm({ ...scriptureForm, verse: event.target.value })} placeholder="Write the scripture here..." disabled={formsDisabled} />
            <label htmlFor="note">Why did this speak to you?</label>
            <textarea id="note" value={scriptureForm.note} onChange={(event) => setScriptureForm({ ...scriptureForm, note: event.target.value })} placeholder="This stood out because..." disabled={formsDisabled} />
            <button className="ink-button" type="button" onClick={addScripture} disabled={formsDisabled}>
              <Feather size={17} /> {createEntry.isPending ? "Saving..." : "Add scripture"}
            </button>
          </div>

          <div className="category-cloud" aria-label="Scripture categories">
            {categoryCounts.map(({ category, count }) => (
              <span key={category} className={count > 0 ? "category-chip active" : "category-chip"}>{category} <b>{count}</b></span>
            ))}
          </div>

          <div className="scripture-cards">
            {scriptureEntries.slice(0, 4).map((entry) => (
              <article className="scripture-card" key={entry.id}>
                <span>{entry.category}</span>
                <h3>{entry.reference}</h3>
                <blockquote>{entry.verse}</blockquote>
                {entry.note && <p>{entry.note}</p>}
              </article>
            ))}
            {isAuthenticated && !journalQuery.isLoading && scriptureEntries.length === 0 && (
              <article className="empty-card">Your saved scriptures will appear here.</article>
            )}
          </div>
        </section>

        <section className="split-showcase" id="prayer" aria-labelledby="prayer-title">
          <div className="showcase-image"><img src={prayerImage} alt="Prayer cards with a check mark beside candlelight" /></div>
          <div className="showcase-content">
            <p className="eyebrow"><ScrollText size={15} /> Prayer and questions</p>
            <h2 id="prayer-title">Track requests, questions, and answered prayers.</h2>
            <p>Record what you are bringing before the Lord, including questions you are asking the Holy Spirit. Mark them answered when you see clarity, provision, confirmation, or breakthrough.</p>
            <div className="journal-panel compact-panel">
              <label htmlFor="prayer-kind">Entry type</label>
              <select id="prayer-kind" value={prayerForm.kind} onChange={(event) => setPrayerForm({ ...prayerForm, kind: event.target.value as PrayerKind })} disabled={formsDisabled}>
                <option value="Prayer Request">Prayer Request</option>
                <option value="Question for the Holy Spirit">Question for the Holy Spirit</option>
              </select>
              <label htmlFor="prayer-title-input">Title</label>
              <input id="prayer-title-input" value={prayerForm.title} onChange={(event) => setPrayerForm({ ...prayerForm, title: event.target.value })} placeholder="Healing for a loved one" disabled={formsDisabled} />
              <label htmlFor="prayer-details">Details</label>
              <textarea id="prayer-details" value={prayerForm.details} onChange={(event) => setPrayerForm({ ...prayerForm, details: event.target.value })} placeholder="What are you asking, waiting for, or discerning?" disabled={formsDisabled} />
              <button className="ink-button" type="button" onClick={addPrayer} disabled={formsDisabled}>
                <Plus size={17} /> {createEntry.isPending ? "Saving..." : "Save request"}
              </button>
            </div>
          </div>
        </section>

        <section className="answered-board" aria-label="Prayer request list">
          {prayerEntries.map((entry) => (
            <article className={entry.answered ? "prayer-card answered" : "prayer-card"} key={entry.id}>
              <div>
                <span>{entry.prayerKind}</span>
                <h3>{entry.title}</h3>
                <p>{entry.details}</p>
              </div>
              <button type="button" onClick={() => toggleAnswered(entry.id, entry.answered)} disabled={formsDisabled}>
                <CheckCircle2 size={18} /> {setPrayerAnswered.isPending ? "Updating..." : entry.answered ? "Answered" : "Mark answered"}
              </button>
            </article>
          ))}
          {isAuthenticated && !journalQuery.isLoading && prayerEntries.length === 0 && (
            <article className="empty-card">Prayer requests and Holy Spirit questions will appear here.</article>
          )}
        </section>

        <section className="section-shell moments-layout" id="moments" aria-labelledby="moments-title">
          <div className="moment-copy">
            <p className="eyebrow"><PenLine size={15} /> Experiences with God</p>
            <h2 id="moments-title">Write down where you clearly see God working.</h2>
            <p>These entries help you remember patterns of God’s faithfulness: timely conversations, answered prayers, unusual peace, supernatural provision, dreams, conviction, protection, and daily evidence of His hand.</p>
          </div>
          <div className="moment-image"><img src={momentsImage} alt="Open journal by a sunlit window" /></div>
          <div className="journal-panel moment-form">
            <label htmlFor="moment-title">Moment title</label>
            <input id="moment-title" value={momentForm.title} onChange={(event) => setMomentForm({ ...momentForm, title: event.target.value })} placeholder="God opened a door" disabled={formsDisabled} />
            <label htmlFor="moment-details">What happened?</label>
            <textarea id="moment-details" value={momentForm.details} onChange={(event) => setMomentForm({ ...momentForm, details: event.target.value })} placeholder="Describe the moment clearly so you can remember it later..." disabled={formsDisabled} />
            <button className="ink-button" type="button" onClick={addMoment} disabled={formsDisabled}>
              <Plus size={17} /> {createEntry.isPending ? "Saving..." : "Save God moment"}
            </button>
          </div>
          <div className="entry-stack moment-list">
            {godMoments.slice(0, 3).map((entry) => (
              <article className="lined-card" key={entry.id}>
                <time>{entry.entryDate}</time>
                <h3>{entry.title}</h3>
                <p>{entry.details}</p>
              </article>
            ))}
            {isAuthenticated && !journalQuery.isLoading && godMoments.length === 0 && (
              <article className="empty-card">Your God moments will appear here.</article>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>FaithFlow Journal</p>
        <span>A portfolio-ready Christian web app concept built around remembrance, scripture, prayer, and private accounts.</span>
      </footer>
    </div>
  );
}
