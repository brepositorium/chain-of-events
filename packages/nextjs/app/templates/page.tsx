"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { get, ref } from "firebase/database";
import Card from "~~/components/BaseCard";
import { database } from "~~/utils/chain-of-events/firebaseConfig";

interface Template {
  id: string;
  name: string;
  description: string;
  linkToRemix: string;
}

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const templatesRef = ref(database, "templates");
      const snapshot = await get(templatesRef);
      if (snapshot.exists()) {
        const templatesWithIds = Object.entries(snapshot.val()).map(([id, template]) => ({
          ...(template as Template),
          id,
        }));
        setTemplates(templatesWithIds);
      } else {
        console.log("No templates available.");
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="container mx-auto px-11 md:px-20 xl:px-40">
        <div className="flex flex-col md:flex-row my-8 justify-between">
          <h1 className="text-2xl font-bold">Events created by you</h1>
          <Link href="/new-template" className="btn btn-primary rounded-xl w-36 border">
            Add Template
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template: Template, index) => (
            <Card className="w-72 bg-secondary-content rounded-lg flex flex-col">
              <div className="flex flex-col items-center h-full pt-2 justify-between">
                <div className="overflow-hidden" style={{ maxHeight: "4rem" }}>
                  <h2 className="text-center text-lg font-extrabold text-ellipsis">{template.name}</h2>
                </div>
                <h2 className="text-center text-ellipsis ">
                  Template's ID: <p className="font-bold">{template.id}</p>
                </h2>
                <p className="font-poppins">{template.description}</p>
                <div className="flex gap-2 flex-wrap justify-evenly mt-4">
                  <div className="shadow hover:shadow-xl">
                    <Link href={template.linkToRemix} className="btn btn-primary rounded-xl w-36 border-0">
                      View on Remix
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
