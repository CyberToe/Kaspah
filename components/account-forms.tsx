"use client";

import { useActionState } from "react";
import { login, register, requestReset, resetPassword, deleteAccount } from "@/app/actions/auth";
import { saveDetails, saveLottoChoices, saveOnboardingLottos, savePersonalTouches, saveProfile, confirmCountry } from "@/app/actions/profile";
import type { FormState } from "@/lib/forms";
import { TimezoneField } from "./fields";
import { SubmitButton } from "./submit";
import { Disclaimer } from "./ui";

const empty: FormState = {};

export function RegisterForm() {
  const [state, action] = useActionState(register, empty);
  return (
    <form action={action} className="stack auth-card">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label>
        Confirm password
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

export function LoginForm({ notice, next }: { notice?: string; next?: string }) {
  const [state, action] = useActionState(login, empty);
  return (
    <form action={action} className="stack auth-card">
      {notice ? <p className="form-ok">{notice}</p> : null}
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <SubmitButton>Log in</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestReset, empty);
  return (
    <form action={action} className="stack auth-card">
      {state.message ? <p className="form-ok">{state.message}</p> : null}
      {state.devLink ? (
        <p className="system-card">
          Development only, because email is not configured: <a href={state.devLink}>{state.devLink}</a>
        </p>
      ) : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, empty);
  return (
    <form action={action} className="stack auth-card">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <input type="hidden" name="token" value={token} />
      <label>
        New password
        <input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label>
        Confirm password
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}

export function DetailsForm({
  zones,
  displayName,
  dateOfBirth,
  timezone,
}: {
  zones: string[];
  displayName?: string | null;
  dateOfBirth?: string | null;
  timezone?: string | null;
}) {
  const [state, action] = useActionState(saveDetails, empty);
  return (
    <form action={action} className="stack auth-card">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <label>
        Display name
        <input name="displayName" required maxLength={40} defaultValue={displayName ?? ""} />
      </label>
      <label>
        Date of birth
        <input name="dateOfBirth" type="date" required defaultValue={dateOfBirth ?? ""} />
      </label>
      <p className="help">Date of birth is kept on your profile only. It is not a check, and it is not used to choose numbers.</p>
      <TimezoneField zones={zones} defaultValue={timezone} />
      <SubmitButton>Continue</SubmitButton>
    </form>
  );
}

export function ProfileForm({
  zones,
  countries,
  displayName,
  dateOfBirth,
  timezone,
  countryCode,
}: {
  zones: string[];
  countries: { code: string; name: string }[];
  displayName: string;
  dateOfBirth: string;
  timezone: string;
  countryCode: string;
}) {
  const [state, action] = useActionState(saveProfile, empty);
  return (
    <div className="stack">
      <form action={action} className="stack auth-card">
        {state.error ? <p className="form-error">{state.error}</p> : null}
        {state.saved ? <p className="form-ok">Profile saved.</p> : null}
        <label>
          Display name
          <input name="displayName" required maxLength={40} defaultValue={displayName} />
        </label>
        <label>
          Date of birth
          <input name="dateOfBirth" type="date" required defaultValue={dateOfBirth} />
        </label>
        <p className="help">Date of birth stays on this profile. It does not change what Kaspah says or which lottos you see.</p>
        <TimezoneField zones={zones} defaultValue={timezone} />
        <label>
          Country
          <select name="country" required defaultValue={countryCode}>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton>Save profile</SubmitButton>
      </form>
      {state.warning && state.pendingCountry ? (
        <form action={confirmCountry} className="system-card stack">
          <p>{state.warning}</p>
          <input type="hidden" name="country" value={state.pendingCountry} />
          <SubmitButton>Yes, change my country</SubmitButton>
          <a href="/profile">Cancel</a>
        </form>
      ) : null}
    </div>
  );
}

export function LottoForm({
  mode,
  options,
  selected,
}: {
  mode: "onboarding" | "profile";
  options: { id: string; name: string; detail: string; active: boolean }[];
  selected: string[];
}) {
  const [state, action] = useActionState(mode === "onboarding" ? saveOnboardingLottos : saveLottoChoices, empty);
  return (
    <form action={action} className="stack">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.saved ? <p className="form-ok">Lottos saved.</p> : null}
      {options.length ? (
        <div className="lotto-list">
          {options.map((option) => (
            <label key={option.id} className="lotto-option">
              <input type="checkbox" name="lotto" value={option.id} defaultChecked={selected.includes(option.id)} />
              <span>
                <strong>{option.name}</strong>
                <small>
                  {option.detail}
                  {option.active ? "" : " · No longer available"}
                </small>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="system-card">
          Readings are not available yet for your country. Your profile can still be saved. You will not be offered another country’s lottos.
        </p>
      )}
      {mode === "onboarding" ? (
        <>
          <Disclaimer />
          <label className="ack">
            <input type="checkbox" name="ack" value="yes" required />
            <span>I understand The Great Kaspah is entertainment only, and that no reading changes the odds of winning.</span>
          </label>
        </>
      ) : null}
      <SubmitButton>{mode === "onboarding" ? "Enter the chamber" : "Save lottos"}</SubmitButton>
    </form>
  );
}

export function TouchesForm({
  luckyNumbers,
  names,
  words,
  dates,
}: {
  luckyNumbers: string;
  names: string;
  words: string;
  dates: { date: string; label: string }[];
}) {
  const [state, action] = useActionState(savePersonalTouches, empty);
  const slots = [0, 1, 2].map((index) => dates[index] ?? { date: "", label: "" });
  return (
    <form action={action} className="stack auth-card">
      <p className="help">
        Optional. Kaspah may weave these into your own readings only. They do not change the odds. They are never shown on a shared page, and they are deleted with your account. Your date of birth is not one of these touches.
      </p>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.saved ? <p className="form-ok">Personal touches saved.</p> : null}
      <label>
        Lucky numbers
        <input name="luckyNumbers" defaultValue={luckyNumbers} placeholder="7, 11, 23" />
      </label>
      <label>
        Names
        <textarea name="names" rows={3} defaultValue={names} placeholder="One name per line" />
      </label>
      <label>
        Words
        <textarea name="words" rows={3} defaultValue={words} placeholder="One word per line" />
      </label>
      <div className="stack">
        {slots.map((slot, index) => (
          <div className="date-grid" key={index}>
            <label>
              Date
              <input name={`date${index + 1}`} type="date" defaultValue={slot.date} />
            </label>
            <label>
              What the day is
              <input name={`label${index + 1}`} defaultValue={slot.label} maxLength={40} />
            </label>
          </div>
        ))}
      </div>
      <SubmitButton>Save touches</SubmitButton>
    </form>
  );
}

export function DeleteForm() {
  const [state, action] = useActionState(deleteAccount, empty);
  return (
    <form action={action} className="stack auth-card">
      <div className="system-card">
        <p>This deletes your account, profile, date of birth, timezone, saved lottos, personal touches, and full reading history.</p>
        <p>Share links stop working. Deletion cannot be undone. The same email can later register a new, empty account.</p>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <label>
        Type DELETE
        <input name="phrase" autoComplete="off" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <SubmitButton variant="danger">Delete my account</SubmitButton>
    </form>
  );
}
