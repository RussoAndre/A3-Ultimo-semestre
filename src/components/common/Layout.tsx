import { ReactNode, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import Header from './Header'
import Sidebar from './Sidebar'
import SkipLink from './SkipLink'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink href="#main-content">{t('accessibility.skipToMain')}</SkipLink>
      <SkipLink href="#navigation">{t('accessibility.skipToNav')}</SkipLink>
      
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main id="main-content" className="flex-1 overflow-y-auto" role="main" tabIndex={-1}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
