'use client';

import { useVoice } from '@/context/VoiceContext';

/** Small floating speaker toggle — lets the customer mute/unmute the ALMA
 *  voice clips. Renders only when the admin has the voice feature enabled. */
export function VoiceDock() {
  const { featureEnabled, muted, setMuted } = useVoice();
  if (!featureEnabled) return null;
  return (
    <button
      type="button"
      className={`alma-voice-dock${muted ? ' is-muted' : ''}`}
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'ভয়েস চালু করুন' : 'ভয়েস বন্ধ করুন'}
      title={muted ? 'ভয়েস চালু করুন' : 'ভয়েস বন্ধ করুন'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
