
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Phone, 
  FileCheck, 
  Loader2,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Globe,
  ArrowRight,
  Mail,
  Briefcase,
  DollarSign,
  Info,
  Filter,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Wrench,
  Stethoscope,
  Code2,
  ShoppingCart,
  Truck,
  Home as HomeIcon,
  Calculator,
  HardHat,
  Link as LinkIcon,
  Zap,
  Bell,
  BellRing,
  Trash2,
  BadgeCheck,
  AlertTriangle,
  FileUp
} from 'lucide-react';
import { Job, Region, VerificationStep, VerificationResult, JobAlert } from './types';
import { MOCK_JOBS } from './constants';
import { verifyDocument, enhanceSelfie, generateJobVisual } from './services/geminiService';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState<Region>('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState<'ALL' | 'blue-collar' | 'professional'>('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  
  // Track jobs user has personally verified for
  const [userVerifiedJobIds, setUserVerifiedJobIds] = useState<Set<string>>(new Set());
  
  // Job Alert State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Verification simulation state
  const [verificationMode, setVerificationMode] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { label: 'Passport Verification', status: 'pending' },
    { label: 'GAMCA Medical Report', status: 'pending' },
    { label: 'Police Clearance Certificate', status: 'pending' },
    { label: 'Professional Selfie', status: 'pending' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verification Progress calculation
  const verificationProgress = useMemo(() => {
    const completed = steps.filter(s => s.status === 'completed').length;
    return (completed / steps.length) * 100;
  }, [steps]);

  // Derived subcategories based on current job type filter
  const availableSubCategories = useMemo(() => {
    const relevantJobs = jobTypeFilter === 'ALL' 
      ? MOCK_JOBS 
      : MOCK_JOBS.filter(j => j.type === jobTypeFilter);
    const cats = Array.from(new Set(relevantJobs.map(j => j.subCategory)));
    return cats.sort();
  }, [jobTypeFilter]);

  // Derived unique sites from data
  const availableSites = useMemo(() => {
    return Array.from(new Set(MOCK_JOBS.map(j => j.site))).sort();
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || region !== 'ALL' || jobTypeFilter !== 'ALL' || subCategoryFilter !== 'ALL' || siteFilter !== 'ALL';
  }, [searchTerm, region, jobTypeFilter, subCategoryFilter, siteFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRegion('ALL');
    setJobTypeFilter('ALL');
    setSubCategoryFilter('ALL');
    setSiteFilter('ALL');
  }, []);

  // Reset sub-category if it's no longer available for the current job type
  useEffect(() => {
    if (subCategoryFilter !== 'ALL' && !availableSubCategories.includes(subCategoryFilter)) {
      setSubCategoryFilter('ALL');
    }
  }, [availableSubCategories, subCategoryFilter]);

  const filterJobs = useCallback(() => {
    let filtered = [...MOCK_JOBS];
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(lowerSearch) ||
        j.description.toLowerCase().includes(lowerSearch) ||
        j.company.toLowerCase().includes(lowerSearch) ||
        j.location.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (region !== 'ALL') {
      filtered = filtered.filter(j => j.region === region);
    }
    
    if (jobTypeFilter !== 'ALL') {
      filtered = filtered.filter(j => j.type === jobTypeFilter);
    }

    if (subCategoryFilter !== 'ALL') {
      filtered = filtered.filter(j => j.subCategory === subCategoryFilter);
    }

    if (siteFilter !== 'ALL') {
      filtered = filtered.filter(j => j.site === siteFilter);
    }
    
    setJobs(filtered);
  }, [searchTerm, region, jobTypeFilter, subCategoryFilter, siteFilter]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setViewingJob(null);
    setIsApplying(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setUniqueCode(code);
  };

  const handleFinishVerification = () => {
    if (selectedJob) {
      setUserVerifiedJobIds(prev => new Set(prev).add(selectedJob.id));
    }
    setVerificationMode(false);
  };

  const handleUndoStep = (index: number) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], status: 'pending', result: undefined };
    setSteps(updatedSteps);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) return;

    const newAlert: JobAlert = {
      id: Math.random().toString(36).substring(7),
      email: alertEmail,
      searchTerm,
      region,
      type: jobTypeFilter
    };

    setAlerts([...alerts, newAlert]);
    setIsAlertModalOpen(false);
    setAlertEmail('');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleGenerateImage = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setIsGeneratingImage(jobId);
    const result = await generateJobVisual(job.title, job.location);
    if (result) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, imageUrl: result } : j));
      if (viewingJob?.id === jobId) setViewingJob({ ...viewingJob, imageUrl: result });
    }
    setIsGeneratingImage(null);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const newSteps = [...steps];
    newSteps[index].status = 'verifying';
    setSteps(newSteps);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type;

      let result: VerificationResult;
      if (index === 3) {
        // Selfie enhancement
        await enhanceSelfie(base64);
        result = { valid: true, confidence: 95, issues: [] };
      } else {
        result = await verifyDocument(base64, mimeType);
      }

      const updatedSteps = [...steps];
      updatedSteps[index].status = result.valid ? 'completed' : 'failed';
      updatedSteps[index].result = result;
      setSteps(updatedSteps);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Icon mapping for subcategories
  const getSubCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'IT': return <Code2 size={14} />;
      case 'Healthcare': return <Stethoscope size={14} />;
      case 'Finance': return <Calculator size={14} />;
      case 'Engineering': return <HardHat size={14} />;
      case 'Domestic': return <HomeIcon size={14} />;
      case 'Retail': return <ShoppingCart size={14} />;
      case 'Logistics': return <Layers size={14} />;
      case 'Delivery': return <Truck size={14} />;
      case 'Trade': return <Wrench size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-bold">Job Alert Created Successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1a2b4b] text-white py-6 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg cursor-pointer" onClick={handleClearFilters}>
              <Globe className="text-[#1a2b4b] w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">GlobalPath</h1>
              <p className="text-sm text-gray-300">Kaseddie AI Recruitment Agent</p>
            </div>
          </div>
          
          <div className="flex bg-white/10 p-1 rounded-full overflow-hidden">
            {(['ALL', 'GCC', 'EUROPE'] as Region[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  region === r ? 'bg-yellow-500 text-[#1a2b4b]' : 'hover:bg-white/5'
                }`}
              >
                {r === 'ALL' ? 'Global View' : r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero & Search */}
      <section className="bg-gradient-to-b from-[#1a2b4b] to-[#243b6b] pt-12 pb-32 px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Find Your Future. We Verify Your Path.</h2>
        <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
          Aggregating verified roles across the GCC and Europe. 
          Use our AI agent to instantly pre-verify your documents for a faster visa process.
        </p>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-xl text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-yellow-500 text-[#1a2b4b] font-bold px-10 py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-xl text-lg">
            Search Jobs
          </button>
        </div>

        {/* Filter Section */}
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-yellow-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">General Filter:</span>
            </div>

            <div className="h-6 w-px bg-white/20 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Region:</span>
              {(['ALL', 'GCC', 'EUROPE'] as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    region === r 
                      ? 'bg-yellow-500 border-yellow-500 text-[#1a2b4b]' 
                      : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {region === r && <Check size={12} />}
                  {r === 'ALL' ? 'Global' : r}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/20 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Category:</span>
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'blue-collar', label: 'Blue-Collar' },
                { id: 'professional', label: 'Professional' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setJobTypeFilter(cat.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    jobTypeFilter === cat.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {jobTypeFilter === cat.id && <Check size={12} />}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sub-Category Filter */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-yellow-500/80 uppercase tracking-widest mr-2 flex items-center gap-2">
                <Briefcase size={14} /> Spec:
              </span>
              
              <button
                onClick={() => setSubCategoryFilter('ALL')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  subCategoryFilter === 'ALL' 
                    ? 'bg-white text-[#1a2b4b]' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                All Roles
              </button>

              {availableSubCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSubCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                    subCategoryFilter === cat 
                      ? 'bg-yellow-500 text-[#1a2b4b]' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {getSubCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>

            {/* Job Site Filter */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-blue-400/80 uppercase tracking-widest mr-2 flex items-center gap-2">
                <LinkIcon size={14} /> Source:
              </span>
              
              <button
                onClick={() => setSiteFilter('ALL')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  siteFilter === 'ALL' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                All Sites
              </button>

              {availableSites.map(site => (
                <button
                  key={site}
                  onClick={() => setSiteFilter(site)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 capitalize ${
                    siteFilter === site 
                      ? 'bg-blue-400 text-[#1a2b4b]' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-16 mb-12 flex-1 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-white">
              Showing <span className="text-yellow-500">{jobs.length}</span> active opportunities
            </h3>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="bg-red-500/20 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter flex items-center gap-2 transition-all border border-red-500/30"
              >
                <Trash2 size={14} /> Clear All Filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
             <p className="text-xs text-white font-medium hidden md:block opacity-80">Real-time updates from 4 job sites</p>
             <button 
              onClick={() => setIsAlertModalOpen(true)}
              className="bg-yellow-500 text-[#1a2b4b] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-yellow-400 transition-colors"
             >
                <Bell size={14} /> Set Alert
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? jobs.map((job) => {
            const isUserVerified = userVerifiedJobIds.has(job.id);
            return (
              <div 
                key={job.id} 
                onClick={() => setViewingJob(job)}
                className={`bg-white rounded-2xl shadow-md border hover:shadow-xl transition-all overflow-hidden group cursor-pointer hover:-translate-y-1 ${
                  isUserVerified ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                {/* Job Card Image Header */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {job.imageUrl ? (
                    <img src={job.imageUrl} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                      {isGeneratingImage === job.id ? (
                        <Loader2 className="animate-spin text-blue-600" />
                      ) : (
                        <>
                          <ImageIcon size={32} strokeWidth={1.5} />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleGenerateImage(job.id); }}
                            className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Sparkles size={12} /> Generate AI Visual
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {(job.isVerified || isUserVerified) && (
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                       {job.isVerified && (
                          <div className="bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-in fade-in slide-in-from-right-2">
                             <BadgeCheck size={14} />
                             <span className="text-[10px] font-black uppercase tracking-tighter">Verified Job</span>
                          </div>
                       )}
                       {isUserVerified && (
                          <div className="bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-in fade-in slide-in-from-right-2">
                             <ShieldCheck size={14} />
                             <span className="text-[10px] font-black uppercase tracking-tighter">Profile Ready</span>
                          </div>
                       )}
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${
                      job.type === 'professional' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {job.type}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm bg-white/90 text-gray-800 flex items-center gap-1">
                      {getSubCategoryIcon(job.subCategory)}
                      {job.subCategory}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="text-[9px] font-black uppercase bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full tracking-tighter">
                      {job.site}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                      {job.region}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} /> {job.postDate}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {job.title}
                    {job.isVerified && <BadgeCheck size={18} className="text-blue-600" />}
                  </h3>
                  <div className="flex items-center text-gray-600 gap-1 text-sm mb-3">
                    <Building2 size={16} /> {job.company}
                  </div>
                  
                  <div className="flex items-center text-gray-500 gap-1 text-sm mb-4">
                    <MapPin size={16} /> {job.location}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-6 h-10">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-semibold text-gray-900">{job.salaryHint}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job);
                      }}
                      className={`flex items-center gap-1 font-bold transition-all ${
                        isUserVerified ? 'text-green-600' : 'text-blue-600 hover:gap-2'
                      }`}
                    >
                      {isUserVerified ? 'Ready to Apply' : 'Apply & Verify'} <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Search size={48} className="text-gray-300" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">No matching jobs found</h4>
              <p className="text-gray-500 max-w-sm">Try adjusting your filters or search terms to find more opportunities.</p>
              <button 
                onClick={handleClearFilters}
                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <RotateCcw size={18} /> Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Job Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-8 text-white relative">
              <button 
                onClick={() => setIsAlertModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X />
              </button>
              <div className="flex items-center gap-4 mb-4">
                 <div className="bg-white/20 p-3 rounded-2xl">
                    <BellRing size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">Never miss an opening</h2>
                    <p className="text-blue-100 text-sm font-medium">Get real-time notifications for these criteria</p>
                 </div>
              </div>
            </div>
            
            <form onSubmit={handleCreateAlert} className="p-8">
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Keywords</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{searchTerm || 'Any'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Region</p>
                    <p className="text-sm font-bold text-gray-800">{region}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Job Type</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{jobTypeFilter === 'ALL' ? 'All Roles' : jobTypeFilter}</p>
                </div>

                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    required
                    type="email" 
                    placeholder="Enter your email address..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none text-lg transition-colors"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                   />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  Create Alert Now <Bell size={20} />
                </button>
                <p className="text-center text-[10px] text-gray-400 px-4">
                  By creating an alert, you agree to receive automated job updates based on your criteria. You can unsubscribe at any time.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header Visual */}
            <div className="relative h-64 bg-gray-900">
              {viewingJob.imageUrl ? (
                <img src={viewingJob.imageUrl} alt={viewingJob.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a2b4b]">
                   {isGeneratingImage === viewingJob.id ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-white" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Generating Visual...</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleGenerateImage(viewingJob.id)}
                        className="text-white/50 hover:text-white transition-colors flex flex-col items-center gap-2"
                      >
                        <Sparkles size={40} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Generate Cinematic Preview</span>
                      </button>
                    )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-3 mb-2">
                  {viewingJob.isVerified && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <BadgeCheck size={12} /> Verified Job
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    viewingJob.type === 'professional' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {viewingJob.type}
                  </span>
                  <span className="text-white/80 bg-white/20 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 font-bold tracking-widest">
                    {getSubCategoryIcon(viewingJob.subCategory)} {viewingJob.subCategory}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white">{viewingJob.title}</h2>
                <div className="flex items-center gap-4 text-blue-100 text-sm mt-1">
                  <span className="flex items-center gap-1"><Building2 size={14} /> {viewingJob.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {viewingJob.location}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingJob(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Estimated Salary</p>
                    <p className="text-sm font-bold text-gray-900">{viewingJob.salaryHint}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Category</p>
                    <p className="text-sm font-bold text-gray-900">{viewingJob.subCategory}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Posted Date</p>
                    <p className="text-sm font-bold text-gray-900">{viewingJob.postDate}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-blue-600" /> Job Overview
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {viewingJob.fullDescription || viewingJob.description}
                </p>
              </div>

              {viewingJob.contactInfo && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} /> Verified Recruiter Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-blue-800">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-blue-200 font-bold">
                        {viewingJob.contactInfo.recruiter.charAt(0)}
                      </div>
                      <span>{viewingJob.contactInfo.recruiter}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-blue-800">
                      <Mail size={16} />
                      <a href={`mailto:${viewingJob.contactInfo.email}`} className="hover:underline font-bold transition-all">{viewingJob.contactInfo.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-blue-800">
                      <Phone size={16} />
                      <a href={`tel:${viewingJob.contactInfo.phone}`} className="hover:underline font-bold transition-all">{viewingJob.contactInfo.phone}</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex flex-col md:flex-row gap-3">
              <button 
                onClick={() => handleApply(viewingJob)}
                className={`flex-1 font-black py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 ${
                  userVerifiedJobIds.has(viewingJob.id) 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-yellow-500 text-[#1a2b4b] hover:bg-yellow-400'
                }`}
              >
                {userVerifiedJobIds.has(viewingJob.id) ? 'Finalize Application' : 'Start AI Verification & Apply'} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => setViewingJob(null)}
                className="px-8 bg-white border border-gray-200 font-bold rounded-xl text-gray-500 py-4 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1a2b4b] p-8 text-white relative">
              <button 
                onClick={() => setIsApplying(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"
              >
                <X />
              </button>
              <h2 className="text-2xl font-bold mb-2">Ready to apply?</h2>
              <p className="text-blue-100">For {selectedJob.title} at {selectedJob.company}</p>
            </div>
            
            <div className="p-8">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4">
                <div className="bg-blue-600 p-3 rounded-xl h-fit">
                  <ShieldCheck className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">GlobalPath Verification Agent</h4>
                  <p className="text-sm text-blue-800">
                    To expedite your visa, our AI agent will verify your documents. Please complete this step to be shortlisted by the employer.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Step 1: Get Your Unique ID</p>
                  <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300">
                    <span className="text-2xl font-mono font-bold text-gray-800">{uniqueCode}</span>
                    <span className="text-xs text-gray-400">Application Reference</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-1.5 rounded-full mt-1">
                      <Phone className="text-green-600 w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">Send to WhatsApp</h5>
                      <p className="text-sm text-gray-600">Message our bot at <span className="font-bold">+1-555-GLOBAL</span> with code <span className="font-bold">{uniqueCode}</span> to begin submission.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button 
                    onClick={() => {
                      setIsApplying(false);
                      setVerificationMode(true);
                    }}
                    className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Launch Web Verification <ArrowRight size={20} />
                  </button>
                  <button 
                    onClick={() => setIsApplying(false)}
                    className="px-8 border border-gray-200 font-bold rounded-xl text-gray-500"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Simulator */}
      {verificationMode && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <nav className="bg-[#1a2b4b] p-4 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-2">
              <FileCheck className="text-yellow-500" />
              <span className="font-bold tracking-tight">AI Identity & Visa Shield</span>
            </div>
            <button onClick={() => setVerificationMode(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X />
            </button>
          </nav>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Verification Pipeline</h2>
                  <p className="text-gray-500 max-w-md">Our Kaseddie AI agent is processing your documents against {selectedJob?.location} visa requirements.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Progress</span>
                    <span className="text-xl font-bold text-gray-900">{Math.round(verificationProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Visual Progress Bar */}
              <div className="mb-10 relative">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-out relative"
                    style={{ width: `${verificationProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[move-stripe_2s_linear_infinite]" />
                  </div>
                </div>
                <div className="flex justify-between mt-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                       <div className={`w-3 h-3 rounded-full mb-1 transition-colors duration-500 ${
                         step.status === 'completed' ? 'bg-green-500' : step.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                       }`} />
                       <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                         step.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                       }`}>{step.label.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {steps.map((step, idx) => (
                  <div key={idx} className={`bg-white border rounded-3xl p-6 relative group/card overflow-hidden transition-all duration-300 ${
                    step.status === 'completed' ? 'border-green-200 shadow-lg shadow-green-500/5' : 
                    step.status === 'failed' ? 'border-red-400 bg-red-50/10 shadow-lg shadow-red-500/10 animate-shake' : 
                    'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl transition-all duration-500 ${
                          step.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          step.status === 'failed' ? 'bg-red-500 text-white' : 
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {step.status === 'completed' ? <CheckCircle2 size={24} /> : 
                           step.status === 'failed' ? <AlertTriangle size={24} /> : 
                           step.status === 'verifying' ? <Loader2 className="animate-spin" size={24} /> :
                           <Upload size={24} />}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg leading-tight">{step.label}</h4>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{step.status}</p>
                        </div>
                      </div>
                      
                      {/* Undo / Reset Button */}
                      {(step.status === 'completed' || step.status === 'failed') && (
                        <button 
                          onClick={() => handleUndoStep(idx)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-colors p-2 rounded-xl hover:bg-opacity-80 ${
                            step.status === 'failed' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Undo upload"
                        >
                          <RotateCcw size={14} /> {step.status === 'failed' ? 'Try Again' : 'Reset'}
                        </button>
                      )}
                    </div>

                    {step.status === 'pending' || step.status === 'failed' ? (
                      <div className="relative">
                        <label className={`group/upload flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                          step.status === 'failed' 
                            ? 'border-red-300 bg-red-50/50 hover:bg-red-50 hover:border-red-400' 
                            : 'border-gray-300 bg-gray-50/30 hover:bg-blue-50/50 hover:border-blue-400'
                        }`}>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(idx, e)} disabled={isProcessing} />
                          
                          <div className={`relative flex flex-col items-center justify-center p-6 text-center transition-transform duration-300 group-hover/upload:-translate-y-1`}>
                            {/* Visual Indicator Layer */}
                            <div className={`mb-4 p-4 rounded-2xl transition-all duration-300 shadow-sm ${
                              step.status === 'failed' 
                                ? 'bg-red-100 text-red-600 group-hover/upload:bg-red-200' 
                                : 'bg-white text-blue-600 group-hover/upload:shadow-md'
                            }`}>
                              <FileUp size={32} strokeWidth={2.5} className={isProcessing ? 'animate-bounce' : ''} />
                            </div>
                            
                            <h5 className="text-base font-black text-gray-900 mb-1">
                              {step.status === 'failed' ? 'Replace invalid file' : 'Drop file here or click to upload'}
                            </h5>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 bg-gray-100/50 px-3 py-1 rounded-full">
                               PNG, JPG up to 10MB
                            </p>
                          </div>

                          {/* Interactive "Drop Zone" background effect */}
                          <div className="absolute inset-0 opacity-0 group-hover/upload:opacity-10 transition-opacity bg-gradient-to-br from-blue-400 to-transparent pointer-events-none rounded-3xl" />
                        </label>
                      </div>
                    ) : step.status === 'verifying' ? (
                      <div className="w-full h-52 flex flex-col items-center justify-center gap-4 bg-blue-50 rounded-3xl border-2 border-blue-100 border-dashed">
                        <div className="relative">
                           <Loader2 className="animate-spin text-blue-600" size={40} />
                           <div className="absolute inset-0 bg-blue-600/10 blur-xl animate-pulse" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm text-blue-800 font-black uppercase tracking-widest mb-1">AI Engine Analyzing...</span>
                          <span className="text-xs text-blue-600/60 font-bold">Scanning metadata & biometrics</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-6 rounded-3xl border border-green-100 h-52 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-green-700 uppercase tracking-widest">AI Confirmation</span>
                          <div className="bg-green-200 px-3 py-1 rounded-full text-[10px] font-black text-green-800 flex items-center gap-1 shadow-sm">
                            <BadgeCheck size={12} /> {step.result?.confidence}% Confidence
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="bg-green-100 p-2 rounded-xl text-green-600 shadow-sm border border-green-200">
                             <Check size={20} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-base text-green-900 font-black leading-tight mb-1">Analysis Complete</p>
                              <p className="text-sm text-green-800/80 font-medium leading-relaxed">Document verified against {selectedJob?.location} visa standards. Biometric markers extracted.</p>
                           </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Prominent Failure Alert */}
                    {step.status === 'failed' && step.result?.issues && step.result.issues.length > 0 && (
                      <div className="mt-4 p-4 bg-white border border-red-200 rounded-2xl shadow-lg animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-3 text-red-600">
                           <AlertCircle size={18} strokeWidth={2.5} />
                           <p className="text-xs font-black uppercase tracking-widest">Validation Failed</p>
                        </div>
                        <div className="space-y-2">
                          {step.result.issues.map((issue, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100 group hover:bg-red-100 transition-colors">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                               <p className="text-sm text-red-800 font-bold leading-tight">{issue}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-center">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Please upload a valid document to continue</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {steps.every(s => s.status === 'completed') && (
                <div className="mt-12 p-10 bg-gradient-to-br from-green-600 to-green-700 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-bottom-12 duration-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={160} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <ShieldCheck size={48} />
                      </div>
                      <div>
                        <h3 className="text-4xl font-black tracking-tight">Visa Readiness: 100%</h3>
                        <p className="text-green-100 font-bold uppercase tracking-widest mt-1">Status: Pre-Approved by Kaseddie AI</p>
                      </div>
                    </div>
                    <p className="mb-8 text-xl text-green-50 font-medium leading-relaxed max-w-2xl">
                      Exceptional profile! Your documents perfectly match <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">{selectedJob?.location}</span> visa regulations. 
                      You have been fast-tracked in the <span className="font-black text-yellow-300">{selectedJob?.company}</span> hiring pool.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleFinishVerification}
                        className="bg-white text-green-700 font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        Finish & Apply Now <ArrowRight size={20} />
                      </button>
                      <button 
                        className="bg-green-800/50 backdrop-blur-md text-white font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-green-900/50 transition-all border border-white/10 flex items-center justify-center gap-2"
                      >
                        Get Digital Certificate <ImageIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-medium">© 2025 GlobalPath Kaseddie AI Agent. Powered by JobSpy & Gemini 2.5 Flash / 3 Pro.</p>
        </div>
      </footer>
      
      <style>{`
        @keyframes move-stripe {
          from { background-position: 0 0; }
          to { background-position: 2rem 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default App;
