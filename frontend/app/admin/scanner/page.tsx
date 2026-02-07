"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Camera, Check, AlertCircle } from "lucide-react";

export default function AdminScannerPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string>("");
  const [eventName, setEventName] = useState("");
  const [coins, setCoins] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const startScanner = async () => {
    if (scanning) return;
    setScanning(true);
    setResult(null);

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text: string) => {
          setScannedUserId(text);
          scanner.stop().catch(console.error);
          setScanning(false);
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error);
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleCheckIn = async () => {
    if (!scannedUserId || !eventName.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      await api("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({
          user_id: parseInt(scannedUserId),
          event_name: eventName,
          coins: parseInt(coins) || 10,
        }),
      });
      setResult({ success: true, message: `Checked in user #${scannedUserId} — ${coins} coins awarded!` });
      setScannedUserId("");
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Check-in failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <QrCode className="h-6 w-6" /> QR Scanner
      </h1>

      {/* Scanner Area */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" />
          {!scanning ? (
            <Button onClick={startScanner} className="w-full">
              <Camera className="h-4 w-4 mr-2" /> Start Camera
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanner} className="w-full">
              Stop Camera
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Check-in Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">User ID (from QR)</label>
            <Input
              value={scannedUserId}
              onChange={(e) => setScannedUserId(e.target.value)}
              placeholder="Scan QR or enter user ID"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Event Name</label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Weekly Meeting"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Coins to Award</label>
            <Input
              type="number"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              placeholder="10"
            />
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              result.success ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
            }`}>
              {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {result.message}
            </div>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={submitting || !scannedUserId || !eventName.trim()}
            className="w-full"
          >
            {submitting ? "Processing..." : "Check In & Award Coins"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
