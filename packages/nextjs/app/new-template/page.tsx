"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { push, ref, set } from "firebase/database";
import { database } from "~~/utils/chain-of-events/firebaseConfig";

const NewTemplatePage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkToRemix, setLinkToRemix] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    if (!linkToRemix.includes("remix.ethereum.org")) {
      setFormError("Please use valid link to Remix");
      return;
    }
    const templatesRef = ref(database, "templates");
    const newTemplateRef = push(templatesRef);
    await set(newTemplateRef, {
      name,
      description,
      linkToRemix,
    });
    router.push("/templates");
  };

  return (
    <div className="bg-circles bg-contain bg-center bg-no-repeat">
      <form className="flex flex-col items-center gap-6 mt-8">
        <div className="mr-40 mt-4 text-xl font-bold justify-center px-4">
          <h1>Add new template</h1>
        </div>
        <div className="">
          <input
            className="input input-md input-bordered w-80 bg-base-content rounded text-black"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="">
          <textarea
            className="textarea textarea-bordered w-80 bg-base-content rounded text-black"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="flex flex-col">
          <input
            className="input input-md input-bordered w-80 bg-base-content rounded text-black"
            type="text"
            value={linkToRemix}
            onChange={e => setLinkToRemix(e.target.value)}
            placeholder="Link to Remix"
          />
          {formError && <span className="text-error text-sm">{formError}</span>}
        </div>
        <div className="ml-36">
          <button type="button" className="btn btn-gradient-primary rounded-xl w-36" onClick={handleSave}>
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTemplatePage;
