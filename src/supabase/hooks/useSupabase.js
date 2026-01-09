import { useState } from "react";

export const useSupabase = (
  config = {
    onError: (obj={}) => {},
    onSuccess: (obj={}) => {},
    onRequestService: () => {},
  }
) => {
  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [data, setData] = useState(null);

  const { onError, onSuccess, onRequestService } = config || {};

  const onRequest = async (...params) => {
    setLoading(true);

    setError(null);

    await onRequestService(...params)
      .then((response) => {
        console.log(response);
        setData(response);

        setError(null);
        setLoading(false);
        onSuccess?.(response);
      })
      .catch((error) => {
        setData(null);
        setError(error);
        onError?.(error);
        setLoading(false);
      });

    setLoading(false);
  };

  return { isLoading, error, data, onRequest, setError };
};