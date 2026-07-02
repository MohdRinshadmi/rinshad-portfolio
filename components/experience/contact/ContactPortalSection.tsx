"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Download, Loader2, Send } from "lucide-react";
import { InkStage, StageHeading } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { siteConfig, socialLinks } from "@/lib/config/site";
import { EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

const PortalScene = dynamic(() => import("./PortalScene"), { ssr: false });

/* ============================================================================
   CONTACT PORTAL — a communication terminal instead of a form. Same wire
   format as /api/contact; validation errors print like a compiler, success
   renders an ACK transmission, and the portal in the scene flares while the
   message is in flight.
   ========================================================================== */

const transmissionSchema = z.object({
  name: z.string().min(2, "name: expected at least 2 characters"),
  email: z.string().email("email: not a valid address"),
  subject: z.string().min(4, "subject: expected at least 4 characters"),
  message: z.string().min(20, "message: expected at least 20 characters"),
});

type Transmission = z.infer<typeof transmissionSchema>;

type Status = "idle" | "sending" | "sent" | "failed";

const fieldClass =
  "w-full rounded-lg border border-ink-border bg-ink/70 px-4 py-3 font-mono text-sm text-ink-text placeholder:text-ink-text-tertiary/60 transition-colors focus:border-accent/60 focus:outline-none";

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          className="mt-1.5 font-mono text-xs text-danger"
        >
          <span aria-hidden="true">✕ </span>
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function ContactPortalSection() {
  const [gateRef, mountScene] = useSceneGate();
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Transmission>({ resolver: zodResolver(transmissionSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setStatus("sent");
      reset();
    } catch {
      setStatus("failed");
    }
  });

  return (
    <InkStage id="contact-portal" label="Contact">
      <div className="relative">
        <div ref={gateRef} className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-product" />
          {mountScene && <PortalScene charged={status === "sending" || status === "sent"} />}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
        </div>

        <div className="container-wide relative z-10 grid items-start gap-12 py-24 sm:py-28 lg:grid-cols-2">
          <div>
            <StageHeading
              eyebrow="08 — OPEN A CHANNEL"
              title="The portal is listening"
              blurb={`${siteConfig.availability}. ${siteConfig.responsePromise}.`}
            />

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={siteConfig.resumeUrl}
                download
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                <Download size={15} aria-hidden="true" />
                Download résumé
              </a>
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-ink-border px-6 py-3 text-sm font-medium text-ink-text transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {link.name}
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ))}
            </div>

            <p className="mt-8 font-mono text-sm text-ink-text-tertiary">
              direct uplink:{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-ink-text-secondary underline decoration-ink-border underline-offset-4 transition-colors hover:text-accent"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>

          {/* The terminal. */}
          <div className="overflow-hidden rounded-xl border border-ink-border bg-ink/85 ring-hairline-ink backdrop-blur-md">
            <header className="flex items-center justify-between border-b border-ink-border px-5 py-3.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-text-tertiary">
                <span className="text-accent">portal://</span>transmit
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider",
                  status === "sent" ? "text-positive" : "text-ink-text-tertiary",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    status === "sending" && "animate-pulse-dot bg-warning",
                    status === "sent" && "bg-positive",
                    status === "failed" && "bg-danger",
                    status === "idle" && "animate-pulse-dot bg-positive",
                  )}
                  aria-hidden="true"
                />
                {status === "idle" && "channel open"}
                {status === "sending" && "transmitting"}
                {status === "sent" && "ack received"}
                {status === "failed" && "transmission failed"}
              </span>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="ack"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE.out }}
                  className="p-6 sm:p-8"
                  role="status"
                >
                  <p className="font-mono text-sm leading-7 text-ink-text-secondary">
                    <span className="text-positive">✓ message delivered.</span>
                    <br />
                    Thanks for reaching out — I read everything that comes through the
                    portal and usually reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink-border px-5 py-2.5 text-sm font-medium text-ink-text transition-colors hover:border-ink-text/30"
                  >
                    Send another transmission
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={onSubmit}
                  noValidate
                  className="space-y-4 p-6 sm:p-8"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="portal-name" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-ink-text-tertiary">
                        $ name
                      </label>
                      <input
                        id="portal-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                        aria-invalid={!!errors.name}
                        className={fieldClass}
                        {...register("name")}
                      />
                      <FieldError message={errors.name?.message} />
                    </div>
                    <div>
                      <label htmlFor="portal-email" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-ink-text-tertiary">
                        $ email
                      </label>
                      <input
                        id="portal-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        aria-invalid={!!errors.email}
                        className={fieldClass}
                        {...register("email")}
                      />
                      <FieldError message={errors.email?.message} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="portal-subject" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-ink-text-tertiary">
                      $ subject
                    </label>
                    <input
                      id="portal-subject"
                      type="text"
                      placeholder="Role, project, or idea"
                      aria-invalid={!!errors.subject}
                      className={fieldClass}
                      {...register("subject")}
                    />
                    <FieldError message={errors.subject?.message} />
                  </div>
                  <div>
                    <label htmlFor="portal-message" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-ink-text-tertiary">
                      $ message
                    </label>
                    <textarea
                      id="portal-message"
                      rows={5}
                      placeholder="What are we building?"
                      aria-invalid={!!errors.message}
                      className={cn(fieldClass, "resize-y")}
                      {...register("message")}
                    />
                    <FieldError message={errors.message?.message} />
                  </div>

                  {status === "failed" && (
                    <p role="alert" className="font-mono text-xs text-danger">
                      ✕ transmission failed — try again, or use the direct uplink below.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        Transmitting…
                      </>
                    ) : (
                      <>
                        <Send
                          size={15}
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                        Transmit
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </InkStage>
  );
}
