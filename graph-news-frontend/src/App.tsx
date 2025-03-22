import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Network, Brain, Newspaper, Zap, GitBranch, Lock, Globe, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import userService from "./services/user.service";
import User from "./model/User";
import GetUserResponse from "./model/response/GetUserResponse";

// Custom button component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string; children?: React.ReactNode }> = ({ children, className, ...props }) => (
  <button 
    className={`font-medium rounded-lg transition-all duration-300 ${className}`} 
    {...props}
  >
    {children}
  </button>
);

// Custom input component
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input 
    className={`rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 ${className}`} 
    {...props} 
  />
);

const Hero: React.FC<{user: User | null, darkMode: boolean}> = ({ user, darkMode }) => (
  <div className="container mx-auto px-6 pt-20 pb-24">
    <div className="flex flex-col md:flex-row md:items-center">
      <div className="md:w-1/2 mb-10 md:mb-0">
        <motion.h1 
          className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="block text-slate-800 dark:text-white">Transform News</span>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">Into Knowledge Graphs</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Our AI-powered platform analyzes news from around the world, creating interactive knowledge graphs that reveal connections and insights hidden in the data.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {user ? (
            <Link to="/upload">
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-3 rounded-lg flex items-center shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/30">
                <Zap className="w-5 h-5 mr-2" />
                Upload News
              </Button>
            </Link>
          ) : (
            <Link to="/sign-up">
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-3 rounded-lg flex items-center shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/30">
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
          )}
          <a href="#how-it-works">
            <Button className="border-2 border-indigo-600 bg-transparent hover:bg-indigo-50 dark:border-indigo-400 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-8 py-3 rounded-lg">
              Learn More
            </Button>
          </a>
        </motion.div>
      </div>
      <div className="md:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative"
        >
          <div className={`absolute inset-0 rounded-xl opacity-30 blur-2xl transition-all duration-500 ${
            darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-700' : 'bg-gradient-to-r from-blue-400 to-indigo-500'
          }`}></div>
          <div className="relative bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 p-6 rounded-xl shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-slate-800 dark:text-white">Knowledge Graph Explorer</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div className={`aspect-video rounded-lg overflow-hidden flex items-center justify-center transition-all duration-500 ${
              darkMode ? 'bg-slate-900 shadow-inner shadow-black/50' : 'bg-blue-50 shadow-inner shadow-blue-200'
            }`}>
              <svg className="w-full h-full opacity-90" viewBox="0 0 800 450">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? "#8b5cf6" : "#4f46e5"} />
                  </marker>
                </defs>
                
                {/* Nodes */}
                <circle cx="400" cy="225" r="40" fill={darkMode ? "#4f46e5" : "#3b82f6"} opacity="0.9" />
                <circle cx="250" cy="150" r="30" fill={darkMode ? "#8b5cf6" : "#6366f1"} opacity="0.9" />
                <circle cx="550" cy="150" r="30" fill={darkMode ? "#8b5cf6" : "#6366f1"} opacity="0.9" />
                <circle cx="200" cy="300" r="25" fill={darkMode ? "#a78bfa" : "#818cf8"} opacity="0.9" />
                <circle cx="350" cy="350" r="25" fill={darkMode ? "#a78bfa" : "#818cf8"} opacity="0.9" />
                <circle cx="450" cy="350" r="25" fill={darkMode ? "#a78bfa" : "#818cf8"} opacity="0.9" />
                <circle cx="600" cy="300" r="25" fill={darkMode ? "#a78bfa" : "#818cf8"} opacity="0.9" />
                <circle cx="650" cy="200" r="20" fill={darkMode ? "#c4b5fd" : "#a5b4fc"} opacity="0.9" />
                <circle cx="150" cy="200" r="20" fill={darkMode ? "#c4b5fd" : "#a5b4fc"} opacity="0.9" />
                
                {/* Edges */}
                <line x1="400" y1="225" x2="250" y2="150" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="225" x2="550" y2="150" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="225" x2="350" y2="350" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="225" x2="450" y2="350" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="250" y1="150" x2="150" y2="200" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="250" y1="150" x2="200" y2="300" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="550" y1="150" x2="650" y2="200" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="550" y1="150" x2="600" y2="300" stroke={darkMode ? "#8b5cf6" : "#6366f1"} strokeWidth="2" markerEnd="url(#arrowhead)" />
                
                {/* Pulse animation on main node */}
                <circle cx="400" cy="225" r="45" fill="none" stroke={darkMode ? "#4f46e5" : "#3b82f6"} strokeWidth="3">
                  <animate attributeName="r" values="45;55;45" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    
    <div className="mt-20 max-w-4xl mx-auto">
      <SearchBar darkMode={darkMode} />
    </div>
  </div>
);

// Fixed text colors for proper contrast in both modes
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  
  useEffect(() => {
    // Update the HTML class and localStorage when theme changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if(token){
      userService.getMe(token).then((response: GetUserResponse) => {
        setUser(response.user);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 transition-colors duration-500">
        <div className="w-16 h-16 border-4 border-dashed rounded-full border-indigo-500 animate-spin"></div>
      </div>
    );
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 text-slate-800 dark:text-white transition-colors duration-500">
      <Navbar user={user} darkMode={darkMode} toggleTheme={toggleTheme} />
      <Hero user={user} darkMode={darkMode} />
      <Features darkMode={darkMode} />
      <HowItWorks darkMode={darkMode} />
      <Testimonials darkMode={darkMode} />
      <CallToAction user={user} darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

const Navbar: React.FC<{user: User | null, darkMode: boolean, toggleTheme: () => void}> = ({ user, darkMode, toggleTheme }) => (
  <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">GraphNova</span>
    </div>
    <div className="hidden md:flex items-center space-x-8">
      <a href="#features" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors">Features</a>
      <a href="#how-it-works" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors">How it Works</a>
      <a href="#testimonials" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors">Testimonials</a>
    </div>
    <div className="flex items-center space-x-4">
      <Button 
        onClick={toggleTheme}
        className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30' 
            : 'bg-gradient-to-r from-amber-300 to-orange-400 shadow-lg shadow-amber-300/30'
        }`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={darkMode ? "dark" : "light"}
            initial={{ y: -20, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
      
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline-block text-slate-800 dark:text-white">Hello, {user.name}</span>
          <Link to="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-5 py-2">Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link to="/sign-in">
            <Button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">Sign In</Button>
          </Link>
          <Link to="/sign-up">
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-5 py-2">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  </nav>
);

const SearchBar: React.FC<{darkMode: boolean}> = ({darkMode}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.9 }}
    className={`flex items-center w-full backdrop-blur-sm border rounded-full p-2 shadow-xl transition-all duration-500 ${
      darkMode 
        ? 'bg-slate-800/50 border-slate-700 shadow-indigo-500/10' 
        : 'bg-white/80 border-indigo-100  shadow-blue-300/20'
    }`}
  >
    <Input 
      type="text" 
      placeholder="Search knowledge graphs..." 
      className={`flex-grow bg-transparent border-none focus:ring-indigo-500 ${
        darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-700'
      }`}
    />
    <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-3 rounded-full">
      <Search className="w-5 h-5" />
    </Button>
  </motion.div>
);

const Features: React.FC<{darkMode: boolean}> = ({darkMode}) => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "AI-Powered Analysis",
      description: "Our advanced AI analyzes news articles and extracts entities, relationships, and key insights automatically."
    },
    {
      icon: <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Interactive Knowledge Graphs",
      description: "Visualize complex relationships between entities in dynamic, interactive knowledge graphs."
    },
    {
      icon: <Newspaper className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Real-time News Processing",
      description: "Stay updated with the latest connections as our platform processes news in real-time."
    },
    {
      icon: <GitBranch className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Pattern Recognition",
      description: "Discover hidden patterns and trends that might not be obvious from reading individual news articles."
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Global News Coverage",
      description: "Access knowledge graphs from news sources around the world, translated and connected."
    },
    {
      icon: <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Secure & Private",
      description: "Your data and interactions are protected with enterprise-grade security protocols."
    }
  ];

  return (
    <div id="features" className={`py-24 transition-colors duration-500 ${
      darkMode ? 'bg-slate-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-600'
            }`}>Powerful Features</h2>
          <p className={`text-xl max-w-3xl mx-auto ${
              darkMode ? 'text-white' : 'text-slate-600'
            }`}>
            Our platform offers a suite of cutting-edge tools to help you navigate the complex landscape of global news.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-xl p-6 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl ${
                darkMode 
                  ? 'bg-slate-800 border border-slate-700 hover:shadow-indigo-500/10' 
                  : 'bg-blue-50 border border-indigo-100 hover:shadow-blue-300/30'
              }`}
            >
              <div className={`p-3 rounded-lg w-fit mb-4 transition-colors duration-500 ${
                darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
              }`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-slate-700'
            }`}>{feature.title}</h3>
              <p className={`${
            darkMode ? 'text-white' : 'text-slate-600'
            }`}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HowItWorks: React.FC<{darkMode: boolean}> = ({darkMode}) => {
  const steps = [
    {
      number: "01",
      title: "News Collection",
      description: "Our system continuously gathers news from trusted sources around the world."
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Advanced NLP algorithms analyze and extract structured data from unstructured news text."
    },
    {
      number: "03",
      title: "Knowledge Extraction",
      description: "Entities, relationships, and key facts are identified and connected to existing knowledge."
    },
    {
      number: "04",
      title: "Graph Generation",
      description: "The processed information is transformed into interactive, navigable knowledge graphs."
    }
  ];

  return (
    <div id="how-it-works" className={`py-24 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-b from-slate-900 to-indigo-950' 
        : 'bg-gradient-to-b from-white to-blue-50'
    }`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-700'
          }`}>How It Works</h2>
          <p className={`text-xl max-w-3xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            From news to knowledge in four powerful steps
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex mb-12 last:mb-0"
            >
              <div className="mr-6">
                <div className={`text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-500 ${
                  darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
                }`}>
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-full w-0.5 mx-auto mt-2 transition-colors duration-500 ${
                    darkMode ? 'bg-indigo-700/30' : 'bg-indigo-200'
                  }`}></div>
                )}
              </div>
              <div className={`rounded-xl p-6 flex-1 transition-all duration-500 ${
                darkMode 
                  ? 'bg-slate-800/50 border border-slate-700 shadow-lg shadow-indigo-900/10' 
                  : 'bg-white border border-indigo-100 shadow-lg shadow-blue-200/30'
              }`}>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-700'
                }`}>{step.title}</h3>
                <p className={`${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC<{darkMode: boolean}> = ({darkMode}) => {
  const testimonials = [
    {
      quote: "GraphNova has completely transformed how I understand complex news topics. The visual connections make it so much easier to see the big picture.",
      author: "Sarah J., Journalist",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "As a researcher, I've found the knowledge graphs invaluable for discovering connections I would have otherwise missed. It's like having a research assistant that never sleeps.",
      author: "Dr. Michael T., Academic",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      quote: "The pattern recognition capabilities have given our company a competitive edge in understanding market trends before they become obvious to others.",
      author: "Elena R., Business Analyst",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <div id="testimonials" className={`py-24 transition-colors duration-500 ${
      darkMode ? 'bg-slate-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-700'
          }`}>What Our Users Say</h2>
          <p className={`text-xl max-w-3xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Join thousands of satisfied users who are discovering new insights every day
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`rounded-xl p-6 transition-all duration-500 ${
                darkMode 
                  ? 'bg-slate-800 border border-slate-700' 
                  : 'bg-blue-50 border border-indigo-100'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full overflow-hidden mr-4 border-2 transition-colors duration-500 ${
                  darkMode ? 'border-indigo-500' : 'border-indigo-200'
                }`}>
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className={`font-medium ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>{testimonial.author}</p>
                </div>
              </div>
              <p className={`italic ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CallToAction: React.FC<{user: User | null, darkMode: boolean}> = ({ user, darkMode }) => (
  <div className={`py-24 transition-all duration-500 ${
    darkMode 
      ? 'bg-gradient-to-r from-indigo-900 to-purple-900' 
      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
  }`}>
    <div className="container mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        {/* Always white text because both light/dark mode backgrounds are dark gradient */}
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform How You Understand News?</h2>
        <p className="text-xl text-white/90 mb-8">
          Join our growing community of researchers, journalists, analysts, and curious minds.
        </p>
        
        {user ? (
          <div className="space-y-6">
            <p className="text-white/90">Welcome back! Continue exploring or contribute to our knowledge database.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/dashboard">
                <Button className={`px-8 py-3 rounded-lg transition-colors duration-500 ${
                  darkMode
                    ? 'bg-white hover:bg-slate-100 text-indigo-900'
                    : 'bg-indigo-800 hover:bg-indigo-900 text-white'
                }`}>
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/upload">
                {/* Always white text because both button backgrounds are transparent on dark backgrounds */}
                <Button className="bg-transparent hover:bg-white/10 border-2 border-white text-white px-8 py-3 rounded-lg">
                  Upload News
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/sign-up">
                <Button className={`px-8 py-3 rounded-lg transition-colors duration-500 shadow-xl ${
                  darkMode
                    ? 'bg-white hover:bg-slate-100 text-indigo-900 shadow-white/20'
                    : 'bg-indigo-800 hover:bg-indigo-900 text-white shadow-indigo-900/30'
                }`}>
                  Get Started — It's Free
                </Button>
              </Link>
              <Link to="/sign-in">
                {/* Always white text because both button backgrounds are transparent on dark backgrounds */}
                <Button className="bg-transparent hover:bg-white/10 border-2 border-white text-white px-8 py-3 rounded-lg">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/80">No credit card required. Start with our free tier today.</p>
          </div>
        )}
      </motion.div>
    </div>
  </div>
);

const Footer: React.FC<{darkMode: boolean}> = ({darkMode}) => (
  <footer className={`pt-16 pb-8 border-t transition-colors duration-500 ${
    darkMode 
      ? 'bg-slate-900 border-slate-800' 
      : 'bg-white border-slate-200'
  }`}>
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        <div>
          <h4 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>About</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Team</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Careers</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Product</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Features</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Pricing</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>API</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Documentation</a></li>
          </ul>
        </div>
        <div>
          <h4 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Resources</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Tutorials</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Examples</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Community</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Research</a></li>
          </ul>
        </div>
        <div>
          <h4 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Privacy</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Terms</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Security</a></li>
            <li><a href="#" className={`transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Cookies</a></li>
          </ul>
        </div>
      </div>
      
      <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center transition-colors duration-500 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center mb-4 md:mb-0">
          <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className={`font-bold text-lg ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>GraphNova</span>
        </div>
        <div className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          &copy; 2025 GraphNova. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);
export default App;