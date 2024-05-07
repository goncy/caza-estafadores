"use client";

import Link from "next/link";
import Image from "next/image";
import {useState} from "react";
import * as ExifReader from "exifreader";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import demo from "@/assets/demo.webp";

export default function IdPageClient({
  save,
}: {
  save: (
    formData: FormData,
    location: {latitude: number; longitude: number},
    exif: Record<string, unknown>,
  ) => Promise<void>;
}) {
  const [preview, setPreview] = useState<File>();
  const [location, setLocation] = useState<{latitude: number; longitude: number}>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get("image") as File;
    const exif = await ExifReader.load(file);

    await save(formData, location!, JSON.parse(JSON.stringify(exif)) as Record<string, unknown>);
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <Label className="grid gap-2">
        <span>Monto a transferir</span>
        <Input required max={30000} min={0} name="amount" placeholder="30000" type="number" />
      </Label>
      <Label className="grid gap-2">
        <span>CVU / CBU / Alias</span>
        <Input required name="destination" placeholder="TITA.TUPLA.BIOCA" type="text" />
      </Label>
      <Label className="grid gap-2">
        <span>Imágen</span>
        <div className="flex gap-3">
          <Image
            alt="tuki"
            className="aspect-square rounded bg-white object-contain p-1"
            height={190}
            src={demo}
            width={190}
          />
          <div className="relative">
            {Boolean(preview) ? (
              <Image
                alt="tuki"
                className="absolute inset-[2px] aspect-square h-full w-full rounded bg-white object-contain p-1"
                height={186}
                src={URL.createObjectURL(preview!)}
                width={186}
              />
            ) : (
              <div className="pointer-events-none absolute inset-[2px] z-10 grid h-[186px] w-[186px] place-content-center bg-background">
                Subir imágen
              </div>
            )}
            <Input
              required
              accept="image/*"
              capture="user"
              className="h-[190px] w-[190px]"
              name="image"
              type="file"
              onChange={(event) => {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setPreview(event.target.files?.[0]);
                    setLocation({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    });
                  },
                  () => {
                    alert(
                      `No se pudo verificar que el usuario se encontrara en Argentina para poder validar la transferencia`,
                    );

                    event.target.value = "";
                  },
                  {
                    enableHighAccuracy: true,
                  },
                );
              }}
            />
          </div>
        </div>
      </Label>
      <Label className="flex items-center gap-2">
        <Checkbox required name="tos" />
        Acepto los{" "}
        <Link className="underline" href="/tos">
          términos y condiciones
        </Link>
      </Label>
      <Button type="submit">Enviar dinero</Button>
    </form>
  );
}
