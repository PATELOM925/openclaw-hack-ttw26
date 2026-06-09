import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  CreditCard,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  WalletCards,
  XCircle
} from "lucide-react";
import { type AskResponse, type Transaction, routes } from "./api";
import { BuyerScreen, SellerScreen } from "./BuyerSeller";
import { loadContextFiles, mergeContext, type AttachedContextFile } from "./contextUploadHelpers";

type Page = "/" | "/broker" | "/buy" | "/sell" | "/capabilities" | "/transactions" | "/reputation" | "/security" | "/proof";

const pages: Array<{ path: Page; label: string }> = [
  { path: "/", label: "Home" },
  { path: "/broker", label: "Broker" },
  { path: "/buy", label: "Buyer" },
  { path: "/sell", label: "Seller" },
  { path: "/transactions", label: "Transactions" },
  { path: "/reputation", label: "Reputation" },
  { path: "/security", label: "Security" },
  { path: "/proof", label: "Proof" }
];

export function App() {
  const [page, setPage] = useState<Page>((window.location.pathname as Page) || "/");

  function navigate(path: Page) {
    window.history.pushState(null, "", path);
    setPage(path);
  }

  useEffect(() => {
    const onPop = () => setPage((window.location.pathname as Page) || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><Compass size={28} /><span>ClawCompass</span></div>
        <nav>
          {pages.map((item) => (
            <button className={page === item.path ? "active" : ""} key={item.path} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        {page === "/" && <HomeScreen navigate={navigate} />}
        {page === "/broker" && <BrokerScreen />}
        {page === "/buy" && <BuyerScreen />}
        {(page === "/sell" || page === "/capabilities") && <SellerScreen />}
        {page === "/transactions" && <TransactionsScreen />}
        {page === "/reputation" && <ReputationScreen />}
        {page === "/security" && <SecurityScreen />}
        {page === "/proof" && <ProofScreen />}
      </main>
    </div>
  );
}

function HomeScreen({ navigate }: { navigate: (path: Page) => void }) {
  const [proof, setProof] = useState<Record<string, { status: string; blocker?: string }>>();

  useEffect(() => {
    routes.proof()
      .then((data) => setProof(data.requiredProof))
      .catch(() => setProof(undefined));
  }, []);

  const proofEntries = proof
    ? Object.entries(proof).slice(0, 5)
    : [
      ["localDemo", { status: "ready" }],
      ["clawUpTelegram", { status: "blocked", blocker: "Pairing proof pending." }],
      ["x402Settlement", { status: "blocked", blocker: "Real settlement proof pending." }],
      ["erc8004", { status: "blocked", blocker: "Mainnet registration pending." }],
      ["scanListing", { status: "blocked", blocker: "8004scan URL pending." }]
    ];

  return (
    <section className="home">
      <div className="homeHero">
        <div className="heroCopy">
          <p className="eyebrow">GOAT/OpenClaw live demo</p>
          <h1>ClawCompass helps agents buy capabilities safely.</h1>
          <p>
            One request becomes recommendation, redaction, x402 payment, guarded execution, and proof.
            The homepage puts the judge-critical story and demo entry points in one place.
          </p>
          <div className="heroActions">
            <button className="primaryAction" onClick={() => navigate("/broker")}><Play size={17} />Run broker demo</button>
            <button onClick={() => navigate("/proof")}><ClipboardCheck size={17} />View proof status</button>
          </div>
        </div>
        <div className="heroSignal" aria-label="ClawCompass workflow">
          <div className="orbitNode task"><Bot size={22} /><span>Task</span></div>
          <div className="orbitNode pay"><CreditCard size={22} /><span>x402</span></div>
          <div className="orbitCore"><Compass size={42} /><strong>Broker</strong></div>
          <div className="orbitNode safe"><ShieldCheck size={22} /><span>Guard</span></div>
          <div className="orbitNode proof"><Trophy size={22} /><span>Proof</span></div>
        </div>
      </div>

      <div className="homeStats" aria-label="Demo summary">
        <MetricCard label="Demo price" value="0.10 USDC" />
        <MetricCard label="Live flow" value="5 moments" />
        <MetricCard label="Judging focus" value="4 criteria" />
        <MetricCard label="Project gates" value="Tracked" />
      </div>

      <section className="homeBand">
        <div>
          <p className="eyebrow">Problem fixed</p>
          <h2>Agents can talk. ClawCompass helps them transact.</h2>
          <p className="sectionLead">
            Before ClawCompass, a builder had to choose tools, decide what context was safe, understand cost,
            pay, run the capability, and prove the result manually.
          </p>
        </div>
        <div className="flowRail">
          {["Ask", "Analyze", "Redact", "Pay", "Execute", "Prove"].map((step) => <span key={step}>{step}</span>)}
        </div>
      </section>

      <div className="homeGrid">
        <section className="homeBlock spanTwo">
          <div className="sectionTitle">
            <Sparkles size={20} />
            <div>
              <p className="eyebrow">Live demo path</p>
              <h2>What judges see on stage</h2>
            </div>
          </div>
          <div className="demoTimeline">
            <DemoStep number="1" title="Self-disclosure" text="The agent explains purpose, commands, inputs, payment limits, and approval boundaries." />
            <DemoStep number="2" title="SetupPilot routing" text="A ClawUp onboarding blocker becomes a recommended paid capability." />
            <DemoStep number="3" title="x402 gate" text="Execution stays blocked while payment is required." />
            <DemoStep number="4" title="Useful result" text="SetupPilot returns a diagnosis, next safe action, and evidence checklist." />
            <DemoStep number="5" title="Risk halt" text="Private-key and on-chain actions require explicit confirmation." />
          </div>
        </section>

        <section className="homeBlock">
          <div className="sectionTitle">
            <Trophy size={20} />
            <div>
              <p className="eyebrow">Judging criteria</p>
              <h2>Scorecard coverage</h2>
            </div>
          </div>
          <ScoreRow percent="35%" title="Market Potential" text="Paid capability runs, seller listings, provider revenue share, private agent marketplaces." />
          <ScoreRow percent="20%" title="UX Mastery" text="Self-disclosure, simple commands, visible context, payment state, next action, proof status." />
          <ScoreRow percent="25%" title="x402 Integration" text="Intent to payment_required to settlement to delivery." />
          <ScoreRow percent="15%" title="Guardrails" text="Redaction, risk classification, confirmation gates, and cancel path." />
        </section>

        <section className="homeBlock">
          <div className="sectionTitle">
            <LockKeyhole size={20} />
            <div>
              <p className="eyebrow">Mandatory gates</p>
              <h2>Submission proof</h2>
            </div>
          </div>
          <GateRow label="ClawUp agent" status="Prepared" />
          <GateRow label="Telegram commands" status="Prepared" />
          <GateRow label="x402 settlement" status="Proof pending" muted />
          <GateRow label="ERC-8004 mainnet" status="Proof pending" muted />
          <GateRow label="8004scan listing" status="Proof pending" muted />
        </section>

        <section className="homeBlock">
          <div className="sectionTitle">
            <Store size={20} />
            <div>
              <p className="eyebrow">Toolchain</p>
              <h2>How the ecosystem is used</h2>
            </div>
          </div>
          <ToolPill name="ClawUp" role="agent channel" />
          <ToolPill name="Telegram" role="commands" />
          <ToolPill name="x402" role="payment gate" />
          <ToolPill name="GOAT Network" role="mainnet rail" />
          <ToolPill name="ERC-8004" role="identity + reputation" />
          <ToolPill name="SetupPilot" role="paid capability" />
        </section>

        <section className="homeBlock">
          <div className="sectionTitle">
            <ClipboardCheck size={20} />
            <div>
              <p className="eyebrow">Public proof status</p>
              <h2>Live vs pending</h2>
            </div>
          </div>
          <div className="proofPreview">
            {proofEntries.map(([key, value]) => (
              <div className="proofItem" key={key}>
                <strong>{formatProofName(key)}</strong>
                <span className={value.status === "ready" ? "ready" : "blocked"}>{value.status}</span>
              </div>
            ))}
          </div>
          <button className="wideAction" onClick={() => navigate("/proof")}>Open proof board <ArrowRight size={16} /></button>
        </section>
      </div>
    </section>
  );
}

function BrokerScreen() {
  const [task, setTask] = useState("I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.");
  const [context, setContext] = useState("");
  const [attachedContext, setAttachedContext] = useState<AttachedContextFile[]>([]);
  const [contextError, setContextError] = useState("");
  const [ask, setAsk] = useState<AskResponse>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [selected, setSelected] = useState("setuppilot");
  const [output, setOutput] = useState<Record<string, unknown>>();
  const [message, setMessage] = useState("");

  const composedContext = useMemo(() => mergeContext(context, attachedContext), [context, attachedContext]);

  async function onUploadContext(event: ChangeEvent<HTMLInputElement>) {
    setContextError("");
    try {
      const loaded = await loadContextFiles(event.target.files);
      setAttachedContext((current) => [...current, ...loaded]);
    } catch (error) {
      setContextError(error instanceof Error ? error.message : "Unable to load context files.");
    } finally {
      event.currentTarget.value = "";
    }
  }

  async function analyze() {
    setMessage("");
    const result = await routes.ask({ task, context: composedContext, budgetUsd: 0.1 });
    setAsk(result);
    setSelected(result.recommendations[0]?.capability.id || "pitchhawk");
  }

  async function useCapability(id = selected) {
    setMessage("");
    const result = await routes.use(id, { task, context: composedContext, requesterAgentId: "web-demo" });
    setTransaction(result.transaction);
    setMessage(result.guardrail.approvalRequired ? "Approval required before payment." : "Payment required via x402.");
  }

  async function refreshPayment() {
    if (!transaction) return;
    const result = await routes.payment(transaction.id);
    setTransaction(result.transaction);
    setMessage(`${result.verification.status}: ${result.verification.reason}`);
  }

  async function demoSettle() {
    if (!transaction) return;
    try {
      const result = await routes.settle(transaction.id, {
        paymentId: "web-demo-payment",
        txHash: "0xwebdemo",
        capabilityId: transaction.capabilityId,
        amount: transaction.amount,
        token: transaction.token,
        chainId: 2345
      });
      setTransaction(result.transaction);
      setMessage(result.note);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  async function execute() {
    if (!transaction) return;
    try {
      const result = await routes.execute(transaction.capabilityId, {
        transactionId: transaction.id,
        task,
        allowedContext: ask?.secureContext.allowedContext || composedContext
      });
      setTransaction(result.transaction);
      setOutput(result.result);
      setMessage("Execution delivered.");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  return (
    <section className="panel">
      <Header icon={<Activity />} title="Capability Broker" subtitle="Analyze, redact, pay, execute, and log reputation from one workflow." />
      <div className="grid two">
        <div className="surface">
          <label>Task</label>
          <textarea wrap="soft" value={task} onChange={(event) => setTask(event.target.value)} />
          <label>Context</label>
          <div className="inline">
            <input
              type="file"
              multiple
              accept=".txt,.md,.markdown,.json,.yaml,.yml,.csv,.toml,.log,.ini,.env,text/plain,application/json"
              onChange={onUploadContext}
            />
          </div>
          {attachedContext.length ? <p className="muted">Using {attachedContext.length} uploaded file(s): {attachedContext.map((item) => item.name).join(", ")}</p> : null}
          {contextError && <p className="notice">{contextError}</p>}
          <textarea wrap="soft" value={context} onChange={(event) => setContext(event.target.value)} />
          <div className="actions">
            <button onClick={analyze}><Compass size={16} />Analyze</button>
            <button onClick={() => useCapability()}><CreditCard size={16} />Use selected</button>
            <button onClick={refreshPayment}><RefreshCw size={16} />Payment status</button>
            <button onClick={demoSettle}><WalletCards size={16} />Demo settle</button>
            <button onClick={execute}><Play size={16} />Execute</button>
          </div>
          {message && <p className="notice">{message}</p>}
        </div>
        <div className="surface">
          <h2>Analysis</h2>
          {ask ? (
            <>
              <Metric label="Source" value={`${ask.analysis.analysisSource} / ${ask.analysis.model}`} />
              <Metric label="Task type" value={ask.analysis.taskType} />
              <Metric label="Sensitivity" value={ask.secureContext.sensitivity} />
              <p className="muted">Blocked: {ask.secureContext.blockedContext.join(", ") || "none"}</p>
              <h3>Recommendations</h3>
              {ask.recommendations.map((item) => (
                <button className="listRow" key={item.capability.id} onClick={() => setSelected(item.capability.id)}>
                  <span>{item.capability.name}</span><strong>{item.score}</strong>
                </button>
              ))}
              <h3>Sequence</h3>
              <ol>{ask.sequence.map((step) => <li key={step.capabilityId}>{step.name}</li>)}</ol>
            </>
          ) : <p className="muted">Run analysis to populate recommendations.</p>}
        </div>
      </div>
      <ResultStrip transaction={transaction} output={output} />
    </section>
  );
}

function TransactionsScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const refresh = () => routes.transactions().then((data) => setItems(data.transactions));
  useEffect(() => {
    refresh();
  }, []);
  return <DataScreen icon={<CreditCard />} title="Transactions" refresh={refresh}>{items.map((item) => <TransactionRow item={item} refresh={refresh} key={item.id} />)}</DataScreen>;
}

function ReputationScreen() {
  const [name, setName] = useState("setuppilot");
  const [profile, setProfile] = useState<unknown>();
  const [write, setWrite] = useState("");
  const load = () => routes.reputation(name).then((data) => setProfile(data.profile));
  return (
    <section className="panel">
      <Header icon={<ClipboardCheck />} title="Reputation" subtitle="Local outcomes are visible now; on-chain writes stay pending until external proof exists." />
      <div className="surface inline">
        <input value={name} onChange={(event) => setName(event.target.value)} />
        <button onClick={load}><RefreshCw size={16} />Load</button>
        <button onClick={() => routes.writeReputation(name).then((data) => setWrite(data.writeStatus))}><CheckCircle2 size={16} />Prepare write</button>
      </div>
      {write && <p className="notice">Write status: {write}</p>}
      <pre>{profile ? JSON.stringify(profile, null, 2) : "No profile loaded."}</pre>
    </section>
  );
}

function SecurityScreen() {
  const [text, setText] = useState("");
  const [blocked, setBlocked] = useState("");
  useEffect(() => { routes.security().then((data) => setText(data.text)); }, []);
  return (
    <section className="panel">
      <Header icon={<ShieldCheck />} title="Security" subtitle="Guardrails are backed by the API and command adapter." />
      <div className="grid two">
        <pre>{text}</pre>
        <div className="surface">
          <button onClick={() => routes.command("/ask rewrite my repo and push changes to GitHub").then((data) => setBlocked(data.text))}><XCircle size={16} />Run blocked-risk demo</button>
          <pre>{blocked || "The risky action demo output will appear here."}</pre>
        </div>
      </div>
    </section>
  );
}

function ProofScreen() {
  const [proof, setProof] = useState<Record<string, unknown>>();
  useEffect(() => { routes.proof().then((data) => setProof(data)); }, []);
  const proofData = proof as { summary?: { ready: number; partial: number; blocked: number } };
  const entries = proof ? Object.entries((proof.requiredProof as Record<string, { status: string; blocker?: string; missing?: string[] }>) || {}) : [];
  return (
    <DataScreen icon={<WalletCards />} title="External Proof" refresh={() => routes.proof().then((data) => setProof(data))}>
      {proofData?.summary && (
        <div className="grid">
          <Metric label="Ready" value={proofData.summary.ready.toString()} />
          <Metric label="Partial" value={proofData.summary.partial.toString()} />
          <Metric label="Blocked" value={proofData.summary.blocked.toString()} />
        </div>
      )}
      {entries.map(([key, value]) => (
        <div className="proof" key={key}>
          <strong>{key}</strong>
          <span className={value.status}>{value.status}</span>
          <div>
            <p>{value.blocker || "Public proof recorded."}</p>
            {value.missing?.length ? <p className="muted">Missing: {value.missing.join(", ")}</p> : null}
          </div>
        </div>
      ))}
    </DataScreen>
  );
}

function DataScreen({ icon, title, refresh, children }: { icon: JSX.Element; title: string; refresh: () => void; children: React.ReactNode }) {
  return <section className="panel"><Header icon={icon} title={title} subtitle="Live data from the ClawCompass API." /><div className="actions"><button onClick={refresh}><RefreshCw size={16} />Refresh</button></div><div className="surface list">{children}</div></section>;
}

function Header({ icon, title, subtitle }: { icon: JSX.Element; title: string; subtitle: string }) {
  return <header className="pageHeader"><div className="icon">{icon}</div><div><h1>{title}</h1><p>{subtitle}</p></div></header>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function TransactionRow({ item, refresh }: { item: Transaction; refresh: () => void }) {
  return <div className="transaction"><span>{item.id}</span><strong>{item.status}</strong><button onClick={() => routes.payment(item.id).then(refresh)}>Status</button><button onClick={() => routes.retry(item.id).then(refresh)}>Retry</button><button onClick={() => routes.cancel(item.id).then(refresh)}>Cancel</button></div>;
}

function ResultStrip({ transaction, output }: { transaction?: Transaction; output?: Record<string, unknown> }) {
  const rendered = useMemo(() => output ? JSON.stringify(output, null, 2) : "No execution output yet.", [output]);
  return <div className="grid two"><div className="surface"><h2>Transaction</h2><pre>{transaction ? JSON.stringify(transaction, null, 2) : "No transaction yet."}</pre></div><div className="surface"><h2>Execution Result</h2><pre>{rendered}</pre></div></div>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="metricCard"><span>{label}</span><strong>{value}</strong></div>;
}

function DemoStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="demoStep"><span>{number}</span><strong>{title}</strong><p>{text}</p></div>;
}

function ScoreRow({ percent, title, text }: { percent: string; title: string; text: string }) {
  return <div className="scoreRow"><strong>{percent}</strong><span>{title}</span><p>{text}</p></div>;
}

function GateRow({ label, status, muted }: { label: string; status: string; muted?: boolean }) {
  return <div className="gateRow"><span>{label}</span><strong className={muted ? "pending" : ""}>{status}</strong></div>;
}

function ToolPill({ name, role }: { name: string; role: string }) {
  return <div className="toolPill"><strong>{name}</strong><span>{role}</span></div>;
}

function formatProofName(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed.";
}
