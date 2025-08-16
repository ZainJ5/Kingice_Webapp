import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Menu, Search } from 'lucide-react';

const Header = () => {
  const [logo, setLogo] = useState('/logo.png');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/logo');
        if (!response.ok) throw new Error('Failed to fetch logo');
        const data = await response.json();
        setLogo(data.logo);
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError('Failed to load logo');
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        setBranches(data);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
    fetchBranches();
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-black rounded-full px-3 py-2">
            <MapPin size={16} className="mr-1" />
            <span className="text-xs font-medium">Regal Lumier Lahore</span>
          </div>

          <div className="flex items-center bg-black rounded-full px-3 py-2">
            <Phone size={16} className="mr-1" />
            <span className="text-xs font-medium">03320222845</span>
          </div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
          <div className="bg-white rounded-full p-2 w-20 h-20 flex items-center justify-center shadow-md">
            {!loading && !error ? (
              <Image 
                src={logo} 
                alt="Logo" 
                width={70} 
                height={70} 
                className="rounded-full object-contain"
                priority
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center space-x-1">
            <Menu size={16} />
            <Search size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;