import { Balls, Disclaimer } from "@/components/ui";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

const EXAMPLE = [7, 14, 23, 32, 38, 47];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect(onboardingPath(user) ?? "/readings");
  return (
    <main id="content" className="wrap">
      <section className="stage">
        <figure className="stage-frame">
          <img
            src="/kaspah.jpeg"
            width={1325}
            height={1600}
            alt="The Great Kaspah, in a gold turban and burgundy velvet robe, smiles over a glowing crystal ball filled with lotto balls. Lanterns and red curtains frame a gold sign that reads The Great Kaspah."
          />
        </figure>
        <div className="stage-copy">
          <p className="eyebrow">Entertainment only</p>
          <h1>The Great Kaspah</h1>
          <p className="tagline">Lotto numbers, revealed — when the crystal ball feels like it.</p>
          <p className="kaspah">
            Step closer. If the glass is willing, I will name a set for the game you play. If it is not, I will say so — and you may ask again.
          </p>
          <div className="actions">
            <a className="btn gold" href="/guest">
              Step closer, as a guest
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
            <strong>Tell the house where you are from</strong>
            <span>Only the lottos of that country are ever offered.</span>
          </span>
        </article>
        <article className="step">
          <span>
            <strong>Save the games you play</strong>
            <span>Each one keeps its own row, its own feeling, its own answer.</span>
          </span>
        </article>
        <article className="step">
          <span>
            <strong>Ask, as often as you like</strong>
            <span>Sometimes the ball glows. Sometimes it declines. A refusal is not a locked door.</span>
          </span>
        </article>
      </section>
      <section className="panel" style={{ marginTop: "1.5rem" }}>
        <p className="eyebrow">From the launch poster</p>
        <Balls main={EXAMPLE} />
        <p className="poster-caption">
          The six balls above are the example set shown on the launch poster. They illustrate the format of a reading only. They are not a recommendation, and they carry no greater chance of winning than any other valid combination.
        </p>
      </section>
      <div style={{ marginTop: "1.5rem" }}>
        <Disclaimer />
      </div>
    </main>
  );
}
