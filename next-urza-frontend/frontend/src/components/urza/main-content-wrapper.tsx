// next-urza-frontend\frontend\src\components\urza\main-content-wrapper.tsx

interface MainContentWrapperProps {
    children: React.ReactNode
  }
  
  export function MainContentWrapper({ children }: MainContentWrapperProps) {
    return (
      <div className="p-6 space-y-4">
        {children}
      </div>
    )
  }
  