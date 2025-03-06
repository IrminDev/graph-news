import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Card } from "./components/Card";
import { Link } from "react-router-dom";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 text-white p-6">
      <Header />
      <HeroSection />
      <NewsSection />
      <Footer />
    </div>
  );
};

const Header: React.FC = () => (
  <header className="flex justify-between items-center py-4 border-b border-white/20">
    <h1 className="text-3xl font-bold">News Graph AI</h1>
    <Link to="/sign-in">
      <Button className="bg-white text-blue-900 px-4 py-2 rounded-xl">Sign In</Button>
    </Link>
  </header>
);

const HeroSection: React.FC = () => (
  <main className="mt-12 flex flex-col items-center text-center">
    <motion.h2 
      className="text-4xl font-semibold mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Transforming News into Knowledge
    </motion.h2>
    <p className="text-lg text-white/80 max-w-2xl">
      Our AI-powered platform processes news and generates interactive knowledge graphs for better insights.
    </p>
    <SearchBar />
  </main>
);

const SearchBar: React.FC = () => (
  <div className="mt-8 flex items-center w-full max-w-md bg-white rounded-full p-2 shadow-lg">
    <Input type="text" placeholder="Search news..." className="flex-grow text-black px-4" />
    <Button className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-full">
      <Search className="w-5 h-5" />
    </Button>
  </div>
);

const NewsSection: React.FC = () => (
  <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map((_, index) => (
      <Card key={index} title={`News Title ${index + 1}`}>
        <p className="text-gray-600 mt-2">Short description of the news article goes here.</p>
        <Button className="mt-4 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-xl">Read More</Button>
      </Card>
    ))}
  </section>
);

const Footer: React.FC = () => (
  <footer className="mt-12 text-center text-white/70 text-sm">
    &copy; 2025 News Graph AI. All rights reserved.
  </footer>
);

export default App;
