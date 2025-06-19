export const ENDPOINTS = {
    // Authentication
    REGISTER: "/akun/register",
    LOGIN: "/akun/login", 
    LOGOUT: "/akun/logout", 
    FORGOT_PASSWORD: "/akun/forgot-password",
    CHANGE_PASSWORD: (id) => `/akun/change-password/${id}`,
    SEND_VERIFICATION_EMAIL: '/akun/send-verification-email',

    // Alamat Pembeli
    GET_ALL_ALAMAT_PEMBELI: "/alamat-pembeli",
    CREATE_ALAMAT_PEMBELI: "/alamat-pembeli",
    SHOW_ALAMAT_PEMBELI: (id) => `/alamat-pembeli/${id}`,
    SEARCH_ALAMAT_PEMBELI_BY_PEMBELI: (id) => `/alamat-pembeli/byIdPembeli/${id}`,
    UPDATE_ALAMAT_PEMBELI: (id) => `/alamat-pembeli/${id}`,
    DELETE_ALAMAT_PEMBELI: (id) => `/alamat-pembeli/${id}`,

    // Akun
    GET_ALL_AKUN: "/akun",
    CREATE_AKUN: "/akun", 
    SHOW_AKUN: (id) => `/akun/${id}`,
    UPDATE_AKUN: (id) => `/akun/${id}`,
    DELETE_AKUN: (id) => `/akun/${id}`,

    // Pembeli
    GET_ALL_PEMBELI: "/pembeli",
    CREATE_PEMBELI: "/pembeli",
    SHOW_PEMBELI: (id) => `/pembeli/${id}`,
    UPDATE_PEMBELI: (id) => `/pembeli/${id}`,
    DELETE_PEMBELI: (id) => `/pembeli/${id}`,
    SEARCH_PEMBELI_BY_AKUN: (id) => `/pembeli/byIdAkun/${id}`,
    UPDATE_POIN_PEMBELI: (id) => `/pembeli/${id}/poin`,

    // Organisasi Amal
    GET_ALL_ORGANISASI_AMAL: "/organisasi-amal",
    CREATE_ORGANISASI_AMAL: "/organisasi-amal",
    SHOW_ORGANISASI_AMAL: (id) => `/organisasi-amal/${id}`,
    UPDATE_ORGANISASI_AMAL: (id) => `/organisasi-amal/${id}`,
    DELETE_ORGANISASI_AMAL: (id) => `/organisasi-amal/${id}`,
    GET_ORGANISASI_AMAL_BY_AKUN: (id) => `/organisasi-amal/byIdAkun/${id}`,

    // Pegawai
    GET_ALL_PEGAWAI: "/pegawai",
    CREATE_PEGAWAI: "/pegawai",
    SHOW_PEGAWAI: (id) => `/pegawai/${id}`,
    UPDATE_PEGAWAI: (id) => `/pegawai/${id}`,
    DELETE_PEGAWAI: (id) => `/pegawai/${id}`,
    SEARCH_PEGAWAI_BY_AKUN: (id) => `/pegawai/byIdAkun/${id}`,

    // Penitip
    GET_ALL_PENITIP: "/penitip",
    GET_ALL_PENITIP_CUSTOM: "/penitip/custom",
    CREATE_PENITIP: "/penitip",
    SHOW_PENITIP: (id) => `/penitip/${id}`,
    UPDATE_PENITIP: (id) => `/penitip/${id}`,
    DELETE_PENITIP: (id) => `/penitip/${id}`,
    SEARCH_PENITIP_BY_AKUN: (id) => `/penitip/byIdAkun/${id}`,
    ADD_KEUNTUNGAN_PENITIP: (id) => `/penitip/add-keuntungan/${id}`,


    // Penitipan
    GET_ALL_PENITIPAN: "/penitipan",
    CREATE_PENITIPAN: "/penitipan",
    SHOW_PENITIPAN: (id) => `/penitipan/${id}`,
    GET_PENITIPAN_BY_BARANG: (id) => `/penitipan/byIdBarang/${id}`,
    UPDATE_PENITIPAN: (id) => `/penitipan/${id}`,
    DELETE_PENITIPAN: (id) => `/penitipan/${id}`,
    GET_ALL_PENITIPAN_BY_ID_PENITIP: (id) => `/penitipan/byIdPenitip/${id}`,
    GET_ITEM_FOR_SCHEDULING: (id) => `/penitipan/item-for-scheduling/${id}`,
    ITEM_FOR_SCHEDULING: (id) => `/penitipan/item-for-scheduling/${id}`,
    CONFIRM_RECEIPT: (id) => `/penitipan/confirm-receipt/${id}`,
    SCHEDULE_PICKUP: (id) => `/penitipan/schedule-pickup/${id}`,
    GET_PENITIPAN_BY_STATUS: (status) => `/penitipan/byStatus/${status}`,
    SCHEDULE_PENITIPAN_PICKUP: (id) => `/penitipan/schedule-penitipan-pickup/${id}`,
    CONFIRM_PENITIPAN_PICKUP: (id) => `/penitipan/confirm-penitipan-pickup/${id}`,
    
    // Barang
    GET_ALL_BARANG: "/barang",
    GET_ALL_BARANG_GARANSI: "/barang/garansi/",
    CREATE_BARANG: "/barang",
    SHOW_BARANG: (id) => `/barang/${id}`,
    UPDATE_BARANG: (id) => `/barang/${id}`,
    DELETE_BARANG: (id) => `/barang/${id}`,

    // Pembelian
    GET_ALL_PEMBELIAN: "/pembelian",
    CREATE_PEMBELIAN: "/pembelian",
    SHOW_PEMBELIAN: (id) => `/pembelian/${id}`,
    UPDATE_PEMBELIAN: (id) => `/pembelian/${id}`,
    DELETE_PEMBELIAN: (id) => `/pembelian/${id}`,
    GET_PEMBELIAN_BY_PEMBELI: (id) => `/pembelian/byIdPembeli/${id}`,
    GET_PEMBELIAN_BY_PENITIP: (id) => `/pembelian/byIdPenitip/${id}`,

    // Pengiriman
    GET_ALL_PENGIRIMAN: "/pengiriman",
    CREATE_PENGIRIMAN: "/pengiriman",
    SHOW_PENGIRIMAN: (id) => `/pengiriman/${id}`,
    UPDATE_PENGIRIMAN: (id) => `/pengiriman/${id}`,
    DELETE_PENGIRIMAN: (id) => `/pengiriman/${id}`,
    UPDATE_PENGIRIMAN_STATUS: (id) => `/pengiriman/update-status/${id}`,

    // Transaksi
    GET_ALL_TRANSAKSI: "/transaksi",
    CREATE_TRANSAKSI: "/transaksi",
    SHOW_TRANSAKSI: (id) => `/transaksi/${id}`,
    UPDATE_TRANSAKSI: (id) => `/transaksi/${id}`,
    DELETE_TRANSAKSI: (id) => `/transaksi/${id}`,

    // Review Produk
    GET_ALL_REVIEW_PRODUK: `/review-produk`,
    SHOW_REVIEW_PRODUK: (id) => `$/review-produk/${id}`,
    CREATE_REVIEW_PRODUK: `/review-produk`,
    UPDATE_REVIEW_PRODUK: `/review-produk`,
    DELETE_REVIEW_PRODUK: `/review-produk`,
    GET_REVIEW_BY_ID_TRANSAKSI: `/review-produk/byIdTransaksi`,
    GET_REVIEW_BY_ID_BARANG: `/review-produk/byIdBarang`,

    // Diskusi Produk
    GET_ALL_DISKUSI_PRODUK: `/diskusi-produk`,
    SHOW_DISKUSI_PRODUK: (id) => `/diskusi-produk/${id}`,
    CREATE_DISKUSI_PRODUK: `/diskusi-produk`,
    UPDATE_DISKUSI_PRODUK: `/diskusi-produk`,
    DELETE_DISKUSI_PRODUK: `/diskusi-produk`,
    GET_DISKUSI_BY_ID_BARANG: `/diskusi-produk/byIdBarang`,

    // Keranjang
    GET_ALL_KERANJANG: "/keranjang",
    CREATE_KERANJANG: "/keranjang",
    SHOW_KERANJANG: (id) => `/keranjang/${id}`,
    SHOW_KERANJANG_BY_ID_PEMBELI: (id) => `/keranjang/byIdPembeli/${id}`,
    UPDATE_KERANJANG: (id) => `/keranjang/${id}`,
    DELETE_KERANJANG: (id) => `/keranjang/${id}`,

    // Request Donasi
    GET_ALL_REQUEST_DONASI: "/request-donasi",
    CREATE_REQUEST_DONASI: "/request-donasi",
    SHOW_REQUEST_DONASI: (id) => `/request-donasi/${id}`,
    UPDATE_REQUEST_DONASI: (id) => `/request-donasi/${id}`,
    DELETE_REQUEST_DONASI: (id) => `/request-donasi/${id}`,
    GET_REQUEST_DONASI_BY_ORGANISASI: (id) => `/request-donasi/byIdOrganisasi/${id}`,

    // Merchandise
    GET_ALL_MERCHANDISE: "/merchandise",
    CREATE_MERCHANDISE: "/merchandise",
    SHOW_MERCHANDISE: (id) => `/merchandise/${id}`,
    UPDATE_MERCHANDISE: (id) => `/merchandise/${id}`,
    DELETE_MERCHANDISE: (id) => `/merchandise/${id}`,

    // Merchandise
    GET_ALL_DONASI_BARANG: "/donasi-barang",
    CREATE_DONASI_BARANG: "/donasi-barang",
    SHOW_DONASI_BARANG: (id) => `/donasi-barang/${id}`,
    SHOW_DONASI_BARANG_BY_REQUEST_PRODUK: (id) => `/donasi-barang/byIdRequest/${id}`,
    UPDATE_DONASI_BARANG: (id) => `/donasi-barang/${id}`,
    DELETE_DONASI_BARANG: (id) => `/donasi-barang/${id}`,

    // Claim Merchandise
    GET_ALL_CLAIM_MERCHANDISE: "/claim-merchandise",
    GET_ALL_CLAIM_MERCHANDISE_CUSTOM: "/claim-merchandise/custom",
    CREATE_CLAIM_MERCHANDISE: "/claim-merchandise",
    SHOW_CLAIM_MERCHANDISE: (id) => `/claim-merchandise/${id}`,
    UPDATE_CLAIM_MERCHANDISE: (id) => `/claim-merchandise/${id}`,
    DELETE_CLAIM_MERCHANDISE: (id) => `/claim-merchandise/${id}`,

    // SubPembelian
    GET_ALL_SUB_PEMBELIAN: "/sub-pembelian",
    CREATE_SUB_PEMBELIAN: "/sub-pembelian",
    SHOW_SUB_PEMBELIAN: (id) => `/sub-pembelian/${id}`,
    UPDATE_SUB_PEMBELIAN: (id) => `/sub-pembelian/${id}`,
    DELETE_SUB_PEMBELIAN: (id) => `/sub-pembelian/${id}`,
    GET_SUB_PEMBELIAN_BY_PEMBELIAN: (id_pembelian) => `/sub-pembelian/by-pembelian/${id_pembelian}`,
    GET_SUB_PEMBELIAN_BY_PEMBELI: (id_pembeli) => `/sub-pembelian/byIdPembeli/${id_pembeli}`, 
    GET_SUB_PEMBELIAN_BY_PENITIP: (id_penitip) => `/sub-pembelian/byIdPenitip/${id_penitip}`,

    SEND_NOTIFICATION: "/notification/sendPushNotification",
    SEND_BULK_NOTIFICATION: "/notification/sendBulkNotifications",
};