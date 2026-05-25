import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Eye,
  Package,
  Barcode,
  Award,
  ShieldCheck,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AnalysisResult({
  result,
  onBackToScanner,
  onBackToHome,
}) {
  const getStatusConfig = () => {
    switch (result.status) {
      case 'authentic':
        return {
          icon: ShieldCheck,
          color: 'from-emerald-500 to-green-500',
          bgGlow: 'from-emerald-500/30 to-green-500/30',
          border: 'border-emerald-500/50',
          text: 'Verified Authentic',
          message: 'This product has been verified as genuine',
          accent: 'emerald',
        };

      case 'suspicious':
        return {
          icon: AlertCircle,
          color: 'from-amber-500 to-orange-500',
          bgGlow: 'from-amber-500/30 to-orange-500/30',
          border: 'border-amber-500/50',
          text: 'Counterfeit Risk Detected',
          message:
            'Our analysis has identified potential authenticity concerns',
          accent: 'amber',
        };

      case 'fake':
        return {
          icon: XCircle,
          color: 'from-red-500 to-rose-500',
          bgGlow: 'from-red-500/30 to-rose-500/30',
          border: 'border-red-500/50',
          text: 'Likely Counterfeit',
          message:
            'Multiple indicators suggest this product is not genuine',
          accent: 'red',
        };

      default:
        return {
          icon: Shield,
          color: 'from-cyan-500 to-blue-500',
          bgGlow: 'from-cyan-500/30 to-blue-500/30',
          border: 'border-cyan-500/50',
          text: 'Analyzing',
          message: 'Processing product authenticity...',
          accent: 'cyan',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <section className="min-h-screen pt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-12"
        >
          <button
            onClick={onBackToHome}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-xl"
          >
            ← Home
          </button>

          <button
            onClick={onBackToScanner}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-xl"
          >
            Scan Another Product
          </button>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-12"
        >
          {/* Animated Glow */}
          <motion.div
            className={`absolute -inset-6 bg-linear-to-r ${statusConfig.bgGlow} rounded-[2.5rem] blur-3xl`}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Glassmorphic Card */}
          <div
            className={`relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 ${statusConfig.border} rounded-4xl p-12 text-center shadow-2xl overflow-hidden`}
          >
            {/* Overlay */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${statusConfig.bgGlow} opacity-10`}
            />

            <div className="relative z-10">
              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="relative inline-block mb-8"
              >
                <motion.div
                  className={`absolute inset-0 bg-linear-to-r ${statusConfig.color} rounded-full blur-3xl`}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div
                  className={`relative w-32 h-32 bg-linear-to-br ${statusConfig.color} rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20`}
                >
                  <StatusIcon className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </motion.div>

              {/* Status Text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-bold mb-4"
              >
                {statusConfig.text}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
              >
                {statusConfig.message}
              </motion.p>

              {/* Authenticity Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="max-w-md mx-auto"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/60">
                    Authenticity Score
                  </span>

                  <span className="text-3xl font-bold bg-linear-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {result.score}%
                  </span>
                </div>

                <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
                  <motion.div
                    className={`h-full bg-linear-to-r ${statusConfig.color} rounded-full shadow-lg`}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{
                      delay: 0.8,
                      duration: 1.5,
                      ease: 'easeOut',
                    }}
                  />
                </div>

                <div className="mt-3 text-sm text-white/50">
                  Confidence Level:{' '}
                  <span className="capitalize font-semibold text-white/70">
                    {result.confidence}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scanned Code */}
        {result.scannedCode && result.codeType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative mb-12"
          >
            <div className="absolute -inset-4 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl" />

            <div className="relative bg-linear-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  {result.codeType === 'QR Code' ? (
                    <QrCode className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Barcode className="w-6 h-6 text-cyan-400" />
                  )}
                </div>

                <h3 className="text-2xl font-bold">
                  Scanned {result.codeType}
                </h3>
              </div>

              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
                <div className="text-sm text-white/60 mb-2">
                  Code Value:
                </div>

                <div className="text-xl font-mono text-cyan-400 break-all">
                  {result.scannedCode}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suspicious Reasons */}
        {result.status === 'suspicious' &&
          result.reasons &&
          result.reasons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative mb-12"
            >
              <div className="absolute -inset-4 bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl" />

              <div className="relative bg-linear-to-br from-white/5 to-white/0 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>

                  <h3 className="text-2xl font-bold">
                    Detected Concerns
                  </h3>
                </div>

                <div className="space-y-4">
                  {result.reasons.map((reason, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                      }}
                      className="flex gap-4 items-start bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>

                      <p className="text-white/80 leading-relaxed">
                        {reason}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
      </div>
    </section>
  );
}