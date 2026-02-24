import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireSuperAdmin } from '~/lib/auth.server';
import { createSupabaseServiceClient } from '~/lib/supabase.server';

interface PrescriptionStats {
  totalBlocks: number;
  totalIssued: number;
  totalSigned: number;
  issuedThisMonth: number;
  signedThisMonth: number;
  issuedToday: number;
  signedToday: number;
}

interface RecentPrescription {
  id: string;
  prescriptionNumber: string;
  issuedAt: string;
  signed: boolean;
  userEmail: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Require superadmin access
  await requireSuperAdmin(request);
  
  // Use service client to bypass RLS
  const supabase = createSupabaseServiceClient();

  console.log('=== PRESCRIPTIONS LOADER (SUPERADMIN) ===');

  try {
    // Get aggregate stats for ALL users
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Count total blocks
    const { count: totalBlocks } = await supabase
      .from('prescription_blocks')
      .select('*', { count: 'exact', head: true });

    // Count total issued
    const { count: totalIssued } = await supabase
      .from('issued_prescriptions')
      .select('*', { count: 'exact', head: true });

    // Count total signed
    const { count: totalSigned } = await supabase
      .from('signed_prescriptions')
      .select('*', { count: 'exact', head: true });

    // Count issued this month
    const { count: issuedThisMonth } = await supabase
      .from('issued_prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('issued_at', monthStart.toISOString());

    // Count signed this month
    const { count: signedThisMonth } = await supabase
      .from('signed_prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('signed_at', monthStart.toISOString());

    // Count issued today
    const { count: issuedToday } = await supabase
      .from('issued_prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('issued_at', `${today}T00:00:00`)
      .lte('issued_at', `${today}T23:59:59`);

    // Count signed today
    const { count: signedToday } = await supabase
      .from('signed_prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('signed_at', `${today}T00:00:00`)
      .lte('signed_at', `${today}T23:59:59`);

    const stats: PrescriptionStats = {
      totalBlocks: totalBlocks || 0,
      totalIssued: totalIssued || 0,
      totalSigned: totalSigned || 0,
      issuedThisMonth: issuedThisMonth || 0,
      signedThisMonth: signedThisMonth || 0,
      issuedToday: issuedToday || 0,
      signedToday: signedToday || 0,
    };

    console.log('Aggregate stats:', stats);

    // Get recent issued prescriptions with user info
    const { data: issuedData, error: issuedError } = await supabase
      .from('issued_prescriptions')
      .select(`
        id, 
        prescription_number, 
        issued_at,
        user_id,
        profiles!inner(email)
      `)
      .order('issued_at', { ascending: false })
      .limit(50);

    console.log('Issued prescriptions query result:', { 
      count: issuedData?.length || 0, 
      error: issuedError,
      sample: issuedData?.[0] 
    });

    if (issuedError) {
      console.error('Error loading issued prescriptions:', issuedError);
    }

    // Get all signed prescription IDs
    const { data: signedData, error: signedError } = await supabase
      .from('signed_prescriptions')
      .select('issued_prescription_id');

    console.log('Signed prescriptions query result:', { 
      count: signedData?.length || 0, 
      error: signedError 
    });

    if (signedError) {
      console.error('Error loading signed prescriptions:', signedError);
    }

    const signedIds = new Set(signedData?.map(s => s.issued_prescription_id) || []);

    const recentPrescriptions: RecentPrescription[] = (issuedData || []).map(p => ({
      id: p.id,
      prescriptionNumber: p.prescription_number,
      issuedAt: p.issued_at,
      signed: signedIds.has(p.id),
      userEmail: (p.profiles as any)?.email || 'Unknown',
    }));

    console.log('Final data:', { stats, prescriptionsCount: recentPrescriptions.length });
    console.log('=== END DEBUG ===');

    return json({ stats, recentPrescriptions });
  } catch (error) {
    console.error('Error in prescriptions loader:', error);
    // Return empty data instead of throwing
    return json({
      stats: {
        totalBlocks: 0,
        totalIssued: 0,
        totalSigned: 0,
        issuedThisMonth: 0,
        signedThisMonth: 0,
        issuedToday: 0,
        signedToday: 0,
      },
      recentPrescriptions: [],
    });
  }
}

export default function PrescriptionsPage() {
  const { stats, recentPrescriptions } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescripciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estadísticas globales y seguimiento de todas las prescripciones emitidas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Talonarios (Total)"
          value={stats.totalBlocks}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Recetas Emitidas (Total)"
          value={stats.totalIssued}
          icon="📝"
          color="green"
        />
        <StatCard
          title="Recetas Firmadas (Total)"
          value={stats.totalSigned}
          icon="✍️"
          color="purple"
        />
        <StatCard
          title="Firmadas Hoy"
          value={stats.signedToday}
          icon="📅"
          color="orange"
        />
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Este Mes</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Emitidas</span>
                <span className="text-2xl font-semibold text-gray-900">
                  {stats.issuedThisMonth}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Firmadas</span>
                <span className="text-2xl font-semibold text-purple-600">
                  {stats.signedThisMonth}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900">Hoy</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Emitidas</span>
                <span className="text-2xl font-semibold text-gray-900">
                  {stats.issuedToday}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Firmadas</span>
                <span className="text-2xl font-semibold text-purple-600">
                  {stats.signedToday}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Prescripciones Recientes (Todos los Usuarios)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Receta
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Emisión
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay prescripciones registradas
                    </td>
                  </tr>
                ) : (
                  recentPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prescription.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prescription.prescriptionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prescription.issuedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prescription.signed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Firmada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
