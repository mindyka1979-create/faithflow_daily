import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createJournalEntry: vi.fn(async () => undefined),
  listJournalEntries: vi.fn(async () => [
    {
      id: 11,
      userId: 7,
      entryType: "gratitude",
      entryDate: "2026-05-04",
      text: "Thank You, Lord, for grace today.",
      category: null,
      reference: null,
      verse: null,
      note: null,
      prayerKind: null,
      title: null,
      details: null,
      answered: false,
      createdAt: new Date("2026-05-04T12:00:00.000Z"),
      updatedAt: new Date("2026-05-04T12:00:00.000Z"),
    },
  ]),
  updatePrayerAnswered: vi.fn(async () => undefined),
}));

import { createJournalEntry, listJournalEntries, updatePrayerAnswered } from "./db";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 7,
    openId: "faithflow-user",
    email: "faithflow@example.com",
    name: "FaithFlow User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("journal router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only the signed-in user's journal entries", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const entries = await caller.journal.list();

    expect(listJournalEntries).toHaveBeenCalledWith(7);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.text).toBe("Thank You, Lord, for grace today.");
  });

  it("creates a scripture entry mapped to the signed-in user", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.journal.create({
      entryType: "scripture",
      entryDate: "2026-05-04",
      category: "Faith",
      reference: "Hebrews 11:1",
      verse: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      note: "A reminder to trust God before the evidence is visible.",
    });

    expect(result).toEqual({ success: true });
    expect(createJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        entryType: "scripture",
        category: "Faith",
        reference: "Hebrews 11:1",
        answered: false,
      }),
    );
  });

  it("updates answered status through the signed-in user's scope", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.journal.setPrayerAnswered({ id: 22, answered: true });

    expect(result).toEqual({ success: true });
    expect(updatePrayerAnswered).toHaveBeenCalledWith(7, 22, true);
  });
});
