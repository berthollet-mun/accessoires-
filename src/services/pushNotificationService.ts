import { supabase } from '../config/supabaseClient';

type OneSignalSdk = {
  User?: {
    PushSubscription: {
      id?: string;
    };
  };
  Slidedown: {
    promptPush: () => Promise<void>;
  };
  init: (options: { appId: string; allowLocalhostAsSecureOrigin: boolean }) => Promise<void>;
};

declare global {
  interface Window {
    OneSignal?: OneSignalSdk;
  }
}

export const pushNotificationService = {
  async register(userId: string) {
    if (!window.OneSignal) return;

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn("OneSignal App ID not found in environment variables. Web push notifications will be disabled.");
      return;
    }

    try {
      const OneSignal = window.OneSignal;
      
      // Check if initialized to avoid "SDK already initialized" error
      // Note: OneSignal v16 provides `User` API after initialization, this is a proxy check.
      if (!OneSignal.User) {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
          });
      }

      // Prompt for permission
      await OneSignal.Slidedown.promptPush();

      // Get player ID
      const playerId = await OneSignal.User.PushSubscription.id;
      if (playerId) {
        // Fetch current tokens to append
        const { data: profile } = await supabase
          .from('profiles')
          .select('push_tokens')
          .eq('id', userId)
          .single();

        let tokens = profile?.push_tokens || [];
        if (!tokens.includes(playerId)) {
          tokens.push(playerId);
          await supabase
            .from('profiles')
            .update({ push_tokens: tokens })
            .eq('id', userId);
        }
      }
    } catch (error) {
      console.error("OneSignal Init Error:", error);
    }
  }
};
