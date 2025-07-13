import React, { useState, useEffect } from 'react';
import { Heart, Users, Target, Clock, Shield, Award, Plus, Search, Filter, Star, Globe, MapPin, Calendar, DollarSign, TrendingUp, CheckCircle, Wallet, ExternalLink, Copy, AlertCircle } from 'lucide-react';

// Stellar SDK imports (in a real app, these would be from npm packages)
const StellarSdk = window.StellarSdk || {
  Server: class MockServer {
    constructor() {
      this.accounts = () => ({
        accountId: () => ({
          call: () => Promise.resolve({
            account_id: 'GABC...WXYZ',
            sequence: '123456789'
          })
        })
      });
    }
  },
  Keypair: {
    fromSecret: () => ({ publicKey: () => 'GABC...WXYZ' }),
    random: () => ({ publicKey: () => 'GABC...WXYZ' })
  },
  TransactionBuilder: class MockTransactionBuilder {
    constructor() {
      this.addOperation = () => this;
      this.setTimeout = () => this;
      this.build = () => ({
        sign: () => {},
        toXDR: () => 'mock_xdr'
      });
    }
  },
  Operation: {
    invokeHostFunction: () => ({})
  },
  Networks: {
    TESTNET: 'Test SDF Network ; September 2015'
  }
};

const SaviaApp = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [campaigns, setCampaigns] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mintNft, setMintNft] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stellar, setStellar] = useState(null);

  // Contract configuration
  const CONTRACT_ADDRESS = 'CBXRIIYHKP6VU63KSLGBQ4GJ5FVTSAKTS4ZB3JEJJSQTCO6D3C2JVJIV';
  const NETWORK = 'TESTNET';
  const HORIZON_URL = 'https://horizon-testnet.stellar.org';

  // Initialize Stellar SDK
  useEffect(() => {
    initializeStellar();
  }, []);

  const initializeStellar = async () => {
    try {
      // In a real app, StellarSdk would be imported from npm
      const server = new StellarSdk.Server(HORIZON_URL);
      setStellar(server);
      
      // Try to connect to Freighter wallet if available
      if (window.freighter) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Failed to initialize Stellar:', error);
      setError('Failed to initialize Stellar connection');
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if Freighter is available
      if (!window.freighter) {
        setError('Freighter wallet not found. Please install Freighter extension.');
        return;
      }

      // Request access to wallet
      const isAllowed = await window.freighter.isAllowed();
      if (!isAllowed) {
        await window.freighter.requestAccess();
      }

      // Get user's public key
      const { publicKey } = await window.freighter.getPublicKey();
      setUserAddress(publicKey);
      setWalletConnected(true);
      
      // Initialize user profile
      await loadUserProfile(publicKey);
      
      setSuccess('Wallet connected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (address) => {
    try {
      // In a real implementation, this would call the contract's get_trust_score method
      const mockProfile = {
        address: address,
        trustScore: 67,
        totalDonated: 12500,
        campaignsSupported: 8,
        nftsOwned: 5,
        verificationLevel: 1
      };
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the contract
      // For now, using mock data with realistic structure
      const mockCampaigns = [
        {
          id: 'campaign_1',
          title: '',
          description: '',
          beneficiary: 'GBXR...',
          goalAmount: 50000,
          currentAmount: 32500,
          startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 23 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 85,
          category: 'Healthcare',
          location: '',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_2',
          title: '',
          description: '',
          beneficiary: 'GHIJ...',
          goalAmount: 25000,
          currentAmount: 18750,
          startTime: Date.now() - 14 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 16 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 92,
          category: 'Healthcare',
          location: '',
          image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_3',
          title: 'Medical Equipment for Local Hospital',
          description: 'Fundraising for critical medical equipment to improve healthcare services in our community hospital.',
          beneficiary: 'GNOP...EXAMPLE',
          goalAmount: 75000,
          currentAmount: 45000,
          startTime: Date.now() - 21 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 9 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 78,
          category: 'Healthcare',
          location: 'Brazil',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_4',
          title: 'Personal Medical Assistance Fund',
          description: 'Providing financial aid for individuals who need urgent medical treatments and cannot afford them.',
          beneficiary: 'GXYZ...EXAMPLE',
          goalAmount: 15000,
          currentAmount: 8000,
          startTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 27 * 24 * 60 * 60 * 1000,
          verified: false,
          trustScore: 65,
          category: 'Healthcare',
          location: 'USA',
          image: 'https://images.unsplash.com/photo-1576091160550-fd4279307c8e?w=400&h=300&fit=crop'        },
        {
          id: 'campaign_7',
          title: 'Education for Underprivileged Children',
          description: 'Providing access to quality education, school supplies, and learning resources for children in underserved communities.',
          beneficiary: 'GHIJ...EXAMPLE',
          goalAmount: 40000,
          currentAmount: 28000,
          startTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 20 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 88,
          category: 'Education',
          location: 'India',
          image: 'https://images.unsplash.com/photo-1546410531-bb4ffa2f653d?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_8',
          title: 'Clean Water Initiative',
          description: 'Drilling boreholes and installing water purification systems to provide clean and safe drinking water to rural villages.',
          beneficiary: 'GKLM...EXAMPLE',
          goalAmount: 60000,
          currentAmount: 50000,
          startTime: Date.now() - 18 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 12 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 90,
          category: 'Environment',
          location: 'Africa',
          image: 'https://images.unsplash.com/photo-1583258277348-d3119139886a?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_4',
          title: 'Support for Cancer Research',
          description: 'Funding innovative research to find new treatments and ultimately a cure for cancer.',
          beneficiary: 'GQRST...EXAMPLE',
          goalAmount: 100000,
          currentAmount: 75000,
          startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
          verified: true,
          trustScore: 95,
          category: 'Healthcare',
          location: 'Global',
          image: 'https://images.unsplash.com/photo-1576091160550-fd4279307c8e?w=400&h=300&fit=crop'
        },
        {
          id: 'campaign_5',
          title: 'Mental Health Awareness Program',
          description: 'Promoting mental health awareness and providing support services for individuals struggling with mental health issues.',
          beneficiary: 'GDEFG...EXAMPLE',
          goalAmount: 30000,
          currentAmount: 20000,
          startTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
          endTime: Date.now() + 25 * 24 * 60 * 60 * 1000,
          verified: false,
          trustScore: 70,
          category: 'Healthcare',
          location: 'USA',
          image: 'https://images.unsplash.com/photo-1534079346392-f5365c9ad973?w=400&h=300&fit=crop'
        },
        
      ];
      
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData) => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare contract call parameters
      const {
        title,
        description,
        goalAmount,
        durationDays,
        category,
        location,
        beneficiary
      } = campaignData;

      // In a real implementation, this would create a Stellar transaction
      // calling the create_campaign function on your smart contract
      
      const mockTransaction = {
        operation: 'create_campaign',
        parameters: {
          beneficiary: beneficiary || userAddress,
          title,
          description,
          goal_amount: parseFloat(goalAmount) * 10000000, // Convert to stroops
          duration_days: parseInt(durationDays),
          category,
          location
        }
      };

      console.log('Creating campaign with:', mockTransaction);

      // Mock successful campaign creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCampaign = {
        id: `campaign_${Date.now()}`,
        title,
        description,
        beneficiary: beneficiary || userAddress,
        goalAmount: parseFloat(goalAmount),
        currentAmount: 0,
        startTime: Date.now(),
        endTime: Date.now() + (parseInt(durationDays) * 24 * 60 * 60 * 1000),
        verified: false,
        trustScore: 0,
        category,
        location,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setSuccess('Campaign created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      return newCampaign.id;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      setError('Failed to create campaign: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!donationAmount || !selectedCampaign) {
      setError('Please enter a donation amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const amountInStroops = parseFloat(donationAmount) * 10000000; // Convert XLM to stroops
      
      // In a real implementation, this would create a Stellar transaction
      // calling the donate function on your smart contract
      const mockTransaction = {
        operation: 'donate',
        parameters: {
          campaign_id: selectedCampaign.id,
          donor: userAddress,
          amount: amountInStroops,
          anonymous: isAnonymous,
          mint_nft: mintNft
        }
      };

      console.log('Processing donation:', mockTransaction);

      // Mock the donation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate platform fee (2%)
      const platformFee = parseFloat(donationAmount) * 0.02;
      const netAmount = parseFloat(donationAmount) - platformFee;

      // Update campaign
      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.id === selectedCampaign.id) {
          return {
            ...campaign,
            currentAmount: campaign.currentAmount + netAmount
          };
        }
        return campaign;
      });
      setCampaigns(updatedCampaigns);

      // Update user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          totalDonated: userProfile.totalDonated + netAmount,
          campaignsSupported: userProfile.campaignsSupported + 1,
          nftsOwned: mintNft ? userProfile.nftsOwned + 1 : userProfile.nftsOwned
        });
      }

      setSuccess(`Successfully donated ${donationAmount} XLM to "${selectedCampaign.title}"!`);
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDonateModal(false);
      setDonationAmount('');
    } catch (error) {
      console.error('Failed to process donation:', error);
      setError('Failed to process donation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeTrustScore = async () => {
    if (!walletConnected) return;

    try {
      // In a real implementation, this would call the initialize_trust_score function
      console.log('Initializing trust score for:', userAddress);
      
      if (userProfile && userProfile.trustScore === 0) {
        setUserProfile({
          ...userProfile,
          trustScore: 50 // Default starting score
        });
      }
    } catch (error) {
      console.error('Failed to initialize trust score:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const categories = ['all', 'Healthcare', 'Education', 'Environment', 'Technology', 'Community'];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatTimeLeft = (endTime) => {
    const now = Date.now();
    const timeLeft = endTime - now;
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    return days > 0 ? `${days} days left` : 'Ended';
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const CampaignCard = ({ campaign }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={campaign.image} 
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {campaign.category}
          </span>
        </div>
        {campaign.verified && (
          <div className="absolute top-4 right-4">
            <div className="bg-green-500 text-white p-2 rounded-full">
              <CheckCircle size={16} />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{campaign.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={14} />
            <span>Trust: {campaign.trustScore}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-gray-500">Beneficiary:</span>
          <span className="font-mono text-gray-700">{formatAddress(campaign.beneficiary)}</span>
          <button 
            onClick={() => copyToClipboard(campaign.beneficiary)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy size={14} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {campaign.currentAmount.toLocaleString()} XLM raised
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              Goal: {campaign.goalAmount.toLocaleString()} XLM
            </span>
            <span className="text-sm text-gray-500">
              {formatTimeLeft(campaign.endTime)}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setSelectedCampaign(campaign);
            setShowDonateModal(true);
          }}
          disabled={!walletConnected}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
            walletConnected
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {walletConnected ? 'Donate Now' : 'Connect Wallet to Donate'}
        </button>
      </div>
    </div>
  );

  const CreateCampaignModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      goalAmount: '',
      durationDays: '',
      category: 'Healthcare',
      location: '',
      beneficiary: userAddress
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await createCampaign(formData);
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          goalAmount: '',
          durationDays: '',
          category: 'Healthcare',
          location: '',
          beneficiary: userAddress
        });
      } catch (error) {
        // Error is already handled in createCampaign
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  placeholder="Describe your campaign..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Amount (XLM)</label>
                  <input 
                    type="number" 
                    value={formData.goalAmount}
                    onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (days)</label>
                  <input 
                    type="number" 
                    value={formData.durationDays}
                    onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                    min="1"
                    max="365"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Environment</option>
                    <option>Technology</option>
                    <option>Community</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beneficiary Address</label>
                <input 
                  type="text" 
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({...formData, beneficiary: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Stellar address"
                  required
                />
              </div>
              
              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DonateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Donate to Campaign</h2>
          <p className="text-gray-600 mb-6">{selectedCampaign?.title}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (XLM)</label>
              <input 
                type="number" 
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Donate anonymously</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={mintNft}
                  onChange={(e) => setMintNft(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Mint donation NFT badge</span>
              </label>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Platform fee: 2% • Net donation: {donationAmount ? (donationAmount * 0.98).toFixed(2) : '0'} XLM
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setShowDonateModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDonate}
              disabled={loading || !donationAmount}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Donate Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const WalletConnection = () => (
    <div className="flex items-center gap-4">
      {walletConnected ? (
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">
            {formatAddress(userAddress)}
          </span>
          <button 
            onClick={() => copyToClipboard(userAddress)}
            className="text-green-600 hover:text-green-800"
          >
            <Copy size={14} />
          </button>
        </div>
      ) : (
        <button 
          onClick={connectWallet}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Wallet size={18} />
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );

  const NotificationBanner = () => (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess('')}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Savia
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                Stellar Crowdfunding Platform
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'explore' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Explore
                </button>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
              </div>
              
              <WalletConnection />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationBanner />
        
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Transparent Crowdfunding on Stellar
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Support impactful projects with blockchain transparency and earn NFT badges
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={!walletConnected}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    walletConnected 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus size={20} />
                  Create Campaign
                </button>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="border border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Raised</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {campaigns.reduce((sum, c) => sum + c.currentAmount, 0).toLocaleString()} XLM
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-800">{campaigns.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Target className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Backers</p>
                    <p className="text-2xl font-bold text-gray-800">1,247</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-800">87%</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <TrendingUp className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={20} />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-6 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded mb-4"></div>
                    <div className="bg-gray-200 h-2 rounded mb-4"></div>
                    <div className="bg-gray-200 h-10 rounded"></div>
                  </div>
                ))
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No campaigns found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {!walletConnected ? (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <Wallet className="mx-auto mb-4 text-gray-400" size={48} />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">
                  Connect your Stellar wallet to view your dashboard and manage your campaigns
                </p>
                <button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Wallet size={20} />
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : (
              <>
                {/* User Profile */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
                    <button 
                      onClick={initializeTrustScore}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Refresh Trust Score
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {userAddress.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {formatAddress(userAddress)}
                          </p>
                          <p className="text-sm text-gray-500">Stellar Address</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trust Score</span>
                          <span className="font-semibold text-gray-800">
                            {userProfile?.trustScore || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                            style={{ width: `${userProfile?.trustScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Donated</p>
                        <p className="text-xl font-bold text-blue-800">
                          {userProfile?.totalDonated?.toLocaleString() || 0} XLM
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Campaigns Supported</p>
                        <p className="text-xl font-bold text-green-800">
                          {userProfile?.campaignsSupported || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">NFT Badges</p>
                        <p className="text-xl font-bold text-purple-800">
                          {userProfile?.nftsOwned || 0}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Verification Level</p>
                        <p className="text-xl font-bold text-yellow-800">
                          {userProfile?.verificationLevel || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NFT Badges */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Your NFT Badges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((badge, index) => (
                      <div key={badge} className={`p-4 rounded-lg text-center ${
                        (userProfile?.nftsOwned || 0) > index 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Award className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-semibold">{badge}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {userProfile?.campaignsSupported > 0 ? (
                      Array.from({ length: Math.min(5, userProfile.campaignsSupported) }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Heart className="text-white" size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                Donated to campaign #{index + 1}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-green-600 font-semibold">
                            +{(Math.random() * 100 + 50).toFixed(0)} XLM
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No recent activity. Start by supporting a campaign!</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Contract Information Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Smart Contract</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-mono text-xs text-gray-800">
                    {formatAddress(CONTRACT_ADDRESS)}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Network:</span>
                  <span className="text-sm text-gray-800">{NETWORK}</span>
                </div>
                <a 
                  href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm"
                >
                  View on Stellar Expert
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Platform Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Transparent blockchain transactions</li>
                <li>• Trust score system</li>
                <li>• NFT donation badges</li>
                <li>• Anonymous donations</li>
                <li>• 2% platform fee</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Freighter wallet extension</li>
                <li>• Stellar testnet account</li>
                <li>• XLM for transactions</li>
                <li>• Modern web browser</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showCreateModal && <CreateCampaignModal />}
      {showDonateModal && <DonateModal />}
    </div>
  );
}

export default SaviaApp;
