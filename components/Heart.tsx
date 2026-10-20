export function Heart({ className = "heart" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-6.7-4.3-9.3-8.1C.6 9.8 1.6 5.6 5 4.3c2-.8 4.3-.1 5.6 1.6l1.4 1.8 1.4-1.8c1.3-1.7 3.6-2.4 5.6-1.6 3.4 1.3 4.4 5.5 2.3 8.6C18.7 16.7 12 21 12 21z" />
    </svg>
  );
}
