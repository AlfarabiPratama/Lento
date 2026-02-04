/**
 * Habit Form Validation Schemas
 * 
 * Zod schemas for habit creation and editing
 */

import { z } from 'zod'

export const habitSchema = z.object({
    name: z
        .string()
        .min(1, 'Nama kebiasaan wajib diisi')
        .min(3, 'Nama kebiasaan minimal 3 karakter')
        .max(100, 'Nama kebiasaan maksimal 100 karakter'),
    
    description: z
        .string()
        .max(500, 'Deskripsi maksimal 500 karakter')
        .optional(),
    
    reminder_enabled: z.boolean().optional(),
    
    reminder_time: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM)')
        .nullable()
        .optional(),
    
    reminder_days: z
        .array(z.number().min(0).max(6))
        .nullable()
        .optional(),
})

export const journalSchema = z.object({
    content: z
        .string()
        .min(1, 'Konten jurnal wajib diisi')
        .min(10, 'Jurnal minimal 10 karakter untuk refleksi yang bermakna')
        .max(10000, 'Jurnal maksimal 10,000 karakter'),
    
    mood: z
        .enum(['great', 'good', 'okay', 'bad', 'awful'])
        .nullable()
        .optional(),
    
    type: z
        .enum(['quick', 'daily', 'gratitude', 'reflection'])
        .default('quick'),
})

export const transactionSchema = z.object({
    amount: z
        .number({
            required_error: 'Jumlah transaksi wajib diisi',
            invalid_type_error: 'Jumlah harus berupa angka',
        })
        .positive('Jumlah harus lebih dari 0')
        .max(999999999, 'Jumlah terlalu besar'),
    
    description: z
        .string()
        .min(1, 'Deskripsi wajib diisi')
        .max(200, 'Deskripsi maksimal 200 karakter'),
    
    category: z
        .string()
        .min(1, 'Kategori wajib dipilih'),
    
    date: z
        .string()
        .min(1, 'Tanggal wajib diisi'),
    
    notes: z
        .string()
        .max(500, 'Catatan maksimal 500 karakter')
        .optional(),
})

export const billSchema = z.object({
    name: z
        .string()
        .min(1, 'Nama tagihan wajib diisi')
        .min(3, 'Nama tagihan minimal 3 karakter')
        .max(100, 'Nama tagihan maksimal 100 karakter'),
    
    amount: z
        .number({
            required_error: 'Jumlah tagihan wajib diisi',
            invalid_type_error: 'Jumlah harus berupa angka',
        })
        .positive('Jumlah harus lebih dari 0')
        .max(999999999, 'Jumlah terlalu besar'),
    
    dueDate: z
        .string()
        .min(1, 'Tanggal jatuh tempo wajib diisi'),
    
    category: z
        .string()
        .min(1, 'Kategori wajib dipilih'),
    
    recurring: z.boolean().optional(),
    
    recurringInterval: z
        .enum(['weekly', 'monthly', 'yearly'])
        .optional(),
    
    notes: z
        .string()
        .max(500, 'Catatan maksimal 500 karakter')
        .optional(),
})

export const notebookSchema = z.object({
    title: z
        .string()
        .min(1, 'Judul notebook wajib diisi')
        .min(3, 'Judul minimal 3 karakter')
        .max(100, 'Judul maksimal 100 karakter'),
    
    description: z
        .string()
        .max(500, 'Deskripsi maksimal 500 karakter')
        .optional(),
    
    emoji: z
        .string()
        .emoji('Harus berupa emoji valid')
        .optional(),
})
