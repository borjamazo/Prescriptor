import { supabase } from '../services/SupabaseService';

/**
 * Service to sync prescription data with Supabase
 * Tracks: prescription blocks, issued prescriptions, and signed prescriptions
 */
export const SupabaseSyncService = {
  /**
   * Sync a prescription block import to Supabase
   */
  async syncPrescriptionBlock(
    blockSerial: string,
    totalPrescriptions: number,
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, skipping block sync');
        return;
      }

      const { error } = await supabase
        .from('prescription_blocks')
        .insert({
          user_id: user.id,
          block_serial: blockSerial,
          total_prescriptions: totalPrescriptions,
        });

      if (error) {
        console.error('Error syncing prescription block:', error);
        throw error;
      }

      console.log('Prescription block synced successfully');
    } catch (error) {
      console.error('Failed to sync prescription block:', error);
      // Don't throw - allow offline usage
    }
  },

  /**
   * Sync an issued prescription to Supabase
   */
  async syncIssuedPrescription(
    prescriptionNumber: string,
    blockId?: string,
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, skipping issued prescription sync');
        return null;
      }

      // Don't send blockId to Supabase - it's a local ID, not a UUID
      // We only track the prescription number
      const { data, error } = await supabase
        .from('issued_prescriptions')
        .insert({
          user_id: user.id,
          prescription_number: prescriptionNumber,
          // block_id is omitted - we don't have the Supabase block UUID
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error syncing issued prescription:', error);
        throw error;
      }

      console.log('Issued prescription synced successfully');
      return data?.id || null;
    } catch (error) {
      console.error('Failed to sync issued prescription:', error);
      // Don't throw - allow offline usage
      return null;
    }
  },

  /**
   * Sync a signed prescription to Supabase
   */
  async syncSignedPrescription(
    prescriptionNumber: string,
    issuedPrescriptionId?: string,
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, skipping signed prescription sync');
        return;
      }

      const { error } = await supabase
        .from('signed_prescriptions')
        .insert({
          user_id: user.id,
          prescription_number: prescriptionNumber,
          issued_prescription_id: issuedPrescriptionId || null,
        });

      if (error) {
        console.error('Error syncing signed prescription:', error);
        throw error;
      }

      console.log('Signed prescription synced successfully');
    } catch (error) {
      console.error('Failed to sync signed prescription:', error);
      // Don't throw - allow offline usage
    }
  },

  /**
   * Get user prescription stats from Supabase
   */
  async getUserStats(): Promise<{
    totalBlocks: number;
    totalIssued: number;
    totalSigned: number;
    issuedThisMonth: number;
    signedThisMonth: number;
    issuedToday: number;
    signedToday: number;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, cannot get stats');
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_user_prescription_stats', { p_user_id: user.id });

      if (error) {
        console.error('Error getting user stats:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalBlocks: 0,
          totalIssued: 0,
          totalSigned: 0,
          issuedThisMonth: 0,
          signedThisMonth: 0,
          issuedToday: 0,
          signedToday: 0,
        };
      }

      const stats = data[0];
      return {
        totalBlocks: stats.total_blocks || 0,
        totalIssued: stats.total_issued || 0,
        totalSigned: stats.total_signed || 0,
        issuedThisMonth: stats.issued_this_month || 0,
        signedThisMonth: stats.signed_this_month || 0,
        issuedToday: stats.issued_today || 0,
        signedToday: stats.signed_today || 0,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  },
};
