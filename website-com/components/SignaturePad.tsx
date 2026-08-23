"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  hint?: string;
  clearLabel?: string;
};

export type SignaturePadHandle = {
  snapshot: () => string;
};

function exportInkOnly(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) return canvas.toDataURL("image/png");
  const { width, height } = canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  let ink = 0;
  for (let i = 0; i < d.length; i += 4) {
    const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
    const a = d[i + 3];
    const isInk = a > 20 && avg < 200 && !(avg < 8 && a < 40);
    if (isInk) {
      d[i] = 11;
      d[i + 1] = 28;
      d[i + 2] = 44;
      d[i + 3] = 255;
      ink += 1;
    } else {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
    }
  }
  if (ink < 40) return "";
  const copy = document.createElement("canvas");
  copy.width = width;
  copy.height = height;
  copy.getContext("2d")!.putImageData(img, 0, 0);
  return copy.toDataURL("image/png");
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  {
    value,
    onChange,
    label,
    hint = "Dessinez dans le cadre — souris, stylet ou doigt.",
    clearLabel = "Effacer et redessiner",
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    snapshot() {
      const canvas = canvasRef.current;
      if (!canvas) return "";
      return exportInkOnly(canvas);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const paint = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const prev = canvas.toDataURL("image/png");
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0B1C2C";
      const src = value || prev;
      if (src && src.length > 80) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = src;
      }
    };

    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
    // Intentionally once: resizing after draw is restored from the canvas itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function finishStroke() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChangeRef.current(exportInkOnly(canvas));
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!ctx) return;
    drawing.current = true;
    last.current = point(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current?.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!ctx) return;
    const next = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last.current = next;
  }

  useEffect(() => {
    const up = () => finishStroke();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    onChangeRef.current("");
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-xs uppercase tracking-wide text-champagne">{label}</p> : null}
      <p className="text-sm text-ink/60">{hint}</p>
      <canvas
        ref={canvasRef}
        className="h-44 w-full cursor-crosshair touch-none rounded-gi border border-ink/20 bg-transparent"
        style={{ touchAction: "none" }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
      />
      <button type="button" onClick={clear} className="text-xs uppercase tracking-wide text-champagne">
        {clearLabel}
      </button>
    </div>
  );
});
