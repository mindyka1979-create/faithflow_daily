import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createJournalEntry, listJournalEntries, updatePrayerAnswered } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const entryDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createJournalEntrySchema = z.discriminatedUnion("entryType", [
  z.object({
    entryType: z.literal("gratitude"),
    entryDate: entryDateSchema,
    text: z.string().trim().min(1).max(4000),
  }),
  z.object({
    entryType: z.literal("scripture"),
    entryDate: entryDateSchema,
    category: z.string().trim().min(1).max(120),
    reference: z.string().trim().min(1).max(120),
    verse: z.string().trim().min(1).max(6000),
    note: z.string().trim().max(4000).optional(),
  }),
  z.object({
    entryType: z.literal("prayer"),
    entryDate: entryDateSchema,
    prayerKind: z.enum(["Prayer Request", "Question for the Holy Spirit"]),
    title: z.string().trim().min(1).max(220),
    details: z.string().trim().max(5000).optional(),
  }),
  z.object({
    entryType: z.literal("moment"),
    entryDate: entryDateSchema,
    title: z.string().trim().min(1).max(220),
    details: z.string().trim().min(1).max(6000),
  }),
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  journal: router({
    list: protectedProcedure.query(({ ctx }) => listJournalEntries(ctx.user.id)),
    create: protectedProcedure.input(createJournalEntrySchema).mutation(async ({ ctx, input }) => {
      await createJournalEntry({
        userId: ctx.user.id,
        entryDate: input.entryDate,
        entryType: input.entryType,
        text: input.entryType === "gratitude" ? input.text : null,
        category: input.entryType === "scripture" ? input.category : null,
        reference: input.entryType === "scripture" ? input.reference : null,
        verse: input.entryType === "scripture" ? input.verse : null,
        note: input.entryType === "scripture" ? input.note ?? null : null,
        prayerKind: input.entryType === "prayer" ? input.prayerKind : null,
        title: input.entryType === "prayer" || input.entryType === "moment" ? input.title : null,
        details:
          input.entryType === "prayer" || input.entryType === "moment" ? input.details ?? null : null,
        answered: false,
      });

      return { success: true } as const;
    }),
    setPrayerAnswered: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          answered: z.boolean(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await updatePrayerAnswered(ctx.user.id, input.id, input.answered);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
