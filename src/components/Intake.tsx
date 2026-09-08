import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/ui/speak-button";
import {
  GENDERS,
  DISTRICTS,
  DISABILITY_STATUS,
  EDUCATION_LEVELS,
  type BilingualOption,
} from "@/data/options";
import type { Participant } from "@/lib/gemini";
import type { Role } from "@/lib/auth";

/** গ্রহণযোগ্য বয়সসীমা — প্রকল্পের নীতি বদলালে এখানেই বদলাও */
const AGE_MIN = 18;
const AGE_MAX = 35;

/** সাধারণ ইউজার সীমিত অপশন দেখে; ফিল্ড অফিসার এর সাথে "দৃষ্টি প্রতিবন্ধিতা"-ও দেখে */
const USER_DISABILITY_EN = ["No disability", "Physical disability", "Prefer not to say"];
const FIELD_DISABILITY_EN = [...USER_DISABILITY_EN, "Visual impairment"];

function disabilityOptionsFor(role: Role): BilingualOption[] {
  const allowed = role === "field" ? FIELD_DISABILITY_EN : USER_DISABILITY_EN;
  return DISABILITY_STATUS.filter((o) => allowed.includes(o.en));
}

/** নিম্ন/অ-সাক্ষর অংশগ্রহণকারীর জন্য — ফর্ম কী চাইছে ও সম্মতি কী, তা শোনার জন্য */
const INTRO_NARRATION =
  "আপনার তথ্য দিন। সব তথ্য গোপনীয়। যা যা লাগবে: পুরো নাম, বয়স, লিঙ্গ, জেলা, প্রতিবন্ধিতার অবস্থা এবং সর্বোচ্চ শিক্ষা। সম্মতি: এগিয়ে যাওয়ার মাধ্যমে আপনি সম্মত হচ্ছেন যে আপনার বেনামী মূল্যায়ন ডেটা প্রোগ্রাম উন্নতির জন্য ব্যবহার করা হতে পারে।";

function Field({
  label,
  labelBn,
  htmlFor,
  children,
}: {
  label: string;
  labelBn: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-sans text-sm font-semibold text-ink"
      >
        {label} <span className="font-normal text-ink-soft">/ {labelBn}</span>
      </label>
      {children}
    </div>
  );
}

function OptionSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: BilingualOption[];
}) {
  return (
    <Select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={value ? "" : "text-ink-soft/70"}
      required
    >
      <option value="">Select / নির্বাচন করুন</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.en} / {o.bn}
        </option>
      ))}
    </Select>
  );
}

export function Intake({
  role,
  onSubmit,
  onCancel,
}: {
  role: Role;
  onSubmit: (participant: Participant) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [district, setDistrict] = useState("");
  const [disability, setDisability] = useState("");
  const [education, setEducation] = useState("");

  const disabilityOptions = disabilityOptionsFor(role);

  const ageNumber = Number(age);
  const ageValid =
    Number.isFinite(ageNumber) && ageNumber >= AGE_MIN && ageNumber <= AGE_MAX;
  const complete =
    name.trim().length > 1 &&
    ageValid &&
    gender &&
    district &&
    disability &&
    education;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    onSubmit({
      name: name.trim(),
      age: age.trim(),
      gender,
      district,
      disability,
      education,
    });
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:py-14">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-forest">
            নতুন অ্যাসেসমেন্ট
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 font-sans text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <Card className="mt-3 bg-paper-dim p-7 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Participant Profile
            </h1>
            <SpeakButton text={INTRO_NARRATION} label="শুনুন" />
          </div>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-soft">
            Please fill in your details. All information is confidential. /
            আপনার তথ্য দিন। সব তথ্য গোপনীয়।
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" labelBn="পুরো নাম" htmlFor="p-name">
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                required
              />
            </Field>

            <Field label="Age" labelBn="বয়স" htmlFor="p-age">
              <Input
                id="p-age"
                type="number"
                inputMode="numeric"
                min={AGE_MIN}
                max={AGE_MAX}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 22"
                required
              />
              {age && !ageValid && (
                <p className="mt-1.5 text-xs text-clay">
                  বয়স {AGE_MIN} থেকে {AGE_MAX}-এর মধ্যে হতে হবে।
                </p>
              )}
            </Field>

            <Field label="Gender" labelBn="লিঙ্গ" htmlFor="p-gender">
              <OptionSelect
                id="p-gender"
                value={gender}
                onChange={setGender}
                options={GENDERS}
              />
            </Field>

            <Field label="District" labelBn="জেলা" htmlFor="p-district">
              <OptionSelect
                id="p-district"
                value={district}
                onChange={setDistrict}
                options={DISTRICTS}
              />
            </Field>

            <Field
              label="Disability Status"
              labelBn="প্রতিবন্ধিতা"
              htmlFor="p-disability"
            >
              <OptionSelect
                id="p-disability"
                value={disability}
                onChange={setDisability}
                options={disabilityOptions}
              />
            </Field>

            <Field
              label="Highest Education"
              labelBn="সর্বোচ্চ শিক্ষা"
              htmlFor="p-education"
            >
              <OptionSelect
                id="p-education"
                value={education}
                onChange={setEducation}
                options={EDUCATION_LEVELS}
              />
            </Field>
          </div>

          <div className="mt-7 rounded-lg border border-dawn/40 bg-dawn/10 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-dawn" />
              <p className="text-sm leading-relaxed text-ink">
                <span className="font-semibold">Consent / সম্মতি:</span> By
                proceeding, you agree your anonymised assessment data may be used
                for program improvement and reporting under CARE Bangladesh&rsquo;s
                data protection policy. / এগিয়ে যাওয়ার মাধ্যমে আপনি সম্মত হচ্ছেন
                যে আপনার বেনামী মূল্যায়ন ডেটা প্রোগ্রাম উন্নতির জন্য ব্যবহার করা
                হতে পারে।
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 font-sans text-sm font-medium text-ink-soft hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <Button
              type="submit"
              size="lg"
              disabled={!complete}
              className="gap-2"
            >
              Continue to Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
