'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Microphone,
  Check,
  Lightning,
  Globe,
  Trash,
  Sparkle,
  CircleNotch,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { toast } from 'sonner';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  paymentMethods: any[];
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  paymentMethods,
}) => {
  const { locale } = useAppStore();
  const t = translations[locale];

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveLang, setLiveLang] = useState<'bn-BD' | 'en-US'>(locale === 'en' ? 'en-US' : 'bn-BD');
  const [detectedLang, setDetectedLang] = useState<'auto' | 'bn' | 'en' | 'bilingual'>('auto');
  const [detectedLangDisplay, setDetectedLangDisplay] = useState<string>('বাংলা (bn-BD)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiLogId, setAiLogId] = useState<string | null>(null);
  const [parsedExpenses, setParsedExpenses] = useState<any[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const liveLangRef = useRef<'bn-BD' | 'en-US'>(locale === 'en' ? 'en-US' : 'bn-BD');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef<boolean>(false);
  const lastSoundTimeRef = useRef<number>(Date.now());
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    liveLangRef.current = liveLang;
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.lang = liveLang === 'en-US' ? 'en-US' : 'bn-BD';
      } catch (e) {
        // ignore
      }
    }
  }, [liveLang, isRecording]);

  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      setTranscript('');
      setParsedExpenses([]);
      setIsAnalyzing(false);
      setDetectedLang('auto');
      setDetectedLangDisplay('');
    }
  }, [isOpen]);

  const cleanupRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    hasSpokenRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const resetSilenceTimer = () => {
    hasSpokenRef.current = true;
    lastSoundTimeRef.current = Date.now();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      if (hasSpokenRef.current) {
        stopRecordingAndProcess();
      }
    }, 3000);
  };

  // Helper to inspect character scripts and detect Bangla vs English vs Bilingual in real-time
  const detectLanguageFromText = (text: string): 'bn' | 'en' | 'bilingual' | 'auto' => {
    if (!text.trim()) return 'auto';
    const bengaliMatches = text.match(/[\u0980-\u09FF]/g);
    const latinMatches = text.match(/[A-Za-z]/g);

    const bnCount = bengaliMatches ? bengaliMatches.length : 0;
    const enCount = latinMatches ? latinMatches.length : 0;

    if (bnCount > 0 && enCount > 0) return 'bilingual';
    if (bnCount > enCount) return 'bn';
    if (enCount > 0) return 'en';
    return 'auto';
  };

  const startRecording = async () => {
    if (isRecording) {
      // Stop recording and process captured audio
      stopRecordingAndProcess();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      hasSpokenRef.current = false;
      lastSoundTimeRef.current = Date.now();

      // Audio volume analyzer to detect silence (> 3 seconds)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          silenceIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Audio threshold for active voice
            if (average > 8) {
              resetSilenceTimer();
            }
          }, 150);
        }
      } catch (audioErr) {
        console.warn('AudioContext silence detection init error:', audioErr);
      }

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });

        // If we already have live transcribed text, use high-speed Groq directly for instant extraction
        if (transcriptRef.current.trim()) {
          await handleAnalyzeText(transcriptRef.current.trim());
        } else if (audioBlob.size > 0) {
          await processAudioWithGemini(audioBlob);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDetectedLangDisplay('Listening...');

      // Live Speech-to-Text for real-time visual feedback with explicit language
      startLiveSpeechPreview();
    } catch (err: any) {
      console.warn('Microphone stream error, falling back to Web Speech:', err);
      startLiveSpeechPreviewOnly();
    }
  };

  const startLiveSpeechPreview = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Set explicit language model: 'bn-BD' for Bengali + loanwords, or 'en-US' for English
      recognition.lang = liveLangRef.current === 'en-US' ? 'en-US' : 'bn-BD';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let fullText = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullText += event.results[i][0].transcript;
        }
        if (fullText.trim()) {
          setTranscript(fullText);
          transcriptRef.current = fullText;
          const lang = detectLanguageFromText(fullText);
          setDetectedLang(lang);
        }
      };

      recognition.onerror = () => {
        // Ignored as raw audio is being recorded in parallel
      };

      recognition.start();
    } catch (e) {
      // Ignored
    }
  };

  const startLiveSpeechPreviewOnly = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice recording is not supported in this browser. You can type directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = liveLangRef.current === 'en-US' ? 'en-US' : 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        hasSpokenRef.current = false;
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let currentText = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText.trim()) {
          setTranscript(currentText);
          transcriptRef.current = currentText;
          const lang = detectLanguageFromText(currentText);
          setDetectedLang(lang);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcriptRef.current.trim()) {
          handleAnalyzeText(transcriptRef.current.trim());
        }
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      toast.error('Microphone initialization failed. Please type directly.');
    }
  };

  const stopRecordingAndProcess = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }

    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Automatically trigger AI extraction immediately when speech stops
    setTimeout(() => {
      if (transcriptRef.current.trim()) {
        handleAnalyzeText(transcriptRef.current.trim());
      }
    }, 150);
  };

  const processAudioWithGemini = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      const filename = audioBlob.type.includes('mp4') ? 'voice.mp4' : 'voice.webm';
      formData.append('file', audioBlob, filename);

      const res: any = await api.post('/ai/voice/parse-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = res?.data?.data || res?.data || res;
      if (payload) {
        if (payload.transcription) {
          setTranscript(payload.transcription);
        }

        const serverLang = payload.detectedLanguage || 'bn';
        setDetectedLang(
          serverLang === 'bn' ? 'bn' : serverLang === 'en' ? 'en' : 'bilingual',
        );
        setDetectedLangDisplay(
          serverLang === 'bn'
            ? 'বাংলা (Bengali Detected)'
            : serverLang === 'en'
              ? 'English (Detected)'
              : 'Bilingual (বাংলা + English)',
        );

        setAiLogId(payload.aiLogId || null);
        const expList = payload.parsedExpenses || payload.expenses || [];
        mapAndSetExpenses(expList);
      }
    } catch (err: any) {
      console.warn('Audio parse error, attempting text parse fallback:', err);
      if (transcriptRef.current.trim()) {
        handleAnalyzeText(transcriptRef.current.trim());
      } else {
        toast.error('AI voice recognition failed. Please try speaking again or type.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeText = async (textToParse?: string) => {
    const rawText = (typeof textToParse === 'string' ? textToParse : transcript).trim();
    if (!rawText) {
      return;
    }

    try {
      setIsAnalyzing(true);
      const autoLang = detectLanguageFromText(rawText);
      const languageToSend = autoLang === 'bn' ? 'bn' : autoLang === 'en' ? 'en' : 'auto';

      const res: any = await api.post('/ai/voice/parse', {
        text: rawText,
        transcript: rawText,
        language: languageToSend,
      });

      const payload = res?.data?.data || res?.data || res;
      if (payload) {
        setAiLogId(payload.aiLogId || null);
        const serverLang = payload.detectedLanguage || languageToSend;
        setDetectedLang(serverLang === 'bn' ? 'bn' : serverLang === 'en' ? 'en' : 'bilingual');
        setDetectedLangDisplay(
          serverLang === 'bn'
            ? 'বাংলা (Bengali Processed)'
            : serverLang === 'en'
              ? 'English (Processed)'
              : 'Bilingual (বাংলা + English)',
        );
        const expList = payload.parsedExpenses || payload.expenses || [];
        mapAndSetExpenses(expList);
        if (expList.length > 0) {
          toast.success(`Extracted ${expList.length} expense(s)!`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || (typeof err === 'string' ? err : 'AI Voice parsing failed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mapAndSetExpenses = (expensesList: any[]) => {
    const mapped = expensesList.map((exp: any, idx: number) => {
      const descLower = (exp.description || '').toLowerCase();
      const catLower = (exp.categoryName || exp.categorySuggested || '').toLowerCase();

      // Match category by ID, exact name, Bengali name, or description keywords
      let matchedCat = categories.find(
        (c) =>
          c.id === exp.categoryId ||
          c.name.toLowerCase() === catLower ||
          (c.nameBn && (c.nameBn === exp.categoryName || c.nameBn === exp.categorySuggested)),
      );

      if (!matchedCat) {
        // Fallback keyword inference on the frontend
        if (/rickshaw|রিকশা|uber|উবার|pathao|পাঠাও|cng|bus|বাস|metro|train|taxi|fuel|petrol|fare|ভাড়া|transport/i.test(descLower)) {
          matchedCat = categories.find((c) => /transport|commute/i.test(c.name));
        } else if (/dinner|lunch|breakfast|food|খাবার|চা|tea|coffee|snacks|burger|pizza|biryani|restaurant|hotel|bazar|বাজার/i.test(descLower)) {
          matchedCat = categories.find((c) => /food|groceries/i.test(c.name));
        } else if (/medicine|ঔষধ|doctor|hospital|clinic|pharmacy/i.test(descLower)) {
          matchedCat = categories.find((c) => /health|medical/i.test(c.name));
        } else if (/electricity|current|gas|wifi|internet|recharge|flexiload|bill|বিল/i.test(descLower)) {
          matchedCat = categories.find((c) => /bill|utilit/i.test(c.name));
        } else if (/rent|house|বাসা|flat/i.test(descLower)) {
          matchedCat = categories.find((c) => /housing|rent/i.test(c.name));
        } else if (/dress|shirt|pant|shoes|shopping|daraz|market|কেনাকাটা/i.test(descLower)) {
          matchedCat = categories.find((c) => /shop/i.test(c.name));
        }
      }

      let matchedPm = paymentMethods.find(
        (p) =>
          p.id === exp.paymentMethodId ||
          p.name.toLowerCase() === (exp.paymentMethodName || exp.paymentMethodSuggested || '').toLowerCase() ||
          (p.nameBn && (p.nameBn === exp.paymentMethodName || p.nameBn === exp.paymentMethodSuggested)),
      );

      if (!matchedPm) {
        if (/bkash|বিকাশ/i.test(descLower)) {
          matchedPm = paymentMethods.find((p) => /bkash/i.test(p.name));
        } else if (/nagad|নগদ/i.test(descLower)) {
          matchedPm = paymentMethods.find((p) => /nagad/i.test(p.name));
        } else if (/rocket|রকেট/i.test(descLower)) {
          matchedPm = paymentMethods.find((p) => /rocket/i.test(p.name));
        } else if (/card|কার্ড|bank/i.test(descLower)) {
          matchedPm = paymentMethods.find((p) => /card|bank/i.test(p.name));
        }
      }

      const finalCat = matchedCat || categories[0];
      const finalPm = matchedPm || paymentMethods[0];

      return {
        id: `temp-${idx}`,
        amount: exp.amount,
        currency: 'BDT',
        categoryId: finalCat?.id || '',
        categoryName: finalCat?.name || 'General',
        paymentMethodId: finalPm?.id || '',
        paymentMethodName: finalPm?.name || 'Cash',
        description: exp.description || finalCat?.name || 'Expense',
        merchant: exp.merchant || '',
        expenseDate: exp.expenseDate || exp.date || new Date().toISOString().split('T')[0],
      };
    });
    setParsedExpenses(mapped);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...parsedExpenses];
    updated[index] = { ...updated[index], [field]: value };
    setParsedExpenses(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = parsedExpenses.filter((_, idx) => idx !== index);
    setParsedExpenses(updated);
  };

  const handleConfirmAll = async () => {
    try {
      setIsConfirming(true);
      const payload = {
        aiLogId,
        source: 'voice',
        expenses: parsedExpenses.map((exp) => ({
          amount: parseFloat(exp.amount),
          currency: 'BDT',
          categoryId: exp.categoryId,
          paymentMethodId: exp.paymentMethodId || null,
          description: exp.description || exp.categoryName || 'Voice Expense',
          merchant: exp.merchant || null,
          expenseDate: exp.expenseDate,
        })),
      };

      await api.post('/expenses/batch-confirm', payload);
      toast.success('All voice expenses recorded successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save confirmed expenses');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl focus:outline-none max-h-[92vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            animation: 'contentSlideIn 0.2s ease',
          }}
        >
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </Dialog.Close>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              <Microphone size={22} weight="bold" />
            </div>
            <div>
              <Dialog.Title className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {t.voiceInput}
                <span
                  className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                  }}
                >
                  AI Multilingual
                </span>
              </Dialog.Title>
              <Dialog.Description className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Switch Between The Supported Languages (বাংলা + English)
              </Dialog.Description>
            </div>
          </div>

          {/* Voice Capture & Automatic Language Detection Pill */}
          <div
            className="rounded-2xl p-5 mb-4 space-y-4"
            style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Real-time Language Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                <Globe size={15} weight="bold" style={{ color: 'var(--accent)' }} />
                <span>Speech Language:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLiveLang('bn-BD')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${liveLang === 'bn-BD'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 shadow-sm scale-105'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  title="Bangla Speech Recognition (bn-BD)"
                >
                  🇧🇩 বাংলা (bn-BD)
                </button>
                <button
                  type="button"
                  onClick={() => setLiveLang('en-US')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${liveLang === 'en-US'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40 shadow-sm scale-105'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  title="English Speech Recognition (en-US)"
                >
                  🇺🇸 English (en-US)
                </button>
              </div>
            </div>

            {/* Microphone Trigger Animation */}
            <div className="flex flex-col items-center justify-center py-5">
              <button
                onClick={startRecording}
                className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95"
                style={{
                  backgroundColor: isRecording ? '#ef4444' : '#ffffff',
                  color: isRecording ? '#ffffff' : '#dc2626',
                  border: isRecording ? 'none' : '2px solid #ef4444',
                  boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.4)' : '0 4px 14px rgba(220,38,38,0.15)',
                  transform: isRecording ? 'scale(1.08)' : 'scale(1)',
                }}
                title={isRecording ? 'Click to finish and parse' : 'Click to speak'}
              >
                {isAnalyzing ? (
                  <CircleNotch size={32} className="animate-spin text-red-600" weight="bold" />
                ) : (
                  <Microphone size={32} weight="fill" />
                )}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping" />
                )}
              </button>
              <p className="text-sm font-extrabold mt-3" style={{ color: isRecording ? '#ef4444' : 'var(--text-primary)' }}>
                {isRecording
                  ? (locale === 'bn' ? 'শুনছি... সম্পন্ন করতে মাইক্রোফোনে ক্লিক করুন' : 'Listening... Click mic to stop & extract')
                  : isAnalyzing
                    ? (locale === 'bn' ? 'এআই বিশ্লেষণ ও খরচ বের করছে...' : 'Analyzing & extracting with AI...')
                    : t.clickToSpeak}
              </p>
              <p className="text-xs mt-1 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isRecording
                  ? (locale === 'bn' ? 'কথা বলা শেষ হলে নিজে নিজেই এক্সট্র্যাক্ট হবে অথবা মাইকে ক্লিক করুন' : 'Auto-stops after silence or click mic to finish & extract immediately')
                  : t.voiceHintEg}
              </p>
            </div>

            {/* Real-time STT Editable Transcript area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span>{t.speechTranscript}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {locale === 'bn' ? '(প্রয়োজনে লিখে এডিট করতে পারেন)' : '(Editable — fix typos anytime)'}
                  </span>
                </label>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setDetectedLang('auto');
                      setDetectedLangDisplay('');
                    }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    {locale === 'bn' ? 'মুছে ফেলুন' : 'Clear Text'}
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    transcriptRef.current = e.target.value;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAnalyzeText(transcript.trim());
                    }
                  }}
                  placeholder={locale === 'bn' ? 'কথা বললে এখানে টেক্সট দেখা যাবে। এন্টার চাপলে এআই হিসাব করবে...' : 'Speech appears here in real-time as you talk. Press Enter to parse typed text...'}
                  rows={2}
                  className="input-base w-full p-3 rounded-xl text-xs font-medium outline-none resize-none transition-colors leading-relaxed border"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: isRecording ? '#ef444460' : 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. Parsed Output & Confirmation Area */}
          {parsedExpenses.length > 0 && (
            <div className="mt-5 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Sparkle size={16} weight="fill" style={{ color: 'var(--accent)' }} />
                  <span>{locale === 'bn' ? `এক্সট্র্যাক্ট করা খরচ (${toBengaliNumber(parsedExpenses.length)})` : `Extracted Expenses (${parsedExpenses.length})`}</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {locale === 'bn' ? 'রিভিউ ও কনফার্ম করুন' : 'Review & Confirm'}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {parsedExpenses.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl space-y-3 transition-all"
                    style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {t.amountTaka}
                        </label>
                        <input
                          type="number"
                          value={exp.amount}
                          onChange={(e) => handleUpdateItem(idx, 'amount', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs font-extrabold outline-none tabular-nums"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--accent)',
                            fontFamily: 'var(--font-geist-mono), monospace',
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {t.category}
                        </label>
                        <select
                          value={exp.categoryId}
                          onChange={(e) => handleUpdateItem(idx, 'categoryId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {locale === 'bn' ? (cat.nameBn || cat.name) : cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {locale === 'bn' ? 'মার্চেন্ট / দোকান (ঐচ্ছিক)' : 'Merchant (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={exp.merchant}
                          onChange={(e) => handleUpdateItem(idx, 'merchant', e.target.value)}
                          placeholder={locale === 'bn' ? 'যেমন: উবার, মীনা বাজার' : 'e.g. Uber, Meena Bazar'}
                          className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {t.paymentMethod}
                        </label>
                        <select
                          value={exp.paymentMethodId}
                          onChange={(e) => handleUpdateItem(idx, 'paymentMethodId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {paymentMethods.map((pm) => (
                            <option key={pm.id} value={pm.id}>
                              {locale === 'bn' ? (pm.nameBn || pm.name) : pm.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-0">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          {locale === 'bn' ? 'বাতিল' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setParsedExpenses([])}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}
                >
                  {locale === 'bn' ? 'মুছে ফেলুন' : 'Discard'}
                </button>
                <button
                  onClick={handleConfirmAll}
                  disabled={isConfirming}
                  className="btn-accent flex items-center gap-2 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md"
                >
                  <Check size={16} weight="bold" />
                  <span>{isConfirming ? 'Saving...' : `Confirm & Save (${parsedExpenses.length})`}</span>
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
