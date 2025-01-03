// next-urza-frontend\frontend\src\components\urza\main-content-wrapper.tsx

import React from "react"

interface MainContentWrapperProps {
    children: React.ReactNode
}

export const MainContentWrapper: React.FC<MainContentWrapperProps> = ({ children }) => {
    return (
        <div className="p-4">
            {children}
        </div>
    )
}
