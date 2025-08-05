import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Welcome to ImpactBoard
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing events and connect with expert coaches
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
