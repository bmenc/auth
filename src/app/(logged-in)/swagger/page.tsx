"use client";
import { useEffect, useState } from "react";
import { Spinner } from "@blueprintjs/core";
import dynamic from "next/dynamic";

// Importar SwaggerUI dinámicamente para evitar problemas de SSR
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

interface SwaggerSpec extends Record<string, unknown> {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, unknown>;
}

export default function SwaggerPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        const response = await fetch('/api/swagger');
        if (response.ok) {
          const spec = await response.json();
          setSwaggerSpec(spec);
        } else {
          setError('Failed to load Swagger specification');
        }
      } catch {
        setError('Error loading Swagger specification');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaggerSpec();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={50} />
      </div>
    );
  }

  if (error || !swaggerSpec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load Swagger specification'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <SwaggerUI spec={swaggerSpec} />
    </div>
  );
}
