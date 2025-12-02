import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID that persists for the browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();
    const pagePath = location.pathname;
    pageStartTime.current = Date.now();

    // Track page view
    const trackPageView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('analytics_events').insert({
          session_id: sessionId,
          event_type: 'page_view',
          page_path: pagePath,
          user_id: user?.id || null,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    };

    trackPageView();

    // Track page exit on cleanup
    return () => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
      
      // Use sendBeacon for reliable tracking even during page unload
      const trackPageExit = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          await supabase.from('analytics_events').insert({
            session_id: sessionId,
            event_type: 'page_exit',
            page_path: pagePath,
            user_id: user?.id || null,
            duration_seconds: duration,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Silently fail on exit tracking
        }
      };

      trackPageExit();
    };
  }, [location.pathname]);
};
