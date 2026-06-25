import { useState } from "react";
import {
  useCurrentUser,
  useSetupTwoFactor,
  useEnableTwoFactor,
  useDisableTwoFactor,
} from "@/hooks/auth/useAuth";

export function useTwoFactor() {
  const { user } = useCurrentUser();
  const {
    setupTwoFactor,
    loading: setupLoading,
    qrCodeUrl,
    secret,
  } = useSetupTwoFactor();
  const {
    enableTwoFactor,
    loading: enableLoading,
    error: enableError,
  } = useEnableTwoFactor();
  const {
    disableTwoFactor,
    loading: disableLoading,
    error: disableError,
  } = useDisableTwoFactor();

  const [tfaCode, setTfaCode] = useState("");
  const [tfaDone, setTfaDone] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  async function handleEnableTfa(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await enableTwoFactor(tfaCode);
      setTfaDone(true);
    } catch {
      /* error state is surfaced via useEnableTwoFactor's error */
    }
  }

  return {
    user,
    setupTwoFactor,
    setupLoading,
    qrCodeUrl,
    secret,
    enableLoading,
    enableError,
    disableTwoFactor,
    disableLoading,
    disableError,
    tfaCode,
    setTfaCode,
    tfaDone,
    disableCode,
    setDisableCode,
    showDisableForm,
    setShowDisableForm,
    handleEnableTfa,
  };
}
