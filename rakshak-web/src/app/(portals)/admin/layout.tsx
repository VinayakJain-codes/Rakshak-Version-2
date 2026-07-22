import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/utils/auth-check'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminTopNav } from '@/components/admin/TopNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const { user, role } = await getUserWithRole()

 if (!user || role !== 'SUPER_ADMIN') {
 redirect('/auth/login')
 }

 return (
 <div className="flex min-h-screen bg-background text-foreground">
 <AdminSidebar />
 <div className="flex-1 flex flex-col min-w-0">
 <AdminTopNav />
 <main className="flex-1 p-6 lg:p-8 bg-background overflow-y-auto">
 {children}
 </main>
 </div>
 </div>
 )
}
