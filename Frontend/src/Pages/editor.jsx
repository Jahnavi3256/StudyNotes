// src/App.jsx
import React, { useState } from "react";
import RichTextEditor from "../components/RichTextEditor";

export default function Editor() {
  const [content, setContent] = useState("");

  return (

    <div className="h-full w-full">
      {/* RTE Component */}
      <RichTextEditor

        value={content}
        onChange={setContent}
        dark={false}
      />

    </div>


  );
}
