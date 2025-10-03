import { useState, useEffect } from 'react';
import { ProgramData } from '@/lib/google-sheets';

interface FilterOptions {
  teams: string[];
  priorities: string[];
  owners: string[];
  statuses: string[];
}

export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    teams: [],
    priorities: [],
    owners: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/programs');
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/programs?action=filter-options');
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPrograms(), fetchFilterOptions()]);
    };
    
    loadData();
  }, []);

  const refreshData = () => {
    fetchPrograms();
  };

  return {
    programs,
    filterOptions,
    loading,
    error,
    refreshData,
  };
}


