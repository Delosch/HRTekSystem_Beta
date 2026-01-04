export default function BlobBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="absolute top-[15%] left-[10%] w-[28rem] h-[28rem] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-[30%] right-[10%] w-[30rem] h-[30rem] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[10%] left-[35%] w-[26rem] h-[26rem] bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
    </div>
  );
}