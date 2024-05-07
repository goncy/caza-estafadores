import {headers} from "next/headers";
import {put} from "@vercel/blob";
import {kv} from "@vercel/kv";
import {redirect} from "next/navigation";

import IdPageClient from "./page.client";

export default function IdPage({params: {id}}: {params: {id: string}}) {
  async function save(
    formData: FormData,
    location: {latitude: number; longitude: number},
    exif: Record<string, unknown>,
  ) {
    "use server";

    const image = formData.get("image") as File;
    const {url} = await put(`/${id}/${image.name}`, image, {access: "public"});

    formData.delete("image");

    await kv.set(id, {
      id,
      image: url,
      formData,
      location,
      exif,
      headers: Object.fromEntries(headers()),
    });

    redirect("/success");
  }

  return <IdPageClient save={save} />;
}
