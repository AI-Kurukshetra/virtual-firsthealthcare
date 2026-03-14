"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TelehealthRoom() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    let localStream: MediaStream | null = null;

    async function init() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (!mounted) return;
        localStream = media;
        setStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
      } catch {
        setStream(null);
      }
    }

    init();

    return () => {
      mounted = false;
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    });
  };

  const toggleAudio = () => {
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    });
  };

  const shareScreen = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      const displayTrack = displayStream.getVideoTracks()[0];
      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
      }
      displayTrack.onended = () => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      };
    } catch {
      return;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        {!stream && (
          <div className="absolute inset-0 grid place-items-center text-white/60">
            Unable to access camera/mic
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <Button variant="secondary" size="sm" onClick={toggleAudio}>
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {isAudioEnabled ? "Mute" : "Unmute"}
          </Button>
          <Button variant="secondary" size="sm" onClick={toggleVideo}>
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            {isVideoEnabled ? "Stop video" : "Start video"}
          </Button>
          <Button variant="secondary" size="sm" onClick={shareScreen}>
            <Monitor className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <PhoneOff className="h-4 w-4" />
            End
          </Button>
        </div>
      </div>
      <div className="glass noise flex h-full flex-col gap-4 rounded-[32px] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Room status</p>
          <p className="mt-2 text-lg text-white">Appointment APT-201</p>
          <p className="text-sm text-white/50">Awaiting patient to join...</p>
        </div>
        <div className="flex-1 space-y-3 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <p>System: Session opened.</p>
          <p>Assistant: Upload latest labs before consult.</p>
        </div>
        <input
          placeholder="Send a secure message..."
          className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
        />
      </div>
    </div>
  );
}
