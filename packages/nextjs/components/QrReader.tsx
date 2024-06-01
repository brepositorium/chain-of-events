import { SetStateAction, useEffect, useRef, useState } from "react";
import React from "react";
import Image from "next/image";
import QrScanner from "qr-scanner";

const QrReader = ({ onScanComplete }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current!,
      (result: { data: SetStateAction<string> }) => {
        onScanComplete(result.data);
        qrScanner.stop();
        setShowScanner(false);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );

    qrScanner.start();

    return () => qrScanner.stop();
  }, [onScanComplete]);

  return (
    <>
      {showScanner ? (
        <div className="flex justify-center items-center p-4">
          <div className="relative w-80 h-80 bg-black p-5 rounded-lg shadow-lg">
            <video ref={videoRef} className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-4">
          <Image
            src="/green-checkmark.png"
            width={128}
            height={128}
            alt="Green checkmark representing scan was successful"
          />
          <span className="text-lg font-bold">Scan was successful</span>
        </div>
      )}
    </>
  );
};

export default QrReader;
