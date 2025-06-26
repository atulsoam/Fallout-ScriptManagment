import React, { useEffect, useState } from "react";
import ScriptCard from "./ScriptCard";

const ScriptList = ({handleDeleteScript,handleUpdateScript,scripts}) => {
    

    return (
        <div className="w-full">
            {scripts.length === 0 ? (
                <p className="text-gray-500">No scripts uploaded yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {scripts.map((script) => (
                        <ScriptCard
                            key={script.id}
                            script={script}
                            onUpdate={handleUpdateScript}
                            onDelete={handleDeleteScript}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScriptList;
