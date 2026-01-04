import { motion } from "framer-motion";

export default function Terms() {
  return (
     <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-[#13C296] text-white py-6">
        <h1 className="text-center text-3xl font-bold">Terms & Conditions</h1>
      </header>

      <main className="flex-1 max-w-4xl mx-auto py-10 px-4 space-y-10">
        <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-[#13C296]">1. Introduction</h2>
        <p className="text-gray-700">
          Welcome to our B2B platform. By using our services, you agree to these Terms & Conditions.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-[#13C296]">2. Use of Service</h2>
        <p className="text-gray-700">
          You must comply with applicable laws and avoid misuse...
        </p>
      </motion.section>
      </main>
    </div>
   
  );
}