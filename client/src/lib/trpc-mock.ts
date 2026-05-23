import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

// This is a simplified mock for when the backend is not available
export const trpc = createTRPCReact<AppRouter>();

export const useLocalJournal = () => {
  const getEntries = () => {
    const saved = localStorage.getItem("faithflow_entries");
    return saved ? JSON.parse(saved) : [];
  };

  const saveEntry = (entry: any) => {
    const entries = getEntries();
    const newEntry = { ...entry, id: Date.now(), createdAt: new Date().toISOString() };
    localStorage.setItem("faithflow_entries", JSON.stringify([newEntry, ...entries]));
    return newEntry;
  };

  return { getEntries, saveEntry };
};
