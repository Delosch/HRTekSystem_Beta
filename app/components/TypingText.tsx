import { Typewriter } from 'react-simple-typewriter';

export default function TypingText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <Typewriter
        words={[text]}
        loop={1}
        cursor
        cursorStyle="|"
        typeSpeed={50}
        deleteSpeed={50}
        delaySpeed={1000}
      />
    </span>
  );
}