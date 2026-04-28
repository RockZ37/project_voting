import * as React from "react";
import { motion } from "motion/react";
import { Shield, Scan, Lock, EyeOff, Barcode, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface VerifyIdentityViewProps {
  onVerify: () => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

export function VerifyIdentityView({ onVerify, onCancel, isAdmin }: VerifyIdentityViewProps) {
  const [progress, setProgress] = React.useState(0);
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // progress interval
  React.useEffect(() => {
    let interval: any;
    if (isScanning && progress < 100) {
      interval = setInterval(() => {
        setProgress((p) => Math.min(100, p + 2.5));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // When progress reaches 100, finalize verification
  React.useEffect(() => {
    if (isScanning && progress >= 100) {
      // stop scanning animation and camera
      setIsScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setTimeout(onVerify, 800);
    }
  }, [progress, isScanning, onVerify]);

  // Start camera and scanning
  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setProgress(0);
      setIsScanning(true);
    } catch (err) {
      console.error('Camera access denied or unavailable', err);
      // fallback to mock image but still run scanning
      setCameraActive(false);
      setProgress(0);
      setIsScanning(true);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full flex flex-col items-center">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full mb-2">
            <Shield className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase">{isAdmin ? "Admin Authorization" : "Encrypted Identity Verification"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{isAdmin ? "Secure Administrator Verification" : "Secure Voter Identity Check"}</h1>
          <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            {isAdmin 
              ? "Complete biometric authentication to access the election administration dashboard."
              : "To maintain the integrity of this election, please complete a biometric facial scan to confirm your voter credentials."
            }
          </p>
        </div>

        {/* Biometric Frame */}
        <div className="relative w-full aspect-square max-w-[400px] rounded-full overflow-hidden border-8 border-white shadow-2xl mb-10 group bg-surface-container-highest">
          {/* Video Feed (camera) or Mock Video Feed / User Asset */}
          {cameraActive ? (
            <video
              ref={videoRef}
              className="absolute inset-0 object-cover bg-black"
              playsInline
              muted
            />
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000"
              style={{ backgroundImage: `url('https://picsum.photos/seed/voter/800/800')` }}
            />
          )}

          {/* Scanner Overlays */}
          <div className="absolute inset-0 bg-primary-container/40 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-radial-[circle,transparent_40%,rgba(19,27,46,0.8)_75%] pointer-events-none" />

          {/* Scanner UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-80 border-2 border-dashed border-white/20 rounded-[100px]">
              {/* Brackets */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-secondary rounded-tl-3xl" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-secondary rounded-tr-3xl" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-secondary rounded-bl-3xl" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-secondary rounded-br-3xl" />

              {/* Animated Scan Line */}
              {isScanning && (
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "90%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-secondary shadow-[0_0_15px_#316bf3]"
                />
              )}
            </div>
          </div>

          <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-primary/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
              <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                {isScanning ? "Scanning Active" : "Position Your Face In The Frame"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full max-w-[320px] space-y-3 mb-10">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{isScanning ? "Scanning..." : "Status Ready"}</span>
            <span className="text-xs font-semibold text-on-surface-variant">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
            <motion.div 
              className="h-full bg-secondary-container" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <Button 
            className="h-14 font-bold text-base gap-3" 
            onClick={startScan}
            disabled={isScanning}
          >
            <Scan size={20} />
            {isScanning ? "Verifying..." : "Scan Face"}
          </Button>
          <Button 
            variant="outline" 
            className="h-12 font-bold"
            onClick={onCancel}
          >
            Cancel and Return
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex items-center justify-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <Lock size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">AES-256 BIT</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Identity Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Zero-Knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
