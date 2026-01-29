import React from "react";
import { AiToolsData } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const AiTools = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Powerful AI tools
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Everything you need to create with AI.
        </p>
      </div>

      <div className="flex flex-wrap mt-10 justify-center">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            className="p-8 m-4 max-w-xs rounded-lg shadow cursor-pointer"
            onClick={() => navigate(tool.path)}
          >
            <tool.Icon className="w-12 h-12 p-3 text-white rounded-xl" />
            <h3 className="mt-6 mb-3 text-lg font-semibold">{tool.title}</h3>
            <p className="text-gray-400 text-sm">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;
