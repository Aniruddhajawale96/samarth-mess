"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ownerApi, qrApi } from "../../../../lib/api";
import { Card, CardHeader, CardContent, Button } from "../../../../components/ui";
import { UserAvatar, StatusBadge } from "../../../../components/domain";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanAttendancePage() {
  const [messId, setMessId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<"BREAKFAST" | "LUNCH" | "DINNER">("LUNCH");
  
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState<any>(null); // The resolved user
  const [scanError, setScanError] = useState(""); // UI error for the specific scan attempt
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScannerRunning, setIsScannerRunning] = useState(false);

  useEffect(() => {
    ownerApi.getOwnerMess().then(res => setMessId(res.mess.id)).catch(console.error);
    
    // Initialize scanner
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setScannerReady(true);
        startScanner();
      } else {
        setCameraError("No cameras found on this device.");
      }
    }).catch(err => {
      setCameraError("Camera access denied or unavailable.");
      console.error(err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) return;
    setScanning(true);
    setScannedData(null);
    setScanError("");
    setSuccessMsg("");
    
    scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        handleScan(decodedText);
      },
      () => {
        // Parse errors are ignored (happens when no QR is in frame)
      }
    ).then(() => {
      setIsScannerRunning(true);
    }).catch(err => {
      setCameraError("Failed to start camera.");
      console.error(err);
    });
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => setIsScannerRunning(false)).catch(console.error);
    }
  };

  const handleScan = async (token: string) => {
    if (processing || scannedData) return;
    
    stopScanner();
    setScanning(false);
    setProcessing(true);
    setScanError("");
    setSuccessMsg("");

    try {
      // 1. Resolve token to user
      const resolveRes = await qrApi.resolveQr(token) as any;
      const user = resolveRes.data.user;
      
      setScannedData({ token, user });

      // Automatically try to mark present if user is active
      if (user.status !== "ACTIVE") {
        setScanError("Customer account is disabled or inactive.");
        setProcessing(false);
        return;
      }

      await markPresent(token, user);
    } catch (err: any) {
      setScanError(err.message || "Invalid QR code or user not found.");
      setProcessing(false);
    }
  };

  const markPresent = async (token: string, user: any) => {
    if (!messId) {
      setScanError("Mess ID not loaded. Refresh page.");
      setProcessing(false);
      return;
    }
    
    setProcessing(true);
    setScanError("");
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      await ownerApi.scanQrAttendance({
        messId,
        date: today,
        mealType,
        token
      });
      
      setSuccessMsg(`Marked PRESENT for ${mealType.toLowerCase()}`);
      
      // Auto resume scanner after 2 seconds
      setTimeout(() => {
        startScanner();
      }, 2000);
    } catch (err: any) {
      // Handle the various failure states returned by the backend
      setScanError(err.message || "Failed to mark attendance.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <Link href="/owner/attendance" className="hint" style={{ fontSize: 13 }}>← Manual Attendance</Link>
        <h1 style={{ marginTop: 8 }}>Scan QR</h1>
      </div>

      <Card>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div>
            <label className="field-label">Meal Type</label>
            <select
              className="input"
              value={mealType}
              onChange={e => setMealType(e.target.value as any)}
              disabled={isScannerRunning}
              style={{ width: "100%" }}
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
            </select>
          </div>
          <p className="hint" style={{ fontSize: 13 }}>Make sure to select the correct meal type before scanning.</p>
        </CardContent>
      </Card>

      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, background: "var(--card)", border: "1px solid var(--line)" }}>
        {cameraError ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>
            <p style={{ fontWeight: 600 }}>Camera Error</p>
            <p style={{ fontSize: 14 }}>{cameraError}</p>
          </div>
        ) : (
          <div id="qr-reader" style={{ width: "100%", minHeight: 300, display: scanning ? "block" : "none" }} />
        )}
        
        {!scanning && scannedData && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <UserAvatar name={scannedData.user.name} profilePhotoUrl={scannedData.user.profilePhotoUrl} size="lg" />
            <p style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>{scannedData.user.name}</p>
            <StatusBadge status={scannedData.user.status} />
            
            {processing && <p style={{ marginTop: 16, color: "var(--primary)", fontWeight: 600 }}>Marking attendance...</p>}
            
            {successMsg && (
              <div style={{ marginTop: 16, padding: 12, background: "var(--green-soft)", color: "var(--green)", borderRadius: 8, fontWeight: 600 }}>
                ✓ {successMsg}
              </div>
            )}
            
            {scanError && (
              <div style={{ marginTop: 16, padding: 12, background: "#fbe5e3", color: "var(--red)", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                ✕ {scanError}
              </div>
            )}
            
            {!processing && !successMsg && (
              <Button
                variant="secondary"
                onClick={startScanner}
                style={{ marginTop: 24, width: "100%" }}
              >
                Scan Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
