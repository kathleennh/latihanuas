"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
export type FormState = {
    sukses: boolean;
    pesan: string;
    galat?: { nama?: string; email?: string };
    values?: { nama: string; email: string; pesan: string };
};
export async function simpanPendaftar(
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    // 1. Ambil data dari form
    const nama = String(formData.get("nama") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const pesan = String(formData.get("pesan") ?? "").trim();
    const values = { nama, email, pesan };
    // 2. Validasi di server
    const galat: NonNullable<FormState["galat"]> = {};
    if (nama.length < 3) galat.nama = "Nama minimal 3 karakter.";
    if (!/^\S+@\S+\.\S+$/.test(email)) galat.email = "Format email tidak valid.";
    if (Object.keys(galat).length > 0) {
        return { sukses: false, pesan: "Periksa kembali isian Anda.", galat, values };
    }
    // 3. Simpan ke database
    try {
        await prisma.pendaftar.create({
            data: { nama, email, pesan: pesan || null },
        });
    } catch (e) {
        // P2002 = pelanggaran kolom @unique
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return {
                sukses: false,
                pesan: "Gagal menyimpan.",
                galat: { email: "Email ini sudah terdaftar." },
                values,
            };
        }
        return { sukses: false, pesan: "Terjadi kesalahan di server.", values };
    }
    // 4. Segarkan halaman agar data baru langsung tampil
    revalidatePath("/");
    return { sukses: true, pesan: "Data berhasil disimpan!" };
}
