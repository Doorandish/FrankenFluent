import { useState, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "book"
  | "check"
  | "chevron"
  | "flame"
  | "grid"
  | "headphones"
  | "home"
  | "keyboard"
  | "lock"
  | "mic"
  | "mistakes"
  | "pause"
  | "play"
  | "profile"
  | "replay"
  | "roadmap"
  | "spark"
  | "speaker"
  | "target"
  | "trend";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="m15 18-6-6 6-6" />,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    flame: <><path d="M12 22c4.4 0 7-3.1 7-7.1 0-2.5-1.3-5.4-3.8-8.7-.3 2.5-1.7 3.5-2.7 4.1.2-3.8-2-6.4-4.1-8.3.1 3.6-3.4 5.8-3.4 10.9C5 18.1 8.1 22 12 22Z" /><path d="M9.5 17.2c0-1.7 1.2-2.8 2.6-4.3.2 1.5 1.3 2.3 1.7 3.3.8 2-1 3.3-2.1 3.3-1.2 0-2.2-.9-2.2-2.3Z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M18 19h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5a2 2 0 0 1-2 2ZM6 19H5a2 2 0 0 1-2-2v-5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2Z" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 13h.01M11 13h.01M15 13h.01M18 13h.01M7 16h10" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" /></>,
    mistakes: <><path d="M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" /><path d="M16 3a2.1 2.1 0 0 1 3 3L11 14l-4 1 1-4Z" /></>,
    pause: <><path d="M9 8v8M15 8v8" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    replay: <><path d="m3 12 3-3 3 3" /><path d="M6 9a7 7 0 1 1 1 7.8" /></>,
    roadmap: <><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><path d="M8.5 16.5c2-1 1.5-4 3.5-5s3.5.5 4.5-3" /></>,
    spark: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9Z" /><path d="m5 15 .7 2.3L8 18.5l-2.3 1.2L5 22l-.7-2.3L2 18.5l2.3-1.2Z" /></>,
    speaker: <><path d="M11 5 6 9H2v6h4l5 4Z" /><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m15 9 6-6M16 3h5v5" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Pressable({
  children,
  className = "",
  onClick,
  label,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <div className={`pressable ${className}`} onClick={onClick} role="button" tabIndex={0} aria-label={label} onKeyDown={(event) => event.key === "Enter" && onClick?.()}>
      {children}
    </div>
  );
}

const stats = [
  { icon: "trend" as IconName, value: "72", label: "Fluency score", note: "+4 this week", tone: "mint" },
  { icon: "grid" as IconName, value: "18", label: "Scenarios", note: "6 this month", tone: "blue" },
  { icon: "mistakes" as IconName, value: "24", label: "Mistakes saved", note: "8 mastered", tone: "coral" },
  { icon: "target" as IconName, value: "68%", label: "A2 progress", note: "12 goals left", tone: "purple" },
];

function Header() {
  return (
    <div className="home-header">
      <div className="avatar">
        <span>MK</span>
        <i />
      </div>
      <div className="header-chips">
        <div className="status-chip streak"><Icon name="flame" size={17} /><b>12</b></div>
        <div className="status-chip score"><Icon name="spark" size={16} /><b>72</b></div>
        <div className="status-chip level"><b>A2</b><Icon name="chevron" size={14} /></div>
      </div>
    </div>
  );
}

function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen home-screen">
      <Header />
      <div className="greeting">
        <p className="eyebrow">GUTEN MORGEN, MIKA</p>
        <p className="display-title">Ready to get <span>fluent?</span></p>
      </div>

      <div className="hero-card">
        <div className="hero-glow" />
        <div className="hero-top">
          <div>
            <div className="mini-label"><Icon name="target" size={15} /> TODAY'S GOAL</div>
            <p className="hero-title">Daily conversation</p>
            <p className="hero-subtitle">Three more talks to keep your streak.</p>
          </div>
          <div className="progress-ring">
            <svg viewBox="0 0 80 80">
              <circle className="ring-track" cx="40" cy="40" r="33" />
              <circle className="ring-value" cx="40" cy="40" r="33" />
            </svg>
            <div><b>2</b><span>/5</span></div>
          </div>
        </div>
        <Pressable className="primary-cta" onClick={onStart}>
          <span className="cta-icon"><Icon name="mic" size={20} /></span>
          <span>Start speaking</span>
          <Icon name="chevron" size={20} />
        </Pressable>
      </div>

      <div className="section-heading">
        <p>YOUR PROGRESS</p>
        <span>This week</span>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.tone}`}><Icon name={stat.icon} size={18} /></div>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <p className={`stat-note ${stat.tone}`}>{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="section-heading resume-heading">
        <p>CONTINUE LEARNING</p>
        <span>See all</span>
      </div>
      <Pressable className="resume-card" onClick={onStart}>
        <div className="resume-art">
          <div className="bubble one" />
          <div className="bubble two" />
          <div className="person p1"><span /></div>
          <div className="person p2"><span /></div>
        </div>
        <div className="resume-copy">
          <span>CHAPTER 4 · SOCIAL</span>
          <p>Kennenlernen im Kurs</p>
          <small>4 min · Conversation</small>
        </div>
        <div className="play-button"><Icon name="play" size={17} /></div>
      </Pressable>
    </div>
  );
}

const nodes = [
  { state: "complete", label: "Über mich sprechen", note: "4 scenarios", side: "left" },
  { state: "complete", label: "Meine Familie", note: "3 scenarios", side: "right" },
  { state: "active", label: "Ich und mein Alltag", note: "5 scenarios", side: "left" },
  { state: "locked", label: "Unterwegs", note: "5 scenarios", side: "right" },
  { state: "locked", label: "Freizeit & Pläne", note: "4 scenarios", side: "left" },
];

function RoadmapScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen roadmap-screen">
      <div className="roadmap-header">
        <div>
          <p className="eyebrow">YOUR ROADMAP</p>
          <p className="page-title">Level A2</p>
        </div>
        <div className="level-switch">A2 <Icon name="chevron" size={15} /></div>
      </div>
      <div className="level-progress">
        <div><span>Elementary German</span><b>68%</b></div>
        <div className="progress-track"><i /></div>
      </div>
      <div className="roadmap-path">
        <svg className="path-line" viewBox="0 0 300 560" preserveAspectRatio="none">
          <path d="M88 28 C270 75 267 145 102 180 C-12 205 20 290 190 310 C310 325 280 425 115 448 C22 460 40 520 130 548" />
        </svg>
        {nodes.map((node, index) => (
          <div className={`path-row ${node.side}`} key={node.label}>
            <div className={`path-node ${node.state}`}>
              {node.state === "complete" ? <Icon name="check" size={25} /> : node.state === "locked" ? <Icon name="lock" size={20} /> : <Icon name="play" size={23} />}
              {node.state === "active" && <i />}
            </div>
            <div className="node-label">
              <small>{index === 2 ? "CURRENT CHAPTER" : `CHAPTER ${index + 1}`}</small>
              <p>{node.label}</p>
              <span>{node.note}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="milestone-sheet">
        <div className="sheet-handle" />
        <div className="milestone-top">
          <div className="milestone-icon"><Icon name="spark" size={22} /></div>
          <div><span>CHAPTER 3</span><p>Ich und mein Alltag</p></div>
          <div className="xp-pill">+120 XP</div>
        </div>
        <p className="sheet-description">Talk naturally about your routines, work, and plans.</p>
        <div className="goal-row">
          <div><Icon name="book" size={17} /><span><b>12</b> Redemittel</span></div>
          <div><Icon name="target" size={17} /><span><b>5</b> goals</span></div>
        </div>
        <Pressable className="primary-cta compact" onClick={onStart}>
          <span>Begin scenario</span><Icon name="chevron" size={19} />
        </Pressable>
      </div>
    </div>
  );
}

function VoiceScreen({ onBack }: { onBack: () => void }) {
  const [listening, setListening] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  return (
    <div className="screen voice-screen">
      <div className="voice-header">
        <Pressable className="icon-control" onClick={onBack} label="Go back"><Icon name="arrow" /></Pressable>
        <div><span>Kennenlernen</span><small>STEP 2 OF 5</small></div>
        <Pressable className="end-session" onClick={onBack}>End</Pressable>
      </div>
      <div className="step-track"><i /></div>
      <div className="phrase-drawer">
        <div className="phrase-title"><span><Icon name="spark" size={15} /> KEY PHRASES</span><small>2 OF 4 USED</small></div>
        <div className="phrase-scroll">
          <span className="used"><Icon name="check" size={13} /> Ich heiße...</span>
          <span>Wo wohnen Sie?</span>
          <span>Freut mich</span>
        </div>
      </div>
      <div className="chat-stream">
        <div className="time-stamp">10:42 · LIVE CONVERSATION</div>
        <div className="ai-row">
          <div className="ai-avatar"><Icon name="spark" size={17} /></div>
          <div className="message-wrap">
            <div className="speaker-label">FRANKIE · AI TUTOR</div>
            <div className="ai-bubble">
              <p>Hallo! Ich heiße Frankie. Wie heißen Sie und woher kommen Sie?</p>
              <Pressable className="audio-control"><Icon name="speaker" size={17} /></Pressable>
            </div>
          </div>
        </div>
        <div className="user-row">
          <div className="user-bubble">Hallo Frankie! Ich heiße Mika und ich komme aus London. Ich wohne Berlin.</div>
          <span className="delivered"><Icon name="check" size={12} /> Transcribed</span>
        </div>
        <div className="ai-row feedback-row">
          <div className="ai-avatar correction"><Icon name="spark" size={17} /></div>
          <div className="message-wrap">
            <div className="ai-bubble response">
              <p>Sehr schön, Mika! Fast perfekt.</p>
              <Pressable className="audio-control"><Icon name="speaker" size={17} /></Pressable>
            </div>
            <Pressable className="feedback-card" onClick={() => setFeedbackOpen(!feedbackOpen)}>
              <div className="feedback-title">
                <div><Icon name="spark" size={16} /><span>QUICK CORRECTION</span></div>
                <Icon name="chevron" size={16} />
              </div>
              {feedbackOpen && (
                <div className="feedback-content">
                  <div className="correction-line wrong"><span>MISTAKE</span><p>Ich wohne Berlin.</p></div>
                  <div className="correction-line right"><span>CORRECT</span><p>Ich wohne <b>in</b> Berlin.</p></div>
                  <div className="grammar-tip"><b>TIP</b><p>Use <strong>in</strong> before a city when saying where you live.</p></div>
                </div>
              )}
            </Pressable>
          </div>
        </div>
      </div>
      <div className="voice-actions">
        <Pressable className="side-action"><Icon name="keyboard" size={20} /></Pressable>
        <div className="live-control-wrap">
          <div className={`pulse-ring ${listening ? "active" : ""}`} />
          <Pressable className={`live-control ${listening ? "listening" : ""}`} onClick={() => setListening(!listening)}>
            <div className="waveform">{[1, 2, 3, 4, 5].map((bar) => <i key={bar} />)}</div>
          </Pressable>
          <span>{listening ? "LISTENING..." : "TAP TO SPEAK"}</span>
        </div>
        <Pressable className="side-action"><Icon name="replay" size={20} /></Pressable>
      </div>
    </div>
  );
}

const mistakes = [
  {
    type: "GRAMMAR",
    wrong: "Ich wohne Berlin.",
    right: "Ich wohne in Berlin.",
    rule: "Use “in” before a city when saying where someone lives.",
    context: "Kennenlernen",
  },
  {
    type: "WORD ORDER",
    wrong: "Am Montag ich arbeite.",
    right: "Am Montag arbeite ich.",
    rule: "When time comes first, the verb stays in position two.",
    context: "Mein Alltag",
  },
  {
    type: "VOCABULARY",
    wrong: "Ich mache eine Pause ein.",
    right: "Ich mache eine Pause.",
    rule: "The phrase “eine Pause machen” does not use a separable prefix.",
    context: "Im Büro",
  },
];

function MistakesScreen({ onPractice }: { onPractice: () => void }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Grammar", "Vocabulary", "Word Order"];
  return (
    <div className="screen mistakes-screen">
      <div className="mistakes-header">
        <div><p className="eyebrow">PERSONAL REVIEW</p><p className="page-title">Mistakes ledger</p></div>
        <div className="mastery"><b>8</b><span>MASTERED</span></div>
      </div>
      <div className="review-summary">
        <div className="summary-icon"><Icon name="trend" size={23} /></div>
        <div><p>You’re improving fast</p><span>8 of 24 mistakes mastered this week</span></div>
        <b>33%</b>
      </div>
      <div className="filter-row">
        {filters.map((item) => (
          <Pressable key={item} className={`filter-pill ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</Pressable>
        ))}
      </div>
      <div className="mistake-count"><span>{filter === "All" ? 16 : filter === "Grammar" ? 7 : 4} TO REVIEW</span><small>Newest first</small></div>
      <div className="mistake-list">
        {mistakes.filter((mistake) => filter === "All" || mistake.type === filter.toUpperCase()).map((mistake, index) => (
          <div className="mistake-card" key={mistake.wrong}>
            <div className="card-topline">
              <span className={`type-tag type-${index}`}>{mistake.type}</span>
              <small>{mistake.context} · 2d ago</small>
            </div>
            <div className="language-row wrong">
              <span>YOU SAID</span>
              <p>{mistake.wrong}</p>
            </div>
            <div className="language-row right">
              <span>NATIVE CORRECTION</span>
              <p>{mistake.right}</p>
            </div>
            <div className="rule-box"><Icon name="spark" size={15} /><p>{mistake.rule}</p></div>
            <Pressable className="practice-action" onClick={onPractice}><Icon name="mic" size={16} /><span>Practice again</span><Icon name="chevron" size={16} /></Pressable>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="screen profile-screen">
      <div className="profile-hero">
        <div className="large-avatar">MK<i /></div>
        <p className="page-title">Mika Keller</p>
        <span>German learner · London</span>
      </div>
      <div className="profile-level"><div><span>Current level</span><b>A2 · Elementary</b></div><strong>68%</strong></div>
      <div className="profile-grid">
        <div><b>12</b><span>day streak</span></div>
        <div><b>1,840</b><span>total XP</span></div>
        <div><b>18</b><span>scenarios</span></div>
      </div>
      <div className="achievement-card"><div><Icon name="flame" size={24} /></div><span><b>On fire</b>Complete one more talk to beat your best streak.</span></div>
    </div>
  );
}

const navItems: { id: string; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "roadmap", label: "Roadmap", icon: "roadmap" },
  { id: "mistakes", label: "Mistakes", icon: "mistakes" },
  { id: "profile", label: "Profile", icon: "profile" },
];

function BottomNav({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Pressable key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => onChange(item.id)}>
          <div><Icon name={item.icon} size={21} />{active === item.id && <i />}</div>
          <span>{item.label}</span>
        </Pressable>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const goLive = () => setScreen("voice");
  return (
    <main className="app-stage">
      <div className="phone-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {screen === "home" && <HomeScreen onStart={goLive} />}
        {screen === "roadmap" && <RoadmapScreen onStart={goLive} />}
        {screen === "mistakes" && <MistakesScreen onPractice={goLive} />}
        {screen === "profile" && <ProfileScreen />}
        {screen === "voice" && <VoiceScreen onBack={() => setScreen("home")} />}
        {screen !== "voice" && <BottomNav active={screen} onChange={setScreen} />}
      </div>
    </main>
  );
}
