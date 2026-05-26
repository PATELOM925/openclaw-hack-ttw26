import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  CreditCard,
  Play,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  XCircle
} from "lucide-react";
import { type AskResponse, type Transaction, routes } from "./api";
import { BuyerScreen, SellerScreen } from "./BuyerSeller";

type Page = "/" | "/buy" | "/sell" | "/capabilities" | "/transactions" | "/reputation" | "/security" | "/proof";

const pages: Array<{ path: Page; label: string }> = [
  { path: "/", label: "Broker" },
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
        {page === "/" && <BrokerScreen />}
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

function BrokerScreen() {
  const [task, setTask] = useState("Improve my homepage pitch and validate market positioning.");
  const [context, setContext] = useState("Project summary: ClawCompass helps agents buy safe capabilities.");
  const [ask, setAsk] = useState<AskResponse>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [selected, setSelected] = useState("pitchhawk");
  const [output, setOutput] = useState<Record<string, unknown>>();
  const [message, setMessage] = useState("");

  async function analyze() {
    setMessage("");
    const result = await routes.ask({ task, context, budgetUsd: 0.1 });
    setAsk(result);
    setSelected(result.recommendations[0]?.capability.id || "pitchhawk");
  }

  async function useCapability(id = selected) {
    setMessage("");
    const result = await routes.use(id, { task, context, requesterAgentId: "web-demo" });
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
  }

  async function execute() {
    if (!transaction) return;
    const result = await routes.execute(transaction.capabilityId, {
      transactionId: transaction.id,
      task,
      allowedContext: ask?.secureContext.allowedContext || context
    });
    setTransaction(result.transaction);
    setOutput(result.result);
  }

  return (
    <section className="panel">
      <Header icon={<Activity />} title="Capability Broker" subtitle="Analyze, redact, pay, execute, and log reputation from one workflow." />
      <div className="grid two">
        <div className="surface">
          <label>Task</label>
          <textarea wrap="soft" value={task} onChange={(event) => setTask(event.target.value)} />
          <label>Context</label>
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
  const [name, setName] = useState("pitchhawk");
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
  const entries = proof ? Object.entries((proof.requiredProof as Record<string, { status: string; blocker?: string }>) || {}) : [];
  return <DataScreen icon={<WalletCards />} title="External Proof" refresh={() => routes.proof().then((data) => setProof(data))}>{entries.map(([key, value]) => <div className="proof" key={key}><strong>{key}</strong><span className={value.status}>{value.status}</span><p>{value.blocker || "Public proof recorded."}</p></div>)}</DataScreen>;
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
