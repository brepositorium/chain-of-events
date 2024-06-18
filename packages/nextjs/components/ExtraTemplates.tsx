"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { get, push, ref, set } from "firebase/database";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { getExtraOwner } from "~~/utils/chain-of-events/deployContract";
import { database } from "~~/utils/chain-of-events/firebaseConfig";

interface LocalTemplate {
  key: string;
  templateId: string;
  deployedAddresses: string[];
}

interface GlobalTemplate {
  id: string;
  name?: string;
  description?: string;
  linkToRemix?: string;
}

interface FullTemplate extends LocalTemplate {
  name?: string;
  description?: string;
  linkToRemix?: string;
}

interface ExtraTemplatesProps {
  extraAddress: string;
}

const ExtraTemplates: React.FC<ExtraTemplatesProps> = ({ extraAddress }) => {
  const [templates, setTemplates] = useState<FullTemplate[]>([]);
  const [newTemplateId, setNewTemplateId] = useState<string>("");
  const [newAddresses, setNewAddresses] = useState<Record<string, string>>({});

  const { address } = useAccount();

  useEffect(() => {
    if (extraAddress) {
      fetchExtraTemplates();
    }
  }, [extraAddress]);

  const fetchExtraTemplates = async () => {
    const templateRef = ref(database, `extraTemplates/${extraAddress}`);
    const snapshot = await get(templateRef);

    if (snapshot.exists()) {
      const entries = Object.entries(snapshot.val()) as [string, LocalTemplate][];
      const templatesWithDetails = entries.map(([key, value]) => ({
        key,
        templateId: value.templateId,
        deployedAddresses: value.deployedAddresses || [],
      }));

      fetchGlobalTemplates(templatesWithDetails);
    } else {
      console.log("No templates found for this extra.");
    }
  };

  const fetchGlobalTemplates = async (localTemplates: FullTemplate[]) => {
    const fetches = localTemplates.map(async template => {
      const globalRef = ref(database, `templates/${template.templateId}`);
      const snapshot = await get(globalRef);
      if (snapshot.exists()) {
        const { name, description, linkToRemix } = snapshot.val() as GlobalTemplate;
        return { ...template, name, description, linkToRemix };
      }
      return template;
    });

    Promise.all(fetches).then(setTemplates);
  };

  const handleAddTemplate = async () => {
    if (address !== (await getExtraOwner(extraAddress))) {
      toast.error("You are not the owner");
      return;
    }
    const templateRef = ref(database, `extraTemplates/${extraAddress}`);
    const newTemplateRef = push(templateRef);
    await set(newTemplateRef, {
      templateId: newTemplateId,
      deployedAddresses: [],
    });
    setNewTemplateId("");
    fetchExtraTemplates();
  };

  const handleAddAddress = async (templateKey: string) => {
    if (address !== (await getExtraOwner(extraAddress))) {
      toast.error("You are not the owner");
      return;
    }
    const specificTemplateRef = ref(database, `extraTemplates/${extraAddress}/${templateKey}/deployedAddresses`);
    const snapshot = await get(specificTemplateRef);
    let addresses = [];
    if (snapshot.exists()) {
      addresses = snapshot.val();
    }
    addresses.push(newAddresses[templateKey]);

    await set(specificTemplateRef, addresses);

    setNewAddresses(prev => ({ ...prev, [templateKey]: "" }));
    fetchExtraTemplates();
  };

  const handleAddressChange = (templateKey: string, value: string) => {
    setNewAddresses(prev => ({ ...prev, [templateKey]: value }));
  };

  return (
    <div className="flex flex-col mt-4 w-full">
      <h1 className="text-lg font-bold text-center md:text-left md:ml-20">Manage Templates</h1>
      <div className="flex flex-col md:flex-row gap-8 my-4 mb-12 items-center justify-center">
        <input
          className="input input-sm input-bordered rounded bg-secondary w-40 md:w-80"
          type="text"
          placeholder="Template ID"
          value={newTemplateId}
          onChange={e => setNewTemplateId(e.target.value)}
        />
        <button className="btn btn-primary rounded btn-sm" onClick={handleAddTemplate}>
          Add Template
        </button>
      </div>
      <h1 className="text-lg font-bold text-center md:text-left md:ml-20">Added templates</h1>
      <ul>
        {templates.map(template => (
          <li className="shadow-3xl p-4 mt-2 bg-base-200 rounded-xl " key={template.key}>
            <div className="flex flex-col md:flex-row items-center md:ml-8 mt-2 justify-between">
              <span className="font-bold">Template ID:</span> <span>{template.templateId}</span>
              <Link
                href={template.linkToRemix || "#"}
                className="btn btn-primary rounded btn-sm w-32 md:mr-8"
                target="_blank"
                rel="noopener noreferrer"
              >
                View in Remix
              </Link>
            </div>
            <div className="flex flex-col my-4 ml-8">
              <p>
                <span className="font-bold">Name:</span>{" "}
                <span className="font-poppins">
                  {template.name || "Template not found. Please make sure the ID matches with a valid template"}
                </span>
              </p>
              <p>
                <span className="font-bold">Description:</span>{" "}
                <span className="font-poppins">{template.name || "N/A"}</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 my-4 ml-8">
              <h1 className="font-bold">Deployed at these addresses:</h1>
              <ul>
                {template.deployedAddresses.map((address, index) => (
                  <li key={index}>
                    <span className="font-poppins">{address}</span>
                  </li>
                ))}
              </ul>
            </div>
            {template.name ? (
              <div className="flex flex-col md:flex-row gap-8 my-4 justify-center items-center">
                <input
                  type="text"
                  placeholder="Deployed Address"
                  className="input input-sm input-bordered rounded bg-secondary w-40 md:w-80"
                  value={newAddresses[template.key] || ""}
                  onChange={e => handleAddressChange(template.key, e.target.value)}
                />
                <button className="btn btn-primary rounded btn-sm" onClick={() => handleAddAddress(template.key)}>
                  Add Address
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExtraTemplates;
