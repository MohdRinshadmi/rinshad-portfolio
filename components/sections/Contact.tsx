"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { FadeUp } from "@/components/animations/FadeUp";
import { siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;

function InputField({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border bg-white/3 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all",
          "focus:border-violet-500/50 focus:bg-white/6 focus:ring-1 focus:ring-violet-500/30",
          error ? "border-red-500/40" : "border-white/6"
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
    <SectionWrapper id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="Contact"
          title="Let's build something."
          description="Open to frontend & AI engineering roles, freelance work, and interesting collaborations."
          centered
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          <FadeUp className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Mail size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm font-medium text-white hover:text-violet-300 transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Phone size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-sm font-medium text-white hover:text-violet-300 transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <MapPin size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Location</p>
                <p className="text-sm font-medium text-white">{siteConfig.location}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/6 bg-white/2 text-zinc-400 hover:text-white hover:border-violet-500/30 transition-all"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/6 bg-white/2 text-zinc-400 hover:text-white hover:border-violet-500/30 transition-all"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-auto rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <p className="text-xs font-semibold text-green-400">Available Now</p>
              </div>
              <p className="text-sm text-zinc-400">
                Need someone who ships AI-powered, cross-platform interfaces? Let&apos;s talk — I
                typically respond within 24 hours.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="lg:col-span-3">
            <div className="relative rounded-2xl border border-white/6 bg-white/2 p-6 backdrop-blur-sm sm:p-8">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center gap-4 py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    >
                      <CheckCircle size={48} className="text-green-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white">Message sent!</h3>
                    <p className="text-sm text-zinc-400">
                      Thanks for reaching out. I&apos;ll be in touch within 24 hours.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField
                        label="Name"
                        placeholder="John Smith"
                        {...register("name")}
                        error={errors.name?.message}
                      />
                      <InputField
                        label="Email"
                        type="email"
                        placeholder="john@company.com"
                        {...register("email")}
                        error={errors.email?.message}
                      />
                    </div>

                    <InputField
                      label="Subject"
                      placeholder="Senior Engineer role at Acme Inc."
                      {...register("subject")}
                      error={errors.subject?.message}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-400">Message</label>
                      <textarea
                        rows={5}
                        placeholder="Tell me about the opportunity, project, or just say hi..."
                        {...register("message")}
                        className={cn(
                          "w-full resize-none rounded-xl border bg-white/3 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all",
                          "focus:border-violet-500/50 focus:bg-white/6 focus:ring-1 focus:ring-violet-500/30",
                          errors.message ? "border-red-500/40" : "border-white/6"
                        )}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-400">{errors.message.message}</p>
                      )}
                    </div>

                    {status === "error" && (
                      <p className="text-sm text-red-400">
                        Something went wrong. Please try emailing me directly.
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500 transition-colors disabled:opacity-70"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </FadeUp>
        </div>
      </div>
    </SectionWrapper>
  );
}
