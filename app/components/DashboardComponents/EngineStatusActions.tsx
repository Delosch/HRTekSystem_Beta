import { useNavigate } from "@remix-run/react";


type EngineStatus = "Draft" | "In Progress" | "Completed";

interface Props {
  engineStatus: EngineStatus;
  param: string;
}

const getStatusColor = (status: EngineStatus): string => {
  switch (status) {
    case "Draft":
      return "bg-gray-400";
    case "In Progress":
      return "bg-yellow-400";
    case "Completed":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

export default function EngineStatusActions({ engineStatus, param }: Props) {
  const isCompleted = engineStatus === "Completed";
  const isDraft = engineStatus === "Draft";
  const isInProgress = engineStatus === "In Progress";
  const navigate = useNavigate();

  const handleModifyResponse = () => {
    // Navigate to the engine to modify responses
    navigate(`/engine/${param}`);
  };

  const handleDownloadResponse = async () => {
    try {
      // Fetch the assessment data and download as JSON
      const response = await fetch(`/api/assessment/download?engine=${encodeURIComponent(param)}`);

      if (!response.ok) {
        // Fallback: Create a simple download with engine name
        const data = {
          engine: param,
          status: engineStatus,
          downloadedAt: new Date().toISOString(),
          message: "Assessment response data"
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${param.replace(/\s+/g, '_')}_response.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${param.replace(/\s+/g, '_')}_response.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading response:", error);
      alert("Failed to download response. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${getStatusColor(engineStatus)}`}></span>
        <span className="text-sm font-semibold text-gray-600">{engineStatus}</span>
      </div>
      <button
        className={`${isCompleted ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"} text-white text-sm px-4 py-1.5 rounded-md font-medium`}
        disabled={isCompleted}
        onClick={() => { navigate(`/engine/${param}`) }}
      >
        {isDraft ? "Start" : "Continue"}
      </button>
      <button
        className={`${isDraft ? "bg-gray-300 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"} text-white text-sm px-4 py-1.5 rounded-md font-medium`}
        disabled={isDraft}
        onClick={handleModifyResponse}
      >
        Modify Response
      </button>
      <button
        className={`${isCompleted ? "bg-teal-500 hover:bg-teal-600" : "bg-gray-300 cursor-not-allowed"} text-white text-sm px-4 py-1.5 rounded-md font-medium`}
        disabled={!isCompleted}
        onClick={handleDownloadResponse}
      >
        Download Response
      </button>
    </div>
  );
}
