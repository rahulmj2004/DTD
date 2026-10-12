"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert } from "lucide-react";
import type { ComponentProps } from "react";

type FieldProps = Omit<ComponentProps<"input">, "className"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Show the green tick once the field has been touched and is valid. */
  valid?: boolean;
  optional?: boolean;
};

/** Labelled input with an announced, animated validation message. */
export function Field({ id, label, hint, error, valid, optional, ...input }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="label-tech flex items-center justify-between text-[0.625rem] text-silver/80">
        <span>{label}</span>
        {optional && <span className="text-silver/40">Optional</span>}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full border bg-obsidian px-4 py-3.5 pr-11 text-base text-paper outline-none transition-colors placeholder:text-silver/30 focus:border-cyan ${
            error ? "border-racing" : valid ? "border-silver/40" : "border-silver/20"
          }`}
          {...input}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden="true">
          {error ? (
            <CircleAlert className="size-5 text-racing" />
          ) : valid ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block">
              <Check className="size-5 text-cyan" />
            </motion.span>
          ) : null}
        </span>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-silver/50">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0, x: -6 }}
            animate={{ opacity: 1, height: "auto", x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden text-sm text-[#ff6b73]"
          >
            <span className="block pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
