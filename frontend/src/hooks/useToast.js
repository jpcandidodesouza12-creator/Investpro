import { useState, useRef, useCallback } from "react";

const TOAST_DURATION_MS = 2800;

export function useToast() {
  const [toast,   setToast]   = useState(null);
  const timerRef              = useRef(null);

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  return { toast, showToast };
}
