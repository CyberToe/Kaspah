import { Balls, Disclaimer } from "@/components/ui";
import { LAB_DISCLAIMER, LAB_RESPONSIBLE } from "@/lib/lab";

const EXAMPLE = [7, 14, 23, 32, 38, 47];

export default function LabPage() {
  return (
    <main id="content" className="wrap">
      <section className="lab-stage">
        <figure className="lab-frame">
          <img
            src="/lottolab.jpg"
            width={689}
            height={947}
            alt="A scientist in a white lab coat holds a beaker of blue solution. Numbered samples 7, 14, 23, 32, 38, and 47 glow inside the glass, and a notebook on the bench logs the same trial."
          />
        </figure>
        <div className="lab-copy">
          <p className="lab-eyebrow">Entertainment only</p>
          <h1>LottoLab</h1>
          <p className="lab-tagline">Numbers, observed — when the sample finishes mixing.</p>
          <p>
            The bench is clear. Name the draw, and the lab mixes a fresh solution for that game. If the sample resolves, the set is logged. If it does not, the record says the trial was inconclusive — and you may run it again.
          </p>
          <div className="actions">
            <a className="btn gold" href="/lab/guest">
              Run a guest trial
            </a>
            <a className="btn ghost" href="/register">
              Create an account
            </a>
            <a className="btn ghost" href="/login">
              Log in
            </a>
          </div>
        </div>
      </section>
      <section className="steps" style={{ marginTop: "2.5rem" }}>
        <article className="step">
          <span>
            <strong>Record the country of the draw</strong>
            <span>Only games from that country are admitted to the protocol.</span>
          </span>
        </article>
        <article className="step">
          <span>
            <strong>Select the lotto under test</strong>
            <span>Each game keeps its own row and its own result.</span>
          </span>
        </article>
        <article className="step">
          <span>
            <strong>Run the trial as often as you like</strong>
            <span>Sometimes the solution yields a set. Sometimes the finding is inconclusive. An inconclusive result is not a failed door.</span>
          </span>
        </article>
      </section>
      <section className="panel" style={{ marginTop: "1.5rem" }}>
        <p className="lab-eyebrow">Reference sample</p>
        <Balls main={EXAMPLE} />
        <p className="poster-caption">
          These six values are the reference set written in the lab notebook. They show the format of a result only. They are not a recommendation, and they carry no greater chance of winning than any other valid combination.
        </p>
      </section>
      <div style={{ marginTop: "1.5rem" }}>
        <Disclaimer lead={LAB_DISCLAIMER} responsible={LAB_RESPONSIBLE} />
      </div>
    </main>
  );
}
