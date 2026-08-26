import { useNavigate } from "react-router-dom";
import { Bike, Footprints } from "lucide-react";
import { Modal } from "../../shared/ui/Modal";
import { RunForm } from "../running/components/RunForm";
import { RideForm } from "../cycling/components/RideForm";
import { useAddActivityStore } from "./useAddActivityStore";
import { cn } from "../../shared/utils/cn";

export function AddActivityModal() {
  const navigate = useNavigate();
  const isOpen = useAddActivityStore((s) => s.isOpen);
  const tab = useAddActivityStore((s) => s.tab);
  const setTab = useAddActivityStore((s) => s.open);
  const close = useAddActivityStore((s) => s.close);

  function handleSaved() {
    close();
    navigate("/");
  }

  return (
    <Modal open={isOpen} onClose={close} title="Nueva actividad">
      <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setTab("run")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition",
            tab === "run" ? "bg-white text-sky-600 shadow-sm dark:bg-zinc-900" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Footprints className="h-4 w-4" />
          Running
        </button>
        <button
          type="button"
          onClick={() => setTab("ride")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition",
            tab === "ride" ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-900" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Bike className="h-4 w-4" />
          Cycling
        </button>
      </div>

      {tab === "run" ? <RunForm onSaved={handleSaved} /> : <RideForm onSaved={handleSaved} />}
    </Modal>
  );
}