"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { nombreCookie, validarClave } from "@/lib/panel-acceso";
import { demasiadoSeguido } from "@/lib/rsvp";

export type EstadoIngreso = { error: string } | null;

export async function ingresar(slug: string, _previo: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";

  // Cinco intentos cada diez minutos: alcanza para quien se equivoca de tecla
  // y frena a quien prueba claves de a montones.
  if (demasiadoSeguido("panel:" + ip, 5)) return { error: "Demasiados intentos. Probá en unos minutos." };

  const valor = validarClave(slug, String(datos.get("clave") ?? ""));
  if (!valor) return { error: "Esa clave no es." };

  (await cookies()).set(nombreCookie(slug), valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120,
  });

  redirect(`/panel/${slug}`);
}
