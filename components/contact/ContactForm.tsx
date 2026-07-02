"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

/* Schema kept identical to the original Contact.tsx (name/email/subject/message). */
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;

type FieldStatus = "idle" | "loading" | "success" | "error";

const fieldBase =
  "w-full rounded-md border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted " +
  "outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out " +
  "focus:border-accent/50 focus:bg-surface-raised focus:ring-1 focus:ring-accent/30";

function fieldClasses(hasError: boolean, extra?: string) {
  return cn(fieldBase, hasError ? "border-danger/50" : "border-border", extra);
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="font-mono text-eyebrow uppercase text-text-tertiary">
      {children}
    </label>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-xs text-danger">
      {children}
    </p>
  );
}

export function ContactForm({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<FieldStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-surface/60 p-6 shadow-card ring-hairline sm:p-8",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="flex flex-col items-center justify-center gap-4 py-12 text-center"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={reduceMotion ? undefined : { ...EASE.spring, delay: 0.1 }}
              className="flex size-14 items-center justify-center rounded-full border border-positive/30 bg-positive/10"
            >
              <Check size={26} className="text-positive" aria-hidden="true" />
            </motion.div>
            <h3 className="font-display text-h3 text-text">Message sent</h3>
            <p className="max-w-sm text-sm text-text-secondary">
              Thanks for reaching out — I&apos;ll be in touch within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-2 min-h-11 font-mono text-eyebrow uppercase text-accent transition-colors hover:text-accent-hover"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Smith"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  {...register("name")}
                  className={fieldClasses(!!errors.name)}
                />
                {errors.name && (
                  <FieldError id="contact-name-error">{errors.name.message}</FieldError>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@company.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  {...register("email")}
                  className={fieldClasses(!!errors.email)}
                />
                {errors.email && (
                  <FieldError id="contact-email-error">{errors.email.message}</FieldError>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
              <input
                id="contact-subject"
                type="text"
                placeholder="Senior Engineer role at Acme Inc."
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                {...register("subject")}
                className={fieldClasses(!!errors.subject)}
              />
              {errors.subject && (
                <FieldError id="contact-subject-error">{errors.subject.message}</FieldError>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Tell me about the opportunity, project, or just say hi…"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                {...register("message")}
                className={fieldClasses(!!errors.message, "resize-none")}
              />
              {errors.message && (
                <FieldError id="contact-message-error">{errors.message.message}</FieldError>
              )}
            </div>

            {status === "error" && (
              <p role="alert" className="text-sm text-danger">
                Something went wrong. Please try emailing me directly.
              </p>
            )}

            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading"}
                className="w-full sm:w-auto"
                iconRight={
                  status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send size={16} aria-hidden="true" />
                  )
                }
              >
                {status === "loading" ? "Sending…" : "Send message"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
