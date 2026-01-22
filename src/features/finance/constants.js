// @ts-check

/**
 * Lento Finance - Constants
 * 
 * Icons, types, categories, payment methods
 * All Tabler icons: size=24, stroke=2 (default)
 */

import {
    IconWallet,
    IconCash,
    IconBuildingBank,
    IconDeviceMobile,
    IconArrowUpRight,
    IconArrowDownRight,
    IconArrowsExchange,
    IconPlus,
    IconSearch,
    IconFilter,
    IconCloudCheck,
    IconLoader2,
    IconCloudOff,
    IconAlertTriangle,
    IconQrcode,
    IconCreditCard,
    IconX,
} from '@tabler/icons-react'

// ===== ICONS =====

export const FinanceIcons = {
    // Accounts
    account: IconWallet,
    cash: IconCash,
    bank: IconBuildingBank,
    ewallet: IconDeviceMobile,

    // Transaction types
    income: IconArrowUpRight,
    expense: IconArrowDownRight,
    transfer: IconArrowsExchange,

    // Actions
    add: IconPlus,
    search: IconSearch,
    filter: IconFilter,
    close: IconX,

    // Sync status
    synced: IconCloudCheck,
    syncing: IconLoader2,
    offline: IconCloudOff,
    error: IconAlertTriangle,

    // Payment methods
    qris: IconQrcode,
    card: IconCreditCard,
}

// ===== ACCOUNT TYPES =====

export const ACCOUNT_TYPES = {
    cash: {
        label: 'Cash',
        icon: '💵',
        IconComponent: IconCash,
    },
    bank: {
        label: 'Bank',
        icon: '🏦',
        IconComponent: IconBuildingBank,
    },
    ewallet: {
        label: 'E-Wallet',
        icon: '📱',
        IconComponent: IconDeviceMobile,
    },
}

// ===== E-WALLET PROVIDERS =====

export const EWALLET_PROVIDERS = [
    { id: 'gopay', name: 'GoPay', icon: '🟢', color: '#00AA13' },
    { id: 'dana', name: 'DANA', icon: '🔵', color: '#118EEA' },
    { id: 'ovo', name: 'OVO', icon: '🟣', color: '#4C3494' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '🟠', color: '#EE4D2D' },
    { id: 'linkaja', name: 'LinkAja', icon: '🔴', color: '#E82529' },
    { id: 'other', name: 'Lainnya', icon: '📱', color: '#6B7280' },
]

// ===== PAYMENT METHODS =====

export const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'qris', label: 'QRIS', icon: '📱' },
    { id: 'transfer', label: 'Transfer', icon: '🏦' },
    { id: 'debit', label: 'Debit', icon: '💳' },
    { id: 'credit', label: 'Credit', icon: '💳' },
    { id: 'ewallet', label: 'E-Wallet', icon: '📱' },
]

// ===== CATEGORIES (Mahasiswa-friendly) =====

export const DEFAULT_CATEGORIES = {
    income: [
        { name: 'Uang saku', icon: '💰' },
        { name: 'Beasiswa', icon: '🎓' },
        { name: 'Gaji/Freelance', icon: '💼' },
        { name: 'Hadiah', icon: '🎁' },
        { name: 'Refund', icon: '↩️' },
    ],
    expense: [
        { name: 'Makan & jajan', icon: '🍽️' },
        { name: 'Transport', icon: '🚗' },
        { name: 'Kos/kontrakan', icon: '🏠' },
        { name: 'Pulsa & data', icon: '📶' },
        { name: 'Kuliah', icon: '📚' },
        { name: 'Nongkrong', icon: '☕' },
        { name: 'Langganan', icon: '📺' },
        { name: 'Kesehatan', icon: '💊' },
        { name: 'Donasi', icon: '❤️' },
        { name: 'Lainnya', icon: '📦' },
    ],
}

// ===== TRANSACTION TYPES =====

export const TXN_TYPES = {
    income: {
        label: 'Pemasukan',
        labelShort: 'Masuk',
        color: 'green',
        colorClass: 'text-green-500',
        bgClass: 'bg-green-100',
        IconComponent: IconArrowUpRight,
    },
    expense: {
        label: 'Pengeluaran',
        labelShort: 'Keluar',
        color: 'red',
        colorClass: 'text-red-500',
        bgClass: 'bg-red-100',
        IconComponent: IconArrowDownRight,
    },
    transfer: {
        label: 'Transfer',
        labelShort: 'Transfer',
        color: 'primary',
        colorClass: 'text-primary',
        bgClass: 'bg-primary-50',
        IconComponent: IconArrowsExchange,
    },
}

// ===== SYNC STATES =====

export const SYNC_STATES = {
    synced: {
        label: 'Tersinkron',
        IconComponent: IconCloudCheck,
        colorClass: 'text-green-500',
    },
    syncing: {
        label: 'Menyinkronkan...',
        IconComponent: IconLoader2,
        colorClass: 'text-primary',
        animate: true,
    },
    offline: {
        label: 'Offline',
        IconComponent: IconCloudOff,
        colorClass: 'text-ink-muted',
    },
    error: {
        label: 'Error',
        IconComponent: IconAlertTriangle,
        colorClass: 'text-red-500',
    },
}

// ===== EMPTY STATE COPY =====

export const EMPTY_STATES = {
    noAccounts: {
        title: 'Biar tracking gampang, mulai dari bikin dompet.',
        description: 'Dompet bisa Cash, Bank, atau E-Wallet.',
        primaryCta: 'Tambah Dompet',
    },
    noTransactions: {
        title: 'Catat yang kecil dulu.',
        description: 'Ritme kebentuk dari yang konsisten.',
        primaryCta: 'Tambah Pengeluaran',
        secondaryCta: 'Tambah Pemasukan',
    },
    noFilterResults: {
        title: 'Belum ada transaksi untuk filter ini.',
        description: 'Coba hapus filter atau ganti bulan.',
        primaryCta: 'Reset Filter',
    },
}

// ===== BREAKPOINTS =====

export const BREAKPOINTS = {
    mobile: 600,   // < 600px = bottom sheet
    desktop: 1024, // >= 1024px = 2-pane layout
}
