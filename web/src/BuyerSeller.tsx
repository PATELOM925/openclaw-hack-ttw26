import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, PackagePlus, Play, RefreshCw, Store, WalletCards } from "lucide-react";
import { type BuyerIntent, type Capability, type Transaction, routes } from "./api";

export function BuyerScreen() {
  const [agentId, setAgentId] = useState("buyer-agent-001");
  const [wallet, setWallet] = useState("0x0000000000000000000000000000000000000001");
  const [task, setTask] = useState("Validate competitors and improve homepage positioning. Budget: 0.10 USDC.");
  const [context, setContext] = useState("Public product summary for autonomous agent builders.");
  const [intent, setIntent] = useState<BuyerIntent>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [output, setOutput] = useState<Record<string, unknown>>();
  const [message, setMessage] = useState("");

  async function createIntent() {
    const result = await routes.buy({
      requesterAgentId: agentId,
      requesterWallet: wallet,
      task,
      context,
      budgetUsd: 0.1,
      maxRisk: "low"
    });
    setIntent(result);
    setTransaction(result.transaction);
    setMessage(result.purchaseInstructions.message);
  }

  async function settleBuyerPayment() {
    if (!transaction) return;
    try {
      const result = await routes.settle(transaction.id, {
        paymentId: "buyer-demo-payment",
        txHash: "0xbuyerdemo",
        capabilityId: transaction.capabilityId,
        amount: transaction.amount,
        token: transaction.token,
        requesterWallet: wallet,
        chainId: 2345
      });
      setTransaction(result.transaction);
      setMessage(result.note);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  async function executeBuyerPurchase() {
    if (!transaction) return;
    try {
      const result = await routes.execute(transaction.capabilityId, {
        transactionId: transaction.id,
        task,
        allowedContext: intent?.secureContext.allowedContext || context
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
      <Header icon={<WalletCards />} title="Buyer Agent" subtitle="A requester agent can ask, receive recommendations, pay, and execute a bought capability." />
      <div className="grid two">
        <div className="surface">
          <label>Buyer agent ID</label>
          <input value={agentId} onChange={(event) => setAgentId(event.target.value)} />
          <label>Buyer wallet</label>
          <input value={wallet} onChange={(event) => setWallet(event.target.value)} />
          <label>Buyer task</label>
          <textarea wrap="soft" value={task} onChange={(event) => setTask(event.target.value)} />
          <label>Buyer context</label>
          <textarea wrap="soft" value={context} onChange={(event) => setContext(event.target.value)} />
          <div className="actions">
            <button onClick={createIntent}><CreditCard size={16} />Create buy intent</button>
            <button onClick={settleBuyerPayment}><CheckCircle2 size={16} />Settle buyer payment</button>
            <button onClick={executeBuyerPurchase}><Play size={16} />Execute bought tool</button>
          </div>
          {message && <p className="notice">{message}</p>}
        </div>
        <div className="surface">
          <h2>Buyer Decision</h2>
          {intent ? (
            <>
              <Metric label="Selected" value={intent.selectedCapability.name} />
              <Metric label="Next step" value={intent.purchaseInstructions.nextStep} />
              <Metric label="Blocked context" value={intent.secureContext.blockedContext.join(", ") || "none"} />
              <h3>Recommended to buy</h3>
              {intent.recommendations.map((item) => (
                <div className="listRow" key={item.capability.id}>
                  <span>{item.capability.name}</span>
                  <strong>{item.capability.priceUsd} {item.capability.priceToken}</strong>
                </div>
              ))}
            </>
          ) : <p className="muted">Create a buy intent to see the buyer-side decision.</p>}
        </div>
      </div>
      <ResultStrip transaction={transaction} output={output} />
    </section>
  );
}

export function SellerScreen() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [name, setName] = useState("DemoProviderSkill");
  const [description, setDescription] = useState("A provider-submitted capability pending ClawCompass review.");
  const [status, setStatus] = useState("");

  const refresh = () => routes.marketplace().then((data) => setCapabilities(data.capabilities));
  useEffect(() => { refresh(); }, []);

  async function submitCapability() {
    const result = await routes.registerTool({
      name,
      description,
      pricingModel: "per_call",
      priceUsd: 0.1,
      priceToken: "USDC",
      riskLevel: "low"
    });
    setStatus(`${result.status}: ${name}`);
  }

  return (
    <section className="panel">
      <Header icon={<Store />} title="Seller Marketplace" subtitle="ClawCompass lists and sells capabilities; new providers enter pending review." />
      <div className="grid two">
        <div className="surface list">
          {capabilities.map((item) => (
            <div className="listRow" key={item.id}>
              <span>{item.name}</span>
              <strong>{item.priceUsd ? `${item.priceUsd} ${item.priceToken}` : "free"}</strong>
            </div>
          ))}
        </div>
        <div className="surface">
          <h2>Submit Seller Capability</h2>
          <label>Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} />
          <label>Description</label>
          <textarea wrap="soft" value={description} onChange={(event) => setDescription(event.target.value)} />
          <button onClick={submitCapability}><PackagePlus size={16} />Submit for review</button>
          {status && <p className="notice">{status}</p>}
        </div>
      </div>
    </section>
  );
}

function Header({ icon, title, subtitle }: { icon: JSX.Element; title: string; subtitle: string }) {
  return <header className="pageHeader"><div className="icon">{icon}</div><div><h1>{title}</h1><p>{subtitle}</p></div></header>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function ResultStrip({ transaction, output }: { transaction?: Transaction; output?: Record<string, unknown> }) {
  return (
    <div className="grid two">
      <div className="surface"><h2>Buyer Transaction</h2><pre>{transaction ? JSON.stringify(transaction, null, 2) : "No buyer transaction yet."}</pre></div>
      <div className="surface"><h2>Bought Capability Output</h2><pre>{output ? JSON.stringify(output, null, 2) : "No bought output yet."}</pre></div>
    </div>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed.";
}
