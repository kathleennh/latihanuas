import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
async function DataPendaftar({ params }: { params: Promise<{ id: string }> }) {
    // 1. Baca parameter dari URL (di Next.js 15+ params berupa Promise)
    const { id } = await params;
    // 2. Parameter selalu berupa string, ubah ke angka dan validasi
    const nomor = Number(id);
    if (!Number.isInteger(nomor)) notFound();
    // 3. Ambil satu data dari database
    const p = await prisma.pendaftar.findUnique({ where: { id: nomor } });
    if (!p) notFound(); // data tidak ada, tampilkan halaman 404
    return (
        <>
            <h1 className='mt-4 text-2xl font-bold'>{p.nama}</h1>
            <p className='text-gray-600'>{p.email}</p>
            {p.pesan && <p className='mt-3'>{p.pesan}</p>}
            <p className='mt-3 text-xs text-gray-400'>
                ID: {p.id} | Dibuat: {p.createdAt.toLocaleString("id-ID")}
            </p>
        </>
    );
}
export default function DetailPendaftar({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <main className='mx-auto max-w-xl p-6'>
            <Link href='/' className='text-sm text-blue-600 underline'>
                &larr; Kembali
            </Link>
            <Suspense fallback={<p className='mt-4 text-gray-500'>Memuat data...</p>}>
                <DataPendaftar params={params} />
            </Suspense>
        </main>
    );
}