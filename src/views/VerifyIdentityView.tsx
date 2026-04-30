import * as React from "react";
import { motion } from "motion/react";
import { Shield, Scan } from "lucide-react";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import { Button } from "@/src/components/ui/Button";
import { Student } from "@/src/types";

interface VerifyIdentityViewProps {
  onVerify?: () => void;
  onVerifyWithStudent?: (student: Student) => void;
  onCancel: () => void;
  isAdmin?: boolean;
  indexNumber?: string;
}

export function VerifyIdentityView({ onVerify, onVerifyWithStudent, onCancel, isAdmin, indexNumber }: VerifyIdentityViewProps) {
  const [progress, setProgress] = React.useState(0);
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [faceDetected, setFaceDetected] = React.useState(false);
  const [scanMessage, setScanMessage] = React.useState("Position your face in the frame");
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const detectorRef = React.useRef<faceDetection.FaceDetector | null>(null);
  const detectIntervalRef = React.useRef<number | null>(null);
  const detectBusyRef = React.useRef(false);
  const autoStartRef = React.useRef(false);

  const stopDetectionLoop = React.useCallback(() => {
    if (detectIntervalRef.current !== null) {
      window.clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
  }, []);

  // When progress reaches 100, finalize verification
  React.useEffect(() => {
    if (isScanning && progress >= 100) {
      // stop scanning animation and camera
      setIsScanning(false);
      stopDetectionLoop();
      stopCamera();
      setScanMessage("Face verified");
      setTimeout(() => {
        if (onVerifyWithStudent && indexNumber) {
          const mockStudent: Student = {
            id: indexNumber,
            name: "John Doe",
            email: "student@htu.edu.gh",
            photoUrl: "https://picsum.photos/seed/student/200/240",
            department: "Computer Science",
            registrationDate: new Date().toISOString().split('T')[0],
            status: "Active",
          };
          onVerifyWithStudent(mockStudent);
        } else {
          if (onVerify) {
            onVerify();
          }
        }
      }, 800);
    }
  }, [progress, isScanning, onVerify, onVerifyWithStudent, indexNumber, stopCamera, stopDetectionLoop]);

  React.useEffect(() => {
    if (!isScanning || !cameraActive || !videoRef.current) {
      return;
    }

    let cancelled = false;

    const initDetector = async () => {
      try {
        setScanMessage("Loading face detector...");
        await tf.setBackend("webgl").catch(() => undefined);
        await tf.ready();

        if (cancelled) {
          return;
        }

        if (!detectorRef.current) {
          detectorRef.current = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: "tfjs",
              modelType: "short",
              maxFaces: 1,
            }
          );
        }

        setScanMessage("Align your face inside the frame");
        detectIntervalRef.current = window.setInterval(async () => {
          if (
            detectBusyRef.current ||
            !videoRef.current ||
            !detectorRef.current ||
            videoRef.current.readyState < 2
          ) {
            return;
          }

          detectBusyRef.current = true;
          try {
            const faces = await detectorRef.current.estimateFaces(videoRef.current);
            const faceCount = faces.length;
            const hasSingleFace = faceCount === 1;
            setFaceDetected(hasSingleFace);
            setProgress((prev) => {
              if (hasSingleFace) {
                return Math.min(100, prev + 4);
              }
              return Math.max(0, prev - 2);
            });
            if (faceCount > 1) {
              setScanMessage("Multiple faces detected. Only one face is allowed in the frame.");
            } else {
              setScanMessage(hasSingleFace ? "Face detected. Hold still..." : "No face detected. Center your face.");
            }
          } catch (error) {
            console.error("Face detection failed:", error);
          } finally {
            detectBusyRef.current = false;
          }
        }, 180);
      } catch (error) {
        console.error("Failed to initialize face detector:", error);
        setCameraError("Unable to initialize face detection on this device/browser.");
        setIsScanning(false);
        stopDetectionLoop();
        stopCamera();
      }
    };

    initDetector();

    return () => {
      cancelled = true;
      stopDetectionLoop();
      detectBusyRef.current = false;
    };
  }, [cameraActive, isScanning, stopCamera, stopDetectionLoop]);

  // Start camera and scanning
  const startScan = React.useCallback(async () => {
    setCameraError(null);
    setScanMessage("Opening camera...");
    setFaceDetected(false);
    setProgress(0);
    stopDetectionLoop();
    stopCamera();

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setIsScanning(false);
      setCameraError('Camera access requires HTTPS. Open the secure mobile preview URL instead of the HTTP address.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsScanning(false);
      setCameraError('This browser does not support camera access.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
        });
      }
      setCameraActive(true);
      setIsScanning(true);
    } catch (err) {
      console.error('Camera access denied or unavailable:', err);
      setIsScanning(false);
      setCameraError('Camera permission was denied or the browser blocked the camera. Open the secure preview URL and allow camera access.');
    }
  }, [stopCamera, stopDetectionLoop]);

  React.useEffect(() => {
    if (!autoStartRef.current) {
      autoStartRef.current = true;
      startScan();
    }
  }, [startScan]);

  const handleCancel = () => {
    stopDetectionLoop();
    stopCamera();
    setIsScanning(false);
    setProgress(0);
    setScanMessage("Position your face in the frame");
    onCancel();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopDetectionLoop();
      stopCamera();
      detectorRef.current?.dispose();
      detectorRef.current = null;
      detectBusyRef.current = false;
    };
  }, [stopCamera, stopDetectionLoop]);

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
          {/* Live camera feed */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full bg-black"
            style={{
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: cameraActive ? 1 : 0,
            }}
            autoPlay
            playsInline
            muted
          />

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
                {scanMessage}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full max-w-[320px] space-y-3 mb-10">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{faceDetected ? "Face Detected" : "Waiting for Face"}</span>
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
            {isScanning ? "Verifying..." : "Re-Scan Face"}
          </Button>
          <Button 
            variant="outline" 
            className="h-12 font-bold"
            onClick={handleCancel}
          >
            Cancel and Return
          </Button>
          {cameraError && (
            <p className="text-sm text-red-600 text-center leading-relaxed">
              {cameraError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
