import React, { useState, useRef, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

const AppointmentActions = ({ appointment, onClose, onUpdated, onReschedule }) => {
  const [action, setAction] = useState<"confirm" | "cancel" | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // 👇 fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmSuccess = () => {
    setAction(null);
    onUpdated?.();
    onClose();
  };

  return (
    <>
      {!action && (
        <div
          ref={boxRef}
          className="absolute right-2 top-2 bg-white border rounded shadow-md text-sm z-50"
        >
          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => setAction("confirm")}
          >
            Confirmar
          </button>

          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => setAction("cancel")}
          >
            Cancelar
          </button>

          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              onReschedule(appointment);
              onClose();
            }}
          >
            Reagendar
          </button>
        </div>
      )}

      {action && (
        <ConfirmModal
          appointment={appointment}
          action={action}
          onClose={() => setAction(null)}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </>
  );
};

export default AppointmentActions;
