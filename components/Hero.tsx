import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Global Vendors', value: '2K+', icon: '🌍' },
    { label: 'Products Listed', value: '100K+', icon: '📦' },
    { label: 'Happy Customers', value: '50K+', icon: '🎉' },
  ];

  return (
    <div className="relative bg-[#0A0118] min-h-screen">
      {/* Improved background with multiple layers */}
      <div className="absolute inset-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-slate-950/40" />
        
        {/* Animated gradient spots */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('/noise.png')]" />
      </div>

      <div className="relative container mx-auto px-4 pt-24 md:pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center lg:text-left w-full"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <span className="text-purple-400 text-sm font-medium">Web3 Marketplace</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </motion.div>
            
            {/* Improved mobile-responsive heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-[1.2] tracking-tight">
              <span className="block">Discover the New</span>
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-400">
                  Digital Economy
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-r from-purple-400/20 via-fuchsia-500/20 to-indigo-400/20 blur-xl" />
              </span>
            </h1>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto lg:mx-0 mb-6 md:mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
              <button className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg md:rounded-xl hover:opacity-90 transition-all">
                <FiSearch className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3 mb-8 md:mb-12">
              {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-lg bg-white/[0.03] backdrop-blur-sm border border-white/10 text-sm md:text-base text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right content - Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full lg:w-auto"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 pb-24">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="group p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{stat.icon}</span>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
