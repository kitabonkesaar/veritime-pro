import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  isOpen: boolean;
  onCapture: (photoUrl: string) => void;
  onClose: () => void;
  type: 'clock-in' | 'clock-out';
}

export function CameraCapture({ isOpen, onCapture, onClose, type }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Unable to access camera. Please grant camera permissions.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is currently in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not match required constraints.';
        } else if (window.isSecureContext === false) {
           errorMessage = 'Camera access requires a secure connection (HTTPS).';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {type === 'clock-in' ? 'Clock In' : 'Clock Out'} Verification
            </h3>
            <p className="text-sm text-muted-foreground">
              Take a photo to verify your attendance
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary/50">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <div>
                  <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={startCamera}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  (isLoading || error) && "invisible"
                )}
              />
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera overlay guide */}
            {!capturedImage && !error && !isLoading && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-primary/50 rounded-full" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-xs bg-foreground/80 text-background px-3 py-1 rounded-full">
                    Position your face in the circle
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            {capturedImage ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={retakePhoto}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button 
                  variant="success" 
                  className="flex-1"
                  onClick={confirmPhoto}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm {type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                </Button>
              </>
            ) : (
              <Button 
                className="flex-1" 
                onClick={capturePhoto}
                disabled={isLoading || !!error}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
