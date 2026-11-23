import React, { useEffect, useRef, useState } from 'react';
import { Coffee, CloudRain, Volume2, VolumeX, Radio, Play, Pause, Music } from 'lucide-react';

type SoundscapeType = 'whitenoise' | 'rain' | 'cafe' | 'binaural';

interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  desc: string;
  icon: typeof Coffee;
}

const SOUNDSCAPES: SoundscapeOption[] = [
  { id: 'whitenoise', label: 'Deep Focus White Noise', desc: 'Blocks background chatter & sharp noises', icon: Radio },
  { id: 'rain', label: 'Soft Rainfall', desc: 'Gentle raindrops & calming frequency dampening', icon: CloudRain },
  { id: 'cafe', label: 'Coffee Shop Ambience', desc: 'Cozy indoor low-frequency rumble & murmur', icon: Coffee },
  { id: 'binaural', label: 'Binaural Alpha (40Hz)', desc: 'Brainwave entrainment for flow state & retention', icon: Music },
];

export const LoFiRadio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundscapeType>('rain');
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const secondSourceRef = useRef<AudioNode | null>(null); // For binaural right channel

  // Stop audio
  const stopAudio = () => {
    try {
      if (sourceNodeRef.current && 'stop' in sourceNodeRef.current) {
        (sourceNodeRef.current as AudioScheduledSourceNode).stop();
      }
      if (secondSourceRef.current && 'stop' in secondSourceRef.current) {
        (secondSourceRef.current as AudioScheduledSourceNode).stop();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    } catch {
      // Ignore
    }
    audioCtxRef.current = null;
    gainNodeRef.current = null;
    sourceNodeRef.current = null;
    secondSourceRef.current = null;
  };

  // Start audio based on activeSound
  const startAudio = (sound: SoundscapeType) => {
    stopAudio();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      if (sound === 'whitenoise') {
        // White noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        noiseSource.connect(filter);
        filter.connect(gainNode);
        noiseSource.start();
        sourceNodeRef.current = noiseSource;
      } else if (sound === 'rain') {
        // Pink / filtered noise for rain
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.2;

        rainSource.connect(filter);
        filter.connect(gainNode);
        rainSource.start();
        sourceNodeRef.current = rainSource;
      } else if (sound === 'cafe') {
        // Brown noise murmur
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const cafeSource = ctx.createBufferSource();
        cafeSource.buffer = buffer;
        cafeSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        cafeSource.connect(filter);
        filter.connect(gainNode);
        cafeSource.start();
        sourceNodeRef.current = cafeSource;
      } else if (sound === 'binaural') {
        // Dual oscillator for 40Hz gamma/alpha wave (e.g. 200Hz left, 240Hz right)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = 200;

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = 240; // 40Hz difference

        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.25;
        gainR.gain.value = 0.25;

        oscL.connect(gainL);
        oscR.connect(gainR);

        gainL.connect(merger, 0, 0); // left channel
        gainR.connect(merger, 0, 1); // right channel

        merger.connect(gainNode);

        oscL.start();
        oscR.start();
        sourceNodeRef.current = oscL;
        secondSourceRef.current = oscR;
      }
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudio(activeSound);
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isPlaying, activeSound]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSoundChange = (sId: SoundscapeType) => {
    setActiveSound(sId);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-300">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Lo-Fi Focus Radio &amp; Soundscapes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero-distraction procedural ambient audio to boost cognitive stamina.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className={`min-h-[44px] px-4 rounded-2xl text-xs font-bold inline-flex items-center gap-2 transition-colors ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-violet-500 hover:bg-violet-400 text-white'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isPlaying ? 'Pause Sound' : 'Play Ambient'}</span>
        </button>
      </div>

      {/* Soundscape Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SOUNDSCAPES.map((s) => {
          const Icon = s.icon;
          const active = activeSound === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSoundChange(s.id)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                active
                  ? 'border-violet-500 bg-violet-500/15 text-violet-900 dark:text-violet-200 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-violet-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${active ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'}`} />
                {isPlaying && active && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-violet-500 animate-pulse rounded-full" />
                    <span className="w-0.5 h-2 bg-violet-500 animate-pulse rounded-full [animation-delay:150ms]" />
                    <span className="w-0.5 h-3.5 bg-violet-500 animate-pulse rounded-full [animation-delay:300ms]" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-bold truncate">{s.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {s.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Volume Bar & Equalizer status */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-28 sm:w-36 accent-violet-500 cursor-pointer"
          />
          <span className="text-slate-400 font-mono tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
          {isPlaying ? `Playing: ${SOUNDSCAPES.find(s => s.id === activeSound)?.label}` : 'Radio paused'}
        </div>
      </div>
    </div>
  );
};
