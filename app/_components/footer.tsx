export default function Footer() {
  return (
    <footer className="bg-blue-brand py-8 px-4">
      <div className="container mx-auto max-w-6xl text-center text-white">
        <p>
          &copy; {new Date().getFullYear()} Ortoclub Vídeos. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
