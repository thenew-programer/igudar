export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to <span className="text-igudar-primary">IGUDAR</span>
          </h1>
          <p className="text-xl text-igudar-secondary mb-8 max-w-2xl mx-auto">
            Moroccan Real Estate Fractional Investment Platform
          </p>
          <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto">
            <p className="text-igudar-muted">
              Project foundation setup complete. Ready for development.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}