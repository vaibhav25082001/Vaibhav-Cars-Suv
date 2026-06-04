import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function useApi(url, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const execute = useCallback(async (override = {}) => {
    if (!url) return null;
    setLoading(true); setError(null);
    try {
      const response = await api({ url, method: options.method || "get", params: options.params, data: options.body, ...override });
      setData(response.data?.data ?? response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally { setLoading(false); }
  }, [url, JSON.stringify(options.params), JSON.stringify(options.body), options.method]);
  useEffect(() => { if (options.auto !== false) execute().catch(() => {}); }, [execute, options.auto]);
  return { data, loading, error, execute, setData };
}
