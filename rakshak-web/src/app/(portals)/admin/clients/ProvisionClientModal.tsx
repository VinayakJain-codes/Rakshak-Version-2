'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import AddClientForm from '../AddClientForm'

export function ProvisionClientModal() {
 const [isOpen, setIsOpen] = useState(false)

 return (
 <>
 <button 
 onClick={() => setIsOpen(true)}
 className="flex items-center gap-2 px-4 py-2 bg-[#2d3a5e] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a5e]/90 transition-colors shadow-sm"
 >
 <Plus className="w-4 h-4" />
 Provision Client
 </button>

 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
 <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
 <button 
 onClick={() => setIsOpen(false)}
 className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface/5 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 <div className="p-2">
 <AddClientForm />
 </div>
 </div>
 </div>
 )}
 </>
 )
}
