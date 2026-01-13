import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Copy, Check, Music } from 'lucide-react';
import { Song } from '@/contexts/PlayerContext';
import { toast } from 'sonner';
import { iosSpring, iosBounce } from '@/lib/animations';

interface ShareSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

const ShareSongModal = ({ isOpen, onClose, song }: ShareSongModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && song) {
      generateCard();
    }
  }, [isOpen, song]);

  const generateCard = async () => {
    if (!song || !canvasRef.current) return;

    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (1200x630 for social sharing)
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, canvas.height - 100, 250, 0, Math.PI * 2);
    ctx.fill();

    // Load and draw album art
    const coverSize = 350;
    const coverX = 100;
    const coverY = (canvas.height - coverSize) / 2;

    // Draw rounded rectangle for album art background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, coverX, coverY, coverSize, coverSize, 24);
    ctx.fill();

    if (song.cover_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = song.cover_url!;
        });

        // Draw rounded album art
        ctx.save();
        roundRect(ctx, coverX, coverY, coverSize, coverSize, 24);
        ctx.clip();
        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();
      } catch (e) {
        // Draw placeholder if image fails
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        roundRect(ctx, coverX, coverY, coverSize, coverSize, 24);
        ctx.fill();
      }
    }

    // Add shadow to album art
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    // Draw song info
    const textX = coverX + coverSize + 80;
    const textMaxWidth = canvas.width - textX - 80;

    // Song title
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    const title = truncateText(ctx, song.title, textMaxWidth);
    ctx.fillText(title, textX, canvas.height / 2 - 40);

    // Artist name
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText(song.artist, textX, canvas.height / 2 + 20);

    // Album (if exists)
    if (song.album) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillText(song.album, textX, canvas.height / 2 + 70);
    }

    // Music icon/branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('🎵', textX, canvas.height / 2 + 130);

    // Generate image URL
    const url = canvas.toDataURL('image/png');
    setCardUrl(url);
    setGenerating(false);
  };

  const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth) return text;
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const handleDownload = () => {
    if (!cardUrl || !song) return;

    const link = document.createElement('a');
    link.download = `${song.title} - ${song.artist}.png`;
    link.href = cardUrl;
    link.click();
    toast.success('Card downloaded! 🎵');
  };

  const handleShare = async () => {
    if (!cardUrl || !song) return;

    try {
      // Convert data URL to blob
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      const file = new File([blob], `${song.title}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${song.title} by ${song.artist}`,
          text: `Check out this song: ${song.title} by ${song.artist} 🎵`,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback to copy link
        handleCopyLink();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        handleCopyLink();
      }
    }
  };

  const handleCopyLink = () => {
    const shareText = `🎵 ${song?.title} by ${song?.artist}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 z-[60] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={iosSpring}
          >
            <div 
              className="w-full max-w-lg rounded-3xl overflow-hidden pointer-events-auto"
              style={{
                background: 'rgba(28, 28, 30, 0.98)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-semibold">Share Song</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Preview */}
              <div className="p-5">
                <div className="relative aspect-[1200/630] rounded-2xl overflow-hidden bg-black/50">
                  {generating ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : cardUrl ? (
                    <img src={cardUrl} alt="Share card" className="w-full h-full object-cover" />
                  ) : null}
                </div>

                {/* Hidden canvas for generation */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-5 pt-0">
                <motion.button
                  onClick={handleDownload}
                  disabled={!cardUrl}
                  className="flex-1 h-12 rounded-xl bg-white/10 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={iosBounce}
                >
                  <Download className="w-5 h-5" />
                  Download
                </motion.button>
                
                <motion.button
                  onClick={handleShare}
                  disabled={!cardUrl}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={iosBounce}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  {copied ? 'Copied!' : 'Share'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareSongModal;
