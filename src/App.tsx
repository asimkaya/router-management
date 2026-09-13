import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "./app/session-store";
import { LoginScreen } from "./features/auth/LoginScreen";
import { DevicesScreen } from "./features/devices/DevicesScreen";

export default function App() {
  const connected = useSessionStore((s) => s.connected);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={connected ? "devices" : "login"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {connected ? <DevicesScreen /> : <LoginScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
