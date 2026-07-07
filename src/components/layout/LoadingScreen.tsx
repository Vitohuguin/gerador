import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="w-16 h-16 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #A855F7, #D946EF, #7C3AED, #A855F7)',
                padding: 3,
              }}
            >
              <div className="w-full h-full rounded-full bg-bg-primary" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="absolute inset-0 w-16 h-16 rounded-full opacity-30"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(168,85,247,0.5), transparent)',
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h2 className="gradient-text text-2xl font-bold mb-2">
              PromptForge AI
            </h2>
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-pink-500"
              />
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
              <span className="text-zinc-500 text-sm ml-2">Carregando...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
