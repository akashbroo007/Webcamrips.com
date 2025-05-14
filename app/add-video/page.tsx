import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AddExternalVideoForm from '@/app/components/AddExternalVideoForm';

export default async function AddVideoPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and has admin role
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login?callbackUrl=/add-video');
  }
  
  return (
    <div className="container mx-auto py-8">
      <AddExternalVideoForm />
    </div>
  );
} 