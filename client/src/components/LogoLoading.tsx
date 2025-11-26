export function LogoLoading() {
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* TalkLink Logo */}
        <div className="mb-8 flex justify-center">
          <svg 
            className="w-16 h-16 text-talklink-500" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
        </div>
        
        {/* Animated Text */}
        <p className="text-slate-300 text-lg font-medium">
          <span className="inline-block">Loading</span>
          <span className="inline-block ml-1 animate-pulse">.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        </p>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <svg 
            className="w-16 h-16 text-talklink-500 animate-pulse" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
        </div>
        <p className="text-slate-300 text-lg font-medium">
          <span className="inline-block">Loading</span>
          <span className="inline-block ml-1 animate-pulse">.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="inline-block animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        </p>
      </div>
    </div>
  );
}
